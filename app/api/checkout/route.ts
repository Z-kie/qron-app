import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Dynamic import to avoid build-time initialization
    const Stripe = (await import('stripe')).default;
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    const { mode, email } = await request.json();

    if (!mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const plan = PLANS.find(p => p.id === mode);

    if (!plan) {
        return NextResponse.json(
            { error: 'Invalid plan' },
            { status: 400 }
        );
    }

    const priceInCents = plan.price * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QRON ${plan.name}`,
              description: `AI-generated QR code pack`,
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
        planId: plan.id,
      },
      customer_email: email,
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
