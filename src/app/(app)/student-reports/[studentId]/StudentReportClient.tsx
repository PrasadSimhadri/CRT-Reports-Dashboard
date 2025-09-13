"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Target, CheckCircle, Award, FileText, Download } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as XLSX from "xlsx";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export type TestRecord = {
  TestNo: string;
  ExamId: string;
  TestDate: string;
  Total_Score: number;
  TotalNoOfCorrects: number;
  TotalNoOfWrongs: number;
  TotalNoOfSkipped: number;
};

const testColumns: ColumnDef<TestRecord>[] = [
  { accessorKey: "TestNo", header: "Test No." },
  {
    accessorKey: "TestDate",
    header: "Date",
    cell: ({ row }) => new Date(row.original.TestDate).toLocaleDateString()
  },
  { accessorKey: "Total_Score", header: "Score" },
  { accessorKey: "TotalNoOfCorrects", header: "Correct" },
  { accessorKey: "TotalNoOfWrongs", header: "Wrong" },
  { accessorKey: "TotalNoOfSkipped", header: "Skipped" },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="secondary" size="sm">
        <Link href={`/test-reports/${row.original.ExamId}`}>View Test</Link>
      </Button>
    ),
  },
];

export default function StudentReportClient({ data, studentId }: { data: { studentName: string, tests: TestRecord[] }, studentId: string }) {
  const { studentName, tests } = data;

  const overallAccuracy = tests.length > 0
    ? (tests.reduce((acc, t) => {
      const total = t.TotalNoOfCorrects + t.TotalNoOfWrongs;
      return acc + (total > 0 ? t.TotalNoOfCorrects / total : 0);
    }, 0) / tests.length) * 100
    : 0;

  const avgScore = tests.length > 0
    ? tests.reduce((acc, t) => acc + t.Total_Score, 0) / tests.length
    : 0;

  const topScore = tests.length > 0
    ? Math.max(...tests.map(t => t.Total_Score))
    : 0;

  // State for test averages
  const [testAverages, setTestAverages] = useState<Record<string, number>>({});
  const [loadingAverages, setLoadingAverages] = useState(true);

  useEffect(() => {
    async function fetchAverages() {
      try {
        const course = localStorage.getItem("apex-batchcode") || "";
        const examIds = Array.from(new Set(tests.map(t => t.ExamId)));
        const averages: Record<string, number> = {};
        // console.log("Fetching averages for exams with course:", course);

        await Promise.all(examIds.map(async (examId) => {
          if (!examId) return;
          const res = await fetch(`/api/testwise-avg-details?testno=${encodeURIComponent(examId)}`, {
            headers: { "x-course": course }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && typeof data[0].Total_Avg === "number") {
              averages[examId] = Number(data[0].Total_Avg.toFixed(2));
            }
          }
        }));

        setTestAverages(averages);
      } catch (e) {
        console.error("Failed to fetch test averages", e);
      } finally {
        setLoadingAverages(false);
      }
    }

    if (tests.length > 0) fetchAverages();
  }, [tests]);

  const scoreCompData = tests.map(test => ({
    name: `Test ${test.TestNo}`,
    'Your Score': test.Total_Score,
    'Test Average': testAverages[test.ExamId] ?? 0
  }));

  const correctPercentageData = tests.map(test => {
    const total = test.TotalNoOfCorrects + test.TotalNoOfWrongs;
    return { name: `Test ${test.TestNo}`, 'Correct %': total > 0 ? parseFloat(((test.TotalNoOfCorrects / total) * 100).toFixed(2)) : 0 };
  });

  const last10 = tests.slice(-10);
  const minScore = last10.length ? Math.min(...last10.map(t => t.Total_Score)) : 0;
  const maxScore = last10.length ? Math.max(...last10.map(t => t.Total_Score)) : 100;
  const radarDomain = minScore === maxScore ? [0, maxScore || 100] : [minScore, maxScore];
  const radarChartData = last10.map(test => ({ subject: `Test ${test.TestNo}`, score: test.Total_Score, fullMark: maxScore }));

  function handleDownloadTestsExcel() {
    const exportData = tests.map(({ TestNo, ExamId, TestDate, Total_Score, TotalNoOfCorrects, TotalNoOfWrongs, TotalNoOfSkipped }) => ({
      "Test No.": TestNo,
      "Exam ID": ExamId,
      "Date": new Date(TestDate).toLocaleDateString(),
      "Score": Total_Score,
      "Correct": TotalNoOfCorrects,
      "Wrong": TotalNoOfWrongs,
      "Skipped": TotalNoOfSkipped,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tests");
    XLSX.writeFile(wb, `tests-taken-${studentId}.xlsx`);
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-8 animate-fade-in">
      <div className="text-black dark:text-white">
        Report for Student: <span>{studentName}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4">
        <StatCard title="Overall Accuracy" value={`${overallAccuracy.toFixed(2)}%`} icon={Target} />
        <StatCard title="Average Score" value={avgScore.toFixed(2)} icon={CheckCircle} />
        <StatCard title="Top Score" value={topScore} icon={Award} />
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <StatCard title="Tests Taken" value={tests.length} icon={FileText} />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle><VisuallyHidden>Tests taken by {studentName}</VisuallyHidden></DialogTitle>
              <CardTitle className="flex items-center">
                <span>Tests taken by {studentName}</span>
                <button
                  onClick={handleDownloadTestsExcel}
                  className="rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition ml-4"
                  title="Download Excel"
                >
                  <Download className="w-5 h-5" />
                </button>
              </CardTitle>
            </DialogHeader>
            <CardDescription className="sr-only">List of tests taken by the student</CardDescription>
            <div className="overflow-auto max-h-[60vh]">
              <DataTable columns={testColumns} data={tests} filterColumn="TestNo" filterPlaceholder="Filter..." />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Score vs Average */}
      <div className="px-4">
        <Card style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
          <CardHeader><CardTitle>Score vs Test Average</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {loadingAverages ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Loading averages...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreCompData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Your Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Test Average" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Correctness Percentage */}
      <div className="px-4">
        <Card style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
          <CardHeader><CardTitle>Correctness Percentage</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correctPercentageData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--foreground))" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Correct %" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <div className="px-4 pb-8">
        <Card style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
          <CardHeader>
            <CardTitle>Recent Test Score Analysis</CardTitle>
            <CardDescription>Performance across last 10 tests taken.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={radarDomain} />
                <Radar name={studentName} dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}