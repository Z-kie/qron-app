import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import QRCode from 'qrcode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Dynamic import of SendGrid to avoid build issues
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid not configured, skipping email');
    return;
  }

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'undone.k@gmail.com',
      subject,
      html,
    });
    console.log('✅ Email sent to:', to);
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
  }
}

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
    console.log('📧 Customer:', session.customer_email);
    console.log('💰 Amount:', (session.amount_total || 0) / 100);

    const { mode, url, prompt } = session.metadata || {};
    const customerEmail = session.customer_email;

    if (!mode || !url || !prompt || !customerEmail) {
      console.error('Missing metadata');
      return NextResponse.json({ received: true });
    }

    try {
      // Generate QR
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

      // Send email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .qr-image { max-width: 100%; height: auto; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your QRON QR Code is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Thank you for using QRON! Your AI-generated QR code has been created and is ready to download.</p>
              
              <h3>Your QR Code:</h3>
              <img src="${imageUrl}" alt="Your QR Code" class="qr-image" />
              
              <p><strong>Destination URL:</strong> ${url}</p>
              <p><strong>Mode:</strong> ${mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
              
              <center>
                <a href="${imageUrl}" class="button" download>Download High-Res QR Code</a>
              </center>
              
              <p>Simply right-click the QR code above and "Save Image As" to download, or click the button.</p>
              
              <h4>💡 Tips:</h4>
              <ul>
                <li>Test your QR code with multiple devices</li>
                <li>Print at high resolution for best scanning results</li>
                <li>Use on business cards, posters, packaging, and more!</li>
              </ul>
              
              <p>Need more QR codes? Visit <a href="https://qron-dqlaihpf0-authichain.vercel.app">QRON Generator</a></p>
            </div>
            <div class="footer">
              <p>QRON - AI-Powered QR Code Generator</p>
              <p>Questions? Reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        customerEmail,
        '🎉 Your QRON QR Code is Ready!',
        emailHtml
      );

      console.log('✅ Order completed successfully');

    } catch (error: any) {
      console.error('❌ Generation error:', error.message);
    }
  }

  return NextResponse.json({ received: true });
}