import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const config = {
  runtime: 'experimental-edge',
};

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
