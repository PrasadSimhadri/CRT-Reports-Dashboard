import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Parse testno from query params
    const { searchParams } = new URL(req.url, "http://localhost");
    const testno = searchParams.get("testno");
    if (!testno) {
      return new Response(
        JSON.stringify({ error: "Missing testno" }),
        { status: 400 }
      );
    }

    // Get course from request headers
    const course = req.headers.get("x-course");
    if (!course) {
      return new Response(
        JSON.stringify({ error: "Missing course" }),
        { status: 400 }
      );
    }

    // Build API URL dynamically
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_testwise_detail.aspx?course=${encodeURIComponent(
      course
    )}&testno=${encodeURIComponent(testno)}`;

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch testwise detail data" }),
        { status: 500 }
      );
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error while fetching testwise detail data",
        details: String(error),
      }),
      { status: 500 }
    );
  }
}