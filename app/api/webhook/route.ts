import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import QRCode from 'qrcode';

export const runtime = 'edge';

export async function POST(request: Request) {
  // Initialize Stripe at runtime, not build time
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('✅ Payment received!');
    console.log('📧 Customer email:', session.customer_email);
    console.log('💰 Amount:', (session.amount_total || 0) / 100);
    console.log('📦 Metadata:', session.metadata);

    const { mode, url, prompt } = session.metadata || {};
    const customerEmail = session.customer_email;

    if (!mode || !url || !prompt || !customerEmail) {
      console.error('Missing metadata');
      return NextResponse.json({ received: true });
    }

    try {
      // Generate basic QR
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        width: 1024,
        margin: 2,
      });

      const enhancedPrompt = `highly detailed QR code art, scannable, ${prompt}`;

      // Generate artistic QR with Fal.ai
      const falResponse = await fetch('https://fal.run/fal-ai/illusion-diffusion', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_url: qrDataUrl,
          qr_code_content: url,
          guidance_scale: 8.5,
          num_inference_steps: 50,
          strength: 0.75,
          controlnet_conditioning_scale: 1.5,
        }),
      });

      if (!falResponse.ok) {
        throw new Error('Fal.ai generation failed');
      }

      const falData = await falResponse.json();
      const imageUrl = falData.image?.url || falData.images?.[0]?.url;

      if (!imageUrl) {
        throw new Error('No image generated');
      }

      console.log('✅ QR generated:', imageUrl);
      console.log('📧 TODO: Email to', customerEmail);
      console.log('📧 Manual delivery: Save this URL and email it to customer');

    } catch (error) {
      console.error('❌ Generation error:', error);
    }
  }

  return NextResponse.json({ received: true });
}
