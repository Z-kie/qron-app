import { NextResponse } from 'next/server';
import Stripe from 'stripe';
export const runtime = 'edge';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const PRICES: { [key: string]: number } = {
  classic: 500,
  stereographic: 1000,
  kinetic: 1000,
  holographic: 1500,
  phantom: 1500,
  cascade: 1200,
  prism: 1200,
  nebula: 1000,
  video: 3000,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, url, prompt, email } = body;

    console.log('Checkout request:', { mode, url, email });

    const priceInCents = PRICES[mode] || 1500;
    const priceInDollars = priceInCents / 100;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QRON ${mode.charAt(0).toUpperCase() + mode.slice(1)} QR Code`,
              description: `AI-generated QR code for ${url}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?canceled=true`,
      customer_email: email,
      metadata: {
        mode,
        url,
        prompt,
      },
    });

    console.log('Session created:', session.id);
    console.log('Checkout URL:', session.url);

    return NextResponse.json({ 
      success: true,
      sessionId: session.id, 
      url: session.url 
    });
    
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Payment setup failed' 
      },
      { status: 500 }
    );
  }
}
