import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Create a custom HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // WARNING: Only use this if you understand the security implications!
});

/**
 * @swagger
 * /api/proxy/credential:
 *   post:
 *     summary: Proxies a credential request to a specified credential service
 *     description: Forwards the incoming request to the credential endpoint and returns the response from that service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: JSON payload for credential issuance or verification.
 *     responses:
 *       200:
 *         description: Successfully received response from the credential service.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: The response body returned from the credential service.
 *       500:
 *         description: Error occurred while trying to proxy the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to proxy request
 */

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
