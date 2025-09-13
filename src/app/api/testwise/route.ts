import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const course = req.headers.get("x-course");
    if (!course) {
      return new Response(JSON.stringify({ error: "Missing course" }), { status: 400 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_testwise.aspx?course=${encodeURIComponent(course)}`;

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    const text = await apiRes.text();

    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch testwise data" }), { status: 500 });
    }

    let data: any = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch (e) {
      console.error("Failed to parse JSON:", text, e);
      data = [];
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error while fetching testwise data",
        details: String(error),
      }),
      { status: 500 }
    );
  }
}