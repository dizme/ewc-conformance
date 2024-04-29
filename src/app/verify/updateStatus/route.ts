// pages/api/updateVerificationSession.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { VerificationState } from "@/types/VerificationState";

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
