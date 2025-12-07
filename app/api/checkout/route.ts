import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Dynamic import to avoid build-time initialization
    const Stripe = (await import('stripe')).default;
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia' as any,
    });

    const { mode, url, prompt } = await request.json();

    if (!mode || !url || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prices: Record<string, number> = {
      classic: 5,
      '3d': 10,
      motion: 10,
      nebula: 10,
      cascade: 12,
      prism: 12,
      holographic: 15,
      phantom: 15,
      video: 30,
    };

    const priceInCents = (prices[mode] || 10) * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QRON ${mode.toUpperCase()} QR Code`,
              description: `AI-generated QR code pointing to: ${url}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}`,
      metadata: {
        mode,
        url,
        prompt,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
