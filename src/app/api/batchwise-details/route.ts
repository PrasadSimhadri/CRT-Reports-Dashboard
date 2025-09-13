import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(req.url, "http://localhost");
    const batchId = searchParams.get("batchId");
    if (!batchId) {
      return new Response(JSON.stringify({ error: "Missing batchId" }), { status: 400 });
    }

    // Get usertype, city, course from headers
    const usertype = req.headers.get("x-usertype");
    const city = req.headers.get("x-city");
    const course = req.headers.get("x-course");
    if (!usertype || !city || !course) {
      return new Response(JSON.stringify({ error: "Missing user info" }), { status: 400 });
    }

    // Ensure trailing slash in BASE_URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!baseUrl.endsWith("/")) baseUrl += "/";

    // Build API URL dynamically
    const apiUrl = `${baseUrl}results_sync/get_crt_batch_data.aspx?usertype=${encodeURIComponent(
      usertype
    )}&city=${encodeURIComponent(city)}&course=${encodeURIComponent(course)}&batch=${encodeURIComponent(batchId)}`;

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch batch data" }), { status: 500 });
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Unexpected error while fetching batch data", details: String(e) }),
      { status: 500 }
    );
  }
}