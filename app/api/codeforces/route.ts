import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get("method");

  if (!method) {
    return NextResponse.json({ error: "Missing method" }, { status: 400 });
  }

  const cfParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "method") cfParams.set(key, value);
  });

  const url = `https://codeforces.com/api/${method}?${cfParams.toString()}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();

  return NextResponse.json(data);
}
