import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import {IssuanceState} from "@/types/IssuanceState";


export async function GET(req: NextRequest) {
    const url = req.nextUrl;
    const id = url.searchParams.get('id') || "";
    const credentialOfferEndpoint = `${process.env.ISSUER_URL}/openid4vc/credentialOffer?id=${id}`;

    try {
        // Make the proxied request to the external API
        const apiResponse = await fetch(credentialOfferEndpoint, {
            method: 'GET', // Specifying method as POST
        });

        // Check if the HTTP request was successful
        if (!apiResponse.ok) {
            throw new Error(`HTTP error! Status: ${apiResponse.status}`);
        }

        // Update request statue
        const issuanceSessionData = await prisma.issuanceSessionData.findFirstOrThrow({
            where: {
                issuerSessionId: id
            }
        })
        await prisma.issuanceSessionData.update(
            {
                where: {
                    id: issuanceSessionData.id
                },
                data: {
                    state: IssuanceState.Read
                }
            }
        )

        // Clone the response to send back to the original client
        const responseHeaders = new Headers(apiResponse.headers);
        // Parse the JSON body of the response
        const data = await apiResponse.json(); // Use .json() instead of .text() if the response is JSON

        // Modify the 'credential_issuer' field
        const baseUrl = `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;
        data.credential_issuer = baseUrl; // New issuer URL

        // Convert the modified object back to a JSON string
        const responseBody = JSON.stringify(data);

        return new NextResponse(responseBody, {
            status: apiResponse.status,
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
