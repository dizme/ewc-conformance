import { NextRequest, NextResponse } from 'next/server';
import {siteConfig} from "@/config/site";

export function GET(req: NextRequest) {
  const jsonBody = JSON.stringify({
    name: siteConfig.name,
    version: siteConfig.version
  });

  return new NextResponse(jsonBody, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
