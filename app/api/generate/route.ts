import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MODES, FalaiPreset } from '@/lib/types'; // Import MODES and FalaiPreset

// Ensure FAL_AI_KEY is set in environment variables
if (!process.env.FAL_AI_KEY) {
    console.warn("FAL_AI_KEY environment variable not set. QRON generation will fail.");
}
if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.warn("NEXT_PUBLIC_BASE_URL environment variable not set. Tracking URL generation will be incorrect.");
}

export const runtime = 'edge';

// Helper to check if user's tier is sufficient for a given feature tier
const isTierSufficient = (userTier: string, requiredTier: string) => {
  if (requiredTier === 'free') return true;
  if (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) return true;
  if (requiredTier === 'enterprise' && userTier === 'enterprise') return true;
  return false;
};

// Main POST handler for generating QRONs
export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Await the client creation

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Fetch user's profile for tier and generation limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier, generations_used, generations_limit')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ message: 'Could not fetch user profile.' }, { status: 500 });
    }

    // 1. Parse request body
    const { targetUrl, prompt: userPrompt, presetId, mode } = await request.json(); // Also get mode from body

    // 2. Validate inputs
    if (!targetUrl) {
      return NextResponse.json({ message: 'Destination URL is required' }, { status: 400 });
    }
    if (!userPrompt) {
        return NextResponse.json({ message: 'A descriptive prompt is required' }, { status: 400 });
    }
    if (!process.env.FAL_AI_KEY) {
        return NextResponse.json({ message: 'Image generation is currently disabled. Please contact support.' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
        return NextResponse.json({ message: 'Base URL for tracking is not configured.' }, { status: 500 });
    }

    // --- Server-side Tier and Limit Checks ---
    // Generation Limit Check
    if (profile.tier !== 'enterprise' && profile.generations_used >= profile.generations_limit) {
      return NextResponse.json({ message: `Generation limit reached (${profile.generations_used}/${profile.generations_limit}). Upgrade to increase your limit.` }, { status: 403 });
    }

    // Mode Tier Check
    const selectedModeConfig = MODES.find(m => m.id === mode);
    if (!selectedModeConfig) {
      return NextResponse.json({ message: 'Invalid QRON mode selected.' }, { status: 400 });
    }
    if (!isTierSufficient(profile.tier, selectedModeConfig.tier)) {
      return NextResponse.json({ message: `Upgrade to ${selectedModeConfig.tier.toUpperCase()} to use the ${mode} QRON mode.` }, { status: 403 });
    }

    // Fetch presets from API (or define locally if static)
    const presetsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/presets`);
    const allPresets: FalaiPreset[] = await presetsResponse.json();
    const selectedPreset = allPresets.find(p => p.id === presetId);

    if (!selectedPreset) {
        return NextResponse.json({ message: 'Invalid preset selected.' }, { status: 400 });
    }

    // Preset Tier Check
    if (selectedPreset.is_premium && !isTierSufficient(profile.tier, 'pro')) { // Assuming premium presets are 'pro' tier or higher
      return NextResponse.json({ message: 'Upgrade to PRO to use premium style presets.' }, { status: 403 });
    }
    // --- End Server-side Tier and Limit Checks ---

    // 3. Enhance prompt based on the selected preset
    let finalPrompt = userPrompt;
    const selectedStyle = selectedPreset.name; // Use preset name as style
    switch (presetId) {
        case 'preset_1': // Vibrant Flow
            finalPrompt = `a vibrant, colorful, flowing, ${userPrompt}`;
            break;
        case 'preset_3': // Subtle Hues
            finalPrompt = `a minimalist, soft, subtle, ${userPrompt}`;
            break;
        // Add more cases for other presets and their corresponding style names
    }

    // 4. Generate a high-contrast, scannable base QR code image URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=768x768&data=${encodeURIComponent(targetUrl)}&ecc=H&margin=20&format=png`;

    // 5. Call the fal.ai "Illusion Diffusion" model
    const result = await fal.run("fal-ai/illusion-diffusion", {
        input: {
            prompt: finalPrompt,
            image_url: qrCodeUrl,
            negative_prompt: "text, letters, blurry, low contrast, noisy, jpeg artifacts",
        }
    });

    // 6. Validate the result from fal.ai
    if (!result?.data?.image?.url) {
        throw new Error('Image generation failed at the AI service.');
    }

    const qronId = uuidv4();
    const falaiImageUrl = result.data.image.url;

    let encodedQrUrl: string;
    if (mode === 'living') {
      encodedQrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/living-art/${qronId}`;
    } else {
      encodedQrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/track-scan/${qronId}`;
    }

    // 7. Save QRON details to Supabase
    const { error: dbError } = await supabase
      .from('qrons')
      .insert({
        id: qronId,
        user_id: user.id,
        mode: mode,
        target_url: targetUrl,
        image_url: falaiImageUrl, // Store the actual fal.ai image URL
        prompt: finalPrompt,
        style: selectedStyle, // Store the style name
      });

    if (dbError) {
      console.error('Error saving QRON to database:', dbError);
      return NextResponse.json({ message: 'Failed to save QRON details.' }, { status: 500 });
    }

    // Increment generation count
    const { error: incrementError } = await supabase.rpc('increment_generation_count', { user_uuid: user.id });
    if (incrementError) {
        console.error('Error incrementing generation count:', incrementError);
        // Do not block response if increment fails
    }

    // 8. Construct the final QRON object for the client
    const qron = {
      id: qronId,
      imageUrl: encodedQrUrl, // Return the tracking or living-art URL
      destinationUrl: targetUrl,
      prompt: finalPrompt,
    };

    // 9. Return the successful response
    return NextResponse.json({ qron });

  } catch (error) {
    console.error("[QRON Generation Error]", error);
    const message = error instanceof Error ? error.message : "Generation failed due to an unexpected error.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// Optional: Add a GET handler for basic testing or health checks
export async function GET() {
    return NextResponse.json({
        message: "QRON Generator is active. Use POST to create a QRON.",
        status: "ok"
    });
}