import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { url, prompt, mode } = await request.json();

    if (!url || !prompt || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate basic QR code as base
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
    });

    // For preview, return watermarked version
    return NextResponse.json({
      imageUrl: qrDataUrl,
      message: 'Preview generated - pay to get high-res artistic version',
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
