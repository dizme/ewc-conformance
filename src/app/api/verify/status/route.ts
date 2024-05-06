import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import {VerificationState} from "@/types/VerificationState";

/**
 * @swagger
 * /api/verify/status:
 *   get:
 *     summary: Retrieves verification session data based on session ID
 *     description: Returns verification session information if found; otherwise, returns an error message.
 *     tags:
 *       - Verification
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID for retrieving the verification data.
 *     responses:
 *       200:
 *         description: Verification session data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 sessionId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   description: Current state of the verification session.
 *       400:
 *         description: Missing sessionId in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *       500:
 *         description: No verification session found for the provided sessionId.
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

  if (sessionId) {
    const sessionData = await prisma.verificationSessionData.findFirst({
      where: {
        itbSessionId: sessionId
      }
    })
    if (!sessionData) {
      const jsonBody = JSON.stringify({
        "status": "fail",
        "reason": "no verification session found",
        "sessionId": `${sessionId}`
      });

      return new NextResponse(jsonBody, {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    const jsonBody = JSON.stringify({
      message: 'OK',
      sessionId: sessionData.itbSessionId,
      status: sessionData.state
    });

    return new NextResponse(jsonBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    const jsonBody = JSON.stringify({
      error: 'Bad Request',
      message: 'Missing sessionId in query parameters.'
    });

    return new NextResponse(jsonBody, {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * @swagger
 * /api/verify/status:
 *   post:
 *     summary: Updates the state of a verification session based on session ID
 *     description: Receives a session ID and new state, updates the session, and returns a success message or error.
 *     tags:
 *       - Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - state
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier for the verification session.
 *               state:
 *                 type: string
 *                 description: The new state to update the verification session to.
 *     responses:
 *       200:
 *         description: Verification session updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Update successful
 *       400:
 *         description: Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing or invalid 'id' or 'state' parameter
 *       500:
 *         description: Server error during the update process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to update verification session
 *                 details:
 *                   type: object
 *                   description: Details about the error encountered during the update process.
 */
export async function POST(req: NextRequest) {
    // Parse the JSON body from the request
    const data = await req.json();
    const { id, state } = data;

    // Check if 'id' or 'state' is not provided
    if (!id) {
        return new NextResponse(JSON.stringify({ error: "Missing or invalid 'id' parameter" }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    if (!state) {
        return new NextResponse(JSON.stringify({ error: "Missing or invalid 'state' parameter" }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const verificationSessionData = await prisma.verificationSessionData.findFirstOrThrow({
            where: {
                verifierSessionId: id
            }
        });

        await prisma.verificationSessionData.update({
            where: {
                id: verificationSessionData.id
            },
            data: {
                state: state as VerificationState
            }
        });

        return new NextResponse(JSON.stringify({ message: "Update successful" }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Failed to update verification session:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to update verification session", details: error }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

