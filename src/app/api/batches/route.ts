import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get user info from headers
    const usertype = req.headers.get("x-usertype");
    const city = req.headers.get("x-city");
    const course = req.headers.get("x-course"); // batchcode

    if (!usertype || !city || !course) {
      return new Response(
        JSON.stringify({ error: "Missing user info in headers" }),
        { status: 400 }
      );
    }

    // Ensure trailing slash in BASE_URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!baseUrl.endsWith("/")) baseUrl += "/";

    // Build API URL dynamically using provided city & usertype
    const apiUrl = `${baseUrl}results_sync/get_crt_batch.aspx?usertype=${encodeURIComponent(
      usertype
    )}&city=${encodeURIComponent(city)}&course=${encodeURIComponent(course)}`;

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch batches", status: apiRes.status }),
        { status: 500 }
      );
    }

    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch batches", details: String(e) }),
      { status: 500 }
    );
  }
}