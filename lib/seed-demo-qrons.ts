// lib/seed-demo-qrons.ts
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Load environment variables (ensure .env.local is configured)
// For a standalone script, you might need a different way to load, or pass directly.
// For this example, we assume it's run in a Node.js environment where these are accessible.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dbwoikpflfruikspdnfc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid29pa3BmbGZydWlrc3BkbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTY0NzcsImV4cCI6MjA4MDA3MjQ3N30.hV2g1fZvRt70eWlslOgXexvlrjWmwh1IgelyGK0Em2I';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid29pa3BmbGZydWlrc3BkbmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ5NjQ3NywiZXhwIjoyMDgwMDcyNDc3fQ.gsZlk-tkUpkbRINZe1BH2Yr-NJXHNWNuVPTbkJLo5uA';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
  console.error('Supabase environment variables are not set. Please check your .env.local file.');
  process.exit(1);
}

// Use the service role key for seeding from the backend/script
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const demoQrons = [
  {
    filename: '4YWkS1WctnnNk1dV_w453_c98067fcc7934cf1913bcc156c52fb40.png',
    ai_prompt: 'futuristic city skyline, neon lights, cyberpunk aesthetic, high detail',
    mode: 'static',
    qr_content: 'https://qron.art/demo/futuristic-city',
  },
  {
    filename: '6SGu_6VkjFt0A4BbPV14B_6e3b8dd61d944422abd80d72b1623a23.png',
    ai_prompt: 'abstract flowing lines, digital art, vibrant colors, energy flow',
    mode: 'stereographic',
    qr_content: 'https://qron.art/demo/abstract-flow',
  },
  {
    filename: '9oWVtYc5eoLK_k1XNVNeV_9f40c266800743b7bb3a784514d63b41.png',
    ai_prompt: 'enchanted forest, mystical glow, fantasy art, glowing mushrooms',
    mode: 'static',
    qr_content: 'https://qron.art/demo/enchanted-forest',
  },
  {
    filename: 'knight in shining armor.png',
    ai_prompt: 'knight in shining armor, watercolor style, medieval fantasy, epic scene',
    mode: 'static',
    qr_content: 'https://qron.art/demo/knight-armor',
  },
  {
    filename: 'mjKO4M46EIphUt4ge1YmK_5bc1f10b875f4dc1871267f6b5465d3a.png',
    ai_prompt: 'cosmic nebula, star field, deep space, celestial patterns',
    mode: 'stereographic',
    qr_content: 'https://qron.art/demo/cosmic-nebula',
  },
  {
    filename: 'MrtbdsNUt9m400lb9SuVV_b004178e571b457cbe9681a99775b86e.png',
    ai_prompt: 'underwater coral reef, vibrant marine life, ocean depths, serene seascape',
    mode: 'static',
    qr_content: 'https://qron.art/demo/coral-reef',
  },
  {
    filename: 'nO7XHOfdWzp2ToHsyfDHA_7dc5a8702d334b149adad25782547c09.png',
    ai_prompt: 'futuristic glowing pathways, digital network, intricate patterns, Tron style',
    mode: 'kinetic',
    qr_content: 'https://qron.art/demo/digital-pathways',
  },
  {
    filename: 'spacex launch.png',
    ai_prompt: 'spacex rocket launch, dramatic smoke, starry night, realistic photography',
    mode: 'static',
    qr_content: 'https://qron.art/demo/spacex-launch',
  },
  {
    filename: 'sq5NuR5hd2hOPKMxC8J_p_f55523196b214ef196e421dabc52a794.png',
    ai_prompt: 'ancient Egyptian hieroglyphs, desert sunset, pyramid, mystical symbols',
    mode: 'stereographic',
    qr_content: 'https://qron.art/demo/egyptian-hieroglyphs',
  },
  {
    filename: 'Z44NP7h6GIXt0qvAUiIuR_d13bc916cb7f4e9cbd9fa38570fb3aae (1).png',
    ai_prompt: 'vibrant abstract painting, splash art, dynamic colors, modern art gallery',
    mode: 'static',
    qr_content: 'https://qron.art/demo/abstract-painting',
  },
  {
    filename: 'Z44NP7h6GIXt0qvAUiIuR_d13bc916cb7f4e9cbd9fa38570fb3aae.png',
    ai_prompt: 'colorful geometric mosaic, intricate patterns, stained glass effect, digital design',
    mode: 'static',
    qr_content: 'https://qron.art/demo/geometric-mosaic',
  },
];

async function seedDemoQrons() {
  console.log('Starting demo QRON seeding...');

  // Check if a demo user exists, if not, create one.
  // For simplicity, we'll assign all demo QRONs to a hardcoded UUID user ID.
  // In a real app, you might create a dedicated 'demo' user via auth.
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID

  for (const qronData of demoQrons) {
    const { filename, ai_prompt, mode, qr_content } = qronData;
    const storage_path = `/demo-qrons/${filename}`;
    const id = uuidv4();

    const { data, error } = await supabase
      .from('qrons')
      .insert([
        {
          id: id,
          user_id: DEMO_USER_ID,
          mode: mode,
          target_url: qr_content,
          qr_content: qr_content,
          prompt: ai_prompt,
          image_url: storage_path,
          storage_path: storage_path,
          is_demo: true,
          scan_count: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Duplicate key error
        console.warn(`Skipping duplicate entry for ${filename}`);
      } else {
        console.error(`Error seeding QRON ${filename}:`, error);
      }
    } else {
      console.log(`Successfully seeded QRON: ${filename}`);
    }
  }

  console.log('Demo QRON seeding complete.');
}

// To run this script:
// 1. Ensure you have Node.js installed.
// 2. Set your Supabase environment variables in a .env.local file or directly in your environment.
// 3. You might need to install 'uuid' and '@supabase/supabase-js': `npm install uuid @supabase/supabase-js`
// 4. Run `npx ts-node lib/seed-demo-qrons.ts` (if ts-node is installed) or compile and run.
//    (For simplicity, you might adapt this to run directly as a Next.js API route if preferred, but a standalone script is often cleaner for seeding.)

// Execute the seeding function
seedDemoQrons().catch(console.error);
