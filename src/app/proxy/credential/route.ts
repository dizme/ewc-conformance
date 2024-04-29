import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Create a custom HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // WARNING: Only use this if you understand the security implications!
});

export async function POST(req: NextRequest) {
  const credentialEndpoint = `${process.env.ISSUER_URL}/credential`;

  try {
    const headers = new Headers(req.headers);
    const rawBody = await req.text();

    const apiResponse = await fetch(credentialEndpoint, {
      method: 'POST',
      headers: headers,
      body: rawBody,
    });

    if (!apiResponse.ok) {
      throw new Error(`HTTP error! Status: ${apiResponse.status}`);
    }

    const responseHeaders = new Headers();
    const responseBody = await apiResponse.json();
    Object.entries(apiResponse.headers).forEach(([key, value]) => responseHeaders.set(key, value.toString()));

    return new NextResponse(JSON.stringify(responseBody), {
      status: apiResponse.status,
      headers: new Headers(responseHeaders),
    });
  } catch (error) {
    console.error("Failed to proxy request:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to proxy request" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
