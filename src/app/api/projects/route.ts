import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://8vmmi46d74.execute-api.us-east-1.amazonaws.com/Prod/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Cache-Control": "no-store",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}