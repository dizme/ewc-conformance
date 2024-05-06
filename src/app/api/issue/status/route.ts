import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/issue/status:
 *   get:
 *     summary: Retrieves session data based on session ID
 *     description: Returns session information if found; otherwise, returns an error message.
 *     tags:
 *       - Issuance
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID for retrieving the issuance data.
 *     responses:
 *       200:
 *         description: Session data retrieved successfully.
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
 *                   description: Current state of the session.
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
 *         description: No issuance session found for the provided sessionId.
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
    const sessionData = await prisma.issuanceSessionData.findFirst({
      where: {
        itbSessionId: sessionId
      }
    })
    if (!sessionData) {
      const jsonBody = JSON.stringify({
        "status": "fail",
        "reason": "no issuance session found",
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
