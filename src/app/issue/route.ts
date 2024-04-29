import { NextRequest, NextResponse } from 'next/server';
import {getOfferUrl} from "@/utils/getOfferUrl";
import QRCode from 'qrcode';
import {getCredentials} from "@/utils/getCredentials";
import {AvailableCredential} from "@/types/credentials";
import prisma from "@/lib/prisma";
import {IssuanceState} from "@/types/IssuanceState";

async function createSessionData(sessionId: string, offerUrl: string) {
    const decodedUri = decodeURIComponent(offerUrl);
// Extract the part of the URL after 'credential_offer_uri='
    const credentialOfferUri = decodedUri.substring(decodedUri.indexOf('credential_offer_uri=') + 'credential_offer_uri='.length);

    const url = new URL(credentialOfferUri);
    const finalId = url.searchParams.get('id') || "";
    await prisma.issuanceSessionData.create(
        {
            data: {
                itbSessionId: sessionId,
                issuerSessionId: finalId,
                state: IssuanceState.Pending
            }
        }
    )
}

function changeCredentialOfferEndpoint(baseUrl: string, data: string) {
    const baseUrlObject = new URL(baseUrl)
    // URL to replace with
    const proxiedUrl = `${baseUrl}/proxy/offer`;

// Parse the original URI
    const url = new URL(data);

// Decode the credential_offer_uri parameter
    const credentialOfferUriEncoded = url.searchParams.get('credential_offer_uri')

    if (!credentialOfferUriEncoded) {
        return data
    }
    const credentialOfferUri = decodeURIComponent(credentialOfferUriEncoded);

    const innerUrl = new URL(credentialOfferUri);

// Replace the base URL and path with the custom string
    const updatedUrl = new URL(proxiedUrl + innerUrl.search);

// Re-encode and set back the updated URI as a query parameter
    url.host = baseUrlObject.host
    url.searchParams.set('credential_offer_uri', updatedUrl.toString());

// Construct the final updated URI
    const updatedUri = url.toString();

    return updatedUri;
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl;
    const sessionId = url.searchParams.get('sessionId');
    const credentialType = url.searchParams.get('credentialType');

    if (sessionId && credentialType) {
        const credentials = await getCredentials();
        const credential: AvailableCredential = credentials.find(cred => cred.id === credentialType) as AvailableCredential;
        if (!credential) {
            const jsonBody = JSON.stringify(
                {
                    "status": "fail",
                    "reason": `credential type ${credentialType} not supported`,
                    "sessionId": `${sessionId}`
                }
            );

            return new NextResponse(jsonBody, {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        }
        const existingSession = await prisma.issuanceSessionData.findFirst(
            {
                where: {
                    itbSessionId: sessionId
                }
            }
        )

        if (existingSession) {
            const jsonBody = JSON.stringify(
                {
                    "status": "fail",
                    "reason": `Session ID ${sessionId} already used`,
                    "sessionId": `${sessionId}`
                }
            );

            return new NextResponse(jsonBody, {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        try {
            const offerUrl = await getOfferUrl(credential)
            await createSessionData(sessionId, offerUrl.data)
            const baseUrl = `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;
            const proxiedUri = changeCredentialOfferEndpoint(baseUrl, offerUrl.data)
            const qrBase64 = await QRCode.toDataURL(proxiedUri)
            const jsonBody = JSON.stringify({
                qr: qrBase64,
                sessionId: sessionId,
                credentialOfferUri: proxiedUri
            });

            return new NextResponse(jsonBody, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        } catch (error) {
            const jsonBody = JSON.stringify(
                {
                    "status": "fail",
                    "reason": `Internal Error while creating issue request: ${error}`,
                    "sessionId": `${sessionId}`
                }
            );

            return new NextResponse(jsonBody, {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    } else {
        const theNoneOne = sessionId == null ? 'sessionId' : 'credentialType'
        const jsonBody = JSON.stringify(
            {
                "status": "fail",
                "reason": `Query parameter ${theNoneOne} required!`,
            }
        );

        return new NextResponse(jsonBody, {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
