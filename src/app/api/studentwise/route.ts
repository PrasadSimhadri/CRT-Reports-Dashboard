import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get user info from headers
    const usertype = req.headers.get("x-usertype");
    const city = req.headers.get("x-city");
    const course = req.headers.get("x-course");

    if (!usertype || !city || !course) {
      return new Response(
        JSON.stringify({ error: "Missing x-usertype, x-city, or x-course header" }),
        { status: 400 }
      );
    }

    // Ensure trailing slash in BASE_URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!baseUrl.endsWith("/")) baseUrl += "/";
    // Build API URL dynamically
    const apiUrl = `${baseUrl}results_sync/get_crt_studwise_detail_all.aspx?usertype=${encodeURIComponent(
      usertype
    )}&city=${encodeURIComponent(city)}&course=${encodeURIComponent(course)}`;

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch studentwise data",
          status: apiRes.status,
          statusText: apiRes.statusText,
        }),
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error while fetching studentwise data",
        details: String(error),
      }),
      { status: 500 }
    );
  }
}
