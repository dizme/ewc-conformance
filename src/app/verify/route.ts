import {NextRequest, NextResponse} from "next/server";
import {getCredentials} from "@/utils/getCredentials";
import {AvailableCredential} from "@/types/credentials";
import prisma from "@/lib/prisma";
import {getOfferUrl} from "@/utils/getOfferUrl";
import QRCode from "qrcode";
import {IssuanceState} from "@/types/IssuanceState";
import {startVerify} from "@/utils/startVerify";
import {VerificationState} from "@/types/VerificationState";

async function createSessionData(sessionId: string, verificationUri: string) {
const params = new URLSearchParams(verificationUri.split('?')[1]);
const state = params.get('state');// Extract the part of the URL after 'credential_offer_uri='
    await prisma.verificationSessionData.create(
        {
            data: {
                itbSessionId: sessionId,
                verifierSessionId: state || "",
                state: VerificationState.Pending,
                attributes: JSON.stringify({})
            }
        }
    )
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl;
    const sessionId = url.searchParams.get('sessionId');
    const credentialType = url.searchParams.get('credentialType');

    if (sessionId && credentialType) {
        const existingSession = await prisma.verificationSessionData.findFirst(
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
            const baseUrl = process.env.BASE_URL || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;
            const verificationUri = await startVerify(credentialType, baseUrl)
            await createSessionData(sessionId, verificationUri.data)
            const qrBase64 = await QRCode.toDataURL(verificationUri.data)
            const jsonBody = JSON.stringify({
                qr: qrBase64,
                sessionId: sessionId,
                verificationUri: verificationUri.data
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
                    "reason": `Internal Error while creating verify request: ${error}`,
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
