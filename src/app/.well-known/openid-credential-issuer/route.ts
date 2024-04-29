import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const wellKnownUrl = `${process.env.ISSUER_URL}/.well-known/openid-credential-issuer`;

  try {
    const response = await fetch(wellKnownUrl);

    // Check if the HTTP request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const wellKnownData = await response.json();
    const baseUrl = process.env.BASE_URL || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;

    wellKnownData.issuer = baseUrl
    wellKnownData.credential_issuer = baseUrl+"/.well-known/openid-credential-issuer"
    // TODO: At the moment the credential does not work
    // wellKnownData.credential_endpoint = baseUrl+"/proxy/credential"

    return new NextResponse(JSON.stringify(wellKnownData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to fetch well-known data:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
