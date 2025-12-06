import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import QRCode from 'qrcode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const { mode, url, prompt } = session.metadata!;
    const customerEmail = session.customer_email;

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 1024,
      margin: 2,
    });

    // Enhance prompt
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

    // Send email with QR code
    await sendDeliveryEmail(customerEmail!, imageUrl, mode, url);

    // Store in database (optional - add Supabase later)
    // await storeOrder(session.id, customerEmail, mode, url, imageUrl);

    console.log('✅ QR generated and sent to:', customerEmail);
  }
from: undone.k@gmail.com,
  return NextResponse.json({ received: true });
}

async function sendDeliveryEmail(
  email: string,
  imageUrl: string,
  mode: string,
  destinationUrl: string
) {
  // Using SendGrid (install: npm install @sendgrid/mail)
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: 'orders@qron.app', // Your verified sender
    subject: '🎉 Your QRON QR Code is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Your QRON QR Code</h1>
        <p>Thank you for your purchase! Your ${mode} QR code is ready.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <img src="${imageUrl}" alt="Your QR Code" style="max-width: 100%; border-radius: 8px;">
        </div>
        
        <p><strong>Destination URL:</strong> ${destinationUrl}</p>
        
        <p>
          <a href="${imageUrl}" 
             download="qron-${mode}.png" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download High-Res Image
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Need another QR code? Visit <a href="https://your-domain.com">QRON.app</a>
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent to:', email);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}
