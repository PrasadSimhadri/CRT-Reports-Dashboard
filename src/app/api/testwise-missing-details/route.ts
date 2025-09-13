import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const testno = searchParams.get("testno");

  if (!testno) {
    return new Response(JSON.stringify({ error: "Missing testno" }), { status: 400 });
  }

  // Get course from headers
  const course = req.headers.get("x-course") || "";

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_studentwise_not.aspx?course=${course}&testno=${testno}`;

  try {
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch data", details: String(err) }), { status: 500 });
  }
}