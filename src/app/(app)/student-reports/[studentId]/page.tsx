"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import StudentReportClient from "@/app/(app)/student-reports/[studentId]/StudentReportClient";
import { notFound } from "next/navigation";

type ApiResponseItem = {
  studname: string;
  studentid: string;
  testno: string;
  section1cor: number | null;
  section1wro: number | null;
  section1sco: number | null;
  TotalNoofCorrects: number | null;
  TotalNoofWrongs: number | null;
  Total_Score: number | null;
  Testdate: string;
};

type TestRecord = {
  TestNo: string;
  ExamId: string;
  TestDate: string;
  Total_Score: number;
  TotalNoOfCorrects: number;
  TotalNoOfWrongs: number;
  TotalNoOfSkipped: number;
};

export default function StudentReportPage(props: { params: Promise<{ studentId: string }> }) {
  const params = React.use(props.params);
  const studentId = params.studentId;

  const { user } = useAuth();
  const [data, setData] = useState<{ studentName: string; tests: TestRecord[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRaw = localStorage.getItem("apex-login");
        const user = userRaw ? (Array.isArray(JSON.parse(userRaw)) ? JSON.parse(userRaw)[0] : JSON.parse(userRaw)) : {};
        const course = user.batchcode || "";
        const usertype = user.Usertype || "";
        const city = user.centercity || "";

        if (!course || !usertype || !city) {
          console.warn("Missing user info for studentwise-details API");
          setData(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/studentwise-details?studentId=${encodeURIComponent(studentId)}`, {
          cache: "no-store",
          headers: {
            "x-course": course,
            "x-usertype": usertype,
            "x-city": city,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("studentwise-details API error:", errorText);
          setData(null);
          setLoading(false);
          return;
        }

        const responseData: ApiResponseItem[] = await res.json();
        if (!Array.isArray(responseData) || responseData.length === 0) {
          setData(null);
          setLoading(false);
          return;
        }

        const studentName = responseData[0].studname || "";
        const tests: TestRecord[] = responseData.map((item, index) => ({
          TestNo: item.testno || `Test-${index + 1}`,
          ExamId: item.testno || `Test-${index + 1}`,
          TestDate: item.Testdate,
          Total_Score: item.Total_Score ?? item.section1sco ?? 0,
          TotalNoOfCorrects: item.TotalNoofCorrects ?? item.section1cor ?? 0,
          TotalNoOfWrongs: item.TotalNoofWrongs ?? item.section1wro ?? 0,
          TotalNoOfSkipped: 0,
        }));

        tests.sort((a, b) => new Date(a.TestDate).getTime() - new Date(b.TestDate).getTime());
        setData({ studentName, tests });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId]);

  if (loading) return <div className="p-4">Loading student report...</div>;
  if (!data) {
    return (
      <div className="p-8 text-center text-red-600">
        No report found for student ID: <b>{studentId}</b>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header row with breadcrumb */}
      <div className="flex flex-col gap-2 bg-[#1976D2] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Report</h1>
        </div>
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:underline text-white pl-4">Home</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li>
              <Link href="/student-reports" className="hover:underline text-white">Student Reports</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li className="font-medium text-white">{studentId}</li>
          </ol>
        </nav>
      </div>

      <StudentReportClient data={data} studentId={studentId} />
    </div>
  );
}
