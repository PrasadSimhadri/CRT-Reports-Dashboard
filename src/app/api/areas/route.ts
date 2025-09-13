import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const course = req.headers.get("x-course");
    if (!course) {
      return new Response(JSON.stringify({ error: "Missing course" }), { status: 400 });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_areawise.aspx?course=${encodeURIComponent(course)}`;
    const apiRes = await fetch(apiUrl, { cache: "no-store" });

    const text = await apiRes.text();
    if (!text || text.trim() === "") {
      // fallback if API returns blank
      return new Response(JSON.stringify([]), { status: 200 });
    }

    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), { status: 200 });
    } catch {
      return new Response(JSON.stringify([]), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
