import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Read course from cookies, headers, or localStorage equivalent
    // But since API routes run server-side, pass course from client in headers or query
    const course = req.headers.get("x-course");

    if (!course) {
      return new Response(
        JSON.stringify({ error: "Course missing" }),
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_dashboard.aspx?course=${encodeURIComponent(course)}`;
    const apiRes = await fetch(apiUrl, { cache: "no-store" });

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch dashboard data" }),
        { status: 500 }
      );
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500 }
    );
  }
}
