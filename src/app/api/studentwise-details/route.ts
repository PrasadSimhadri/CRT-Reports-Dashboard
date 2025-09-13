import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get course from request headers
    const course = req.headers.get("x-course");
    const { searchParams } = new URL(req.url, "http://localhost");
    const studentId = searchParams.get("studentId");
    if (!course || !studentId) {
      return new Response(
        JSON.stringify({ error: "Missing course or studentId" }),
        { status: 400 }
      );
    }

    // Build API URL dynamically (only course and userid)
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/results_sync/get_crt_studwise_detail.aspx?course=${encodeURIComponent(
      course
    )}&userid=${encodeURIComponent(studentId)}`;

    // Debug log
    // console.log("studentwise-details API URL:", apiUrl);
    // console.log("Headers:", { course });

    const apiRes = await fetch(apiUrl, { cache: "no-store" });
    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Backend response:", rawText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch student details", backend: rawText }),
        { status: 500 }
      );
    }

    let data;
    try {
      data = rawText ? JSON.parse(rawText) : [];
    } catch (jsonErr) {
      console.error("Failed to parse backend JSON:", jsonErr, rawText);
      // If backend returns HTML or invalid JSON, return empty array
      data = [];
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error while fetching student details",
        details: String(error),
      }),
      { status: 500 }
    );
  }
}