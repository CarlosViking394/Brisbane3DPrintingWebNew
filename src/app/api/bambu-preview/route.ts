import { NextRequest, NextResponse } from 'next/server';

// Proxy the uploaded model to the Bambu Labs slicing service which returns a
// model including generated supports. The Bambu service endpoint and API key
// are provided via environment variables.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiUrl = process.env.BAMBU_API_URL;
    const apiKey = process.env.BAMBU_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Bambu API not configured' },
        { status: 500 }
      );
    }

    const upstream = await fetch(`${apiUrl}/preview`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: file,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: text || 'Bambu service error' },
        { status: upstream.status }
      );
    }

    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type':
          upstream.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to contact Bambu service' },
      { status: 500 }
    );
  }
}
