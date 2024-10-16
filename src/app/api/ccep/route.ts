import { NextRequest, NextResponse } from "next/server";

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const EXTERNAL_API_ENDPOINT = process.env.EXTERNAL_API_ENDPOINT;

export async function POST(req: NextRequest) {
  try {
    const transactionDetails = await req.json();
    console.log("Received transaction details:", transactionDetails);

    if (!transactionDetails) {
      return NextResponse.json({ error: "Missing transaction details" }, { status: 400 });
    }

    // Send the transaction details to the external API
    const response = await fetch(EXTERNAL_API_ENDPOINT as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN as string,
      },
      body: JSON.stringify(transactionDetails),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit transaction. Status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error submitting transaction:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}