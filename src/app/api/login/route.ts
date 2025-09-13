import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_login.aspx?username=${encodeURIComponent(username)}&pwd=${encodeURIComponent(password)}`;
  const res = await fetch(apiUrl);
  const data = await res.json();

  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].Username === username &&
    data[0].Password === password
  ) {
    return NextResponse.json({ success: true, user: data[0] });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
