import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "Procura SP Backend is running!",
    server_time: new Date().toISOString(),
  });
}
