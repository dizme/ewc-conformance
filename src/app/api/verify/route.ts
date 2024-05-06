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

/**
 * @swagger
 * /api/verify:
 *   get:
 *     summary: Initiates a verification process for a given session ID and credential type
 *     description: Starts verification, returns a QR code and verification URI if successful, otherwise returns an error.
 *     tags:
 *       - Verification
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to check for existing verification.
 *       - in: query
 *         name: credentialType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of credential to verify.
 *     responses:
 *       200:
 *         description: Verification initiated successfully, QR code and verification URI returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qr:
 *                   type: string
 *                   format: base64
 *                   description: Base64 encoded data for QR code.
 *                 sessionId:
 *                   type: string
 *                 verificationUri:
 *                   type: string
 *                   description: URI of the verification.
 *       400:
 *         description: Error due to missing parameters or session reuse.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 reason:
 *                   type: string
 *       500:
 *         description: Internal server error during verification process setup.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 reason:
 *                   type: string
 *                 sessionId:
 *                   type: string
 */
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
