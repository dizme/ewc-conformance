import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/.well-known/openid-credential-issuer:
 *   get:
 *     summary: Fetches the well-known OpenID configuration for the credential issuer
 *     description: Returns the OpenID configuration modified to reflect the correct issuer and credential endpoints based on the environment.
 *     responses:
 *       200:
 *         description: OpenID configuration data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issuer:
 *                   type: string
 *                   description: The base URL of the issuer.
 *                 credential_issuer:
 *                   type: string
 *                   description: URL of the OpenID credential issuer endpoint.
 *                 credential_endpoint:
 *                   type: string
 *                   description: Endpoint URL for credential operations. Currently not implemented.
 *       500:
 *         description: Server error during the fetch operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch data
 */
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
