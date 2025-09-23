import { NextResponse } from "next/server";
import db from "../../../lib/database";

export async function GET() {
  try {
    const dbTest = await db.query("SELECT NOW() as time");

    return NextResponse.json({
      status: "Procura SP Backend is running!",
      database: "Connected",
      server_time: dbTest.rows[0].time,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      {
        status: "Procura SP Backend is running!",
        database: "Disconnected",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
