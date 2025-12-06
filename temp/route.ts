import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import QRCode from 'qrcode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('✅ Payment received!');
    console.log('Customer:', session.customer_email);
    console.log('Amount:', session.amount_total);
    console.log('Metadata:', session.metadata);

    const { mode, url, prompt } = session.metadata || {};

    if (mode && url && prompt) {
      try {
        // Generate QR
        const qrDataUrl = await QRCode.toDataURL(url, {
          errorCorrectionLevel: 'H',
          width: 1024,
          margin: 2,
        });

        const enhancedPrompt = `highly detailed QR code art, scannable, ${prompt}`;

        // Call Fal.ai
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

        const falData = await falResponse.json();
        const imageUrl = falData.image?.url || falData.images?.[0]?.url;

        console.log('✅ QR generated:', imageUrl);
        console.log('📧 TODO: Send email to:', session.customer_email);
        console.log('📧 For now, save this URL manually and email it');

      } catch (error: any) {
        console.error('Generation error:', error.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}