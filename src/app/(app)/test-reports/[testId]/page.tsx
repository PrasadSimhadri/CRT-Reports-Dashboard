"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Users, BarChart2, CheckSquare, HelpCircle, Download } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as XLSX from "xlsx";

type Participant = {
  StudentId: string;
  StudentName: string;
  Total_Score: number;
  TotalNoOfCorrects: number;
  TotalNoOfWrongs: number;
  TotalNoOfSkipped: number;
};

type StudentDetail = {
  studname: string;
  studentid: string;
  emailid: string;
  section1cor: number;
  section1wro: number;
  section1sco: number;
  testdate?: string;
};

const participantColumns: ColumnDef<Participant>[] = [
  {
    accessorKey: "StudentName",
    header: "Name",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{student.StudentName[0]}</AvatarFallback>
          </Avatar>
          <span>{student.StudentName}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "Total_Score",
    header: "Score"
  },
  {
    accessorKey: "TotalNoOfCorrects",
    header: "Correct"
  },
  {
    accessorKey: "TotalNoOfWrongs",
    header: "Wrong"
  },
  {
    accessorKey: "TotalNoOfSkipped",
    header: "Skipped"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/student-reports/${student.StudentId}`}>View Report</Link>
        </Button>
      );
    },
  },
]

// Add columns for student details card
const studentDetailsColumns: ColumnDef<any>[] = [
  { accessorKey: "studentid", header: "Student ID" },
  { accessorKey: "studname", header: "Student Name" },
  { accessorKey: "emailid", header: "Student Email" },
  { accessorKey: "section1cor", header: "Total Correct" },
  { accessorKey: "section1wro", header: "Total Wrong" },
  { accessorKey: "section1sco", header: "Total Score" },
  {
    accessorKey: "Testdate",
    header: "Test Date",
    cell: ({ row }) => {
      const value = row.original.Testdate || row.original.testdate;
      if (!value) return "";
      const [year, month, day] = value.split("T")[0].split("-");
      return `${day}-${month}-${year}`;
    }
  }
];

// Dummy chart for now, as real question-wise data is not available from API
const QuestionDifficultyChart = ({ testData }: { testData: any[] }) => {
  const qData = useMemo(() => {
    if (!testData || testData.length === 0) return [];
    const totalQuestions = 50;
    const totalParticipants = testData.length;
    const avgCorrectness = testData.reduce((acc, t) => acc + (t.TotalNoOfCorrects || 0), 0) / (totalParticipants * totalQuestions);
    return Array.from({ length: totalQuestions }, (_, i) => {
      const baseCorrectness = avgCorrectness * 100;
      const randomFactor = (Math.random() - 0.5) * 40;
      const correctness = Math.max(10, Math.min(95, baseCorrectness + randomFactor));
      return {
        name: `Q${i + 1}`,
        correctness: parseFloat(correctness.toFixed(2)),
      };
    });
  }, [testData]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={qData}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={10} tick={{ dy: 10 }} interval={0} />
        <YAxis stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Correctness %', angle: -90, position: 'insideLeft', offset: -5 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
          formatter={(value) => [`${value}%`, "Correctness"]}
        />
        <Bar dataKey="correctness" name="Correctness" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default function TestReportPage() {
  const [test, setTest] = useState<any>(null);
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ NoofAttendes: number; Total_Avg: number } | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetail[]>([]);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const params = useParams();
  const testId = params.testId as string;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const course = localStorage.getItem("apex-batchcode") || "";

      // Fetch all tests
      const testRes = await fetch(`/api/testwise`, {
        headers: { "x-course": course },
      });
      const tests = await testRes.json();
      const foundTest = tests.find((t: any) => t.testno === testId);
      setTest(foundTest || null);

      // Fetch testwise avg details
      const detailsRes = await fetch(`/api/testwise-avg-details?testno=${testId}`, {
        headers: { "x-course": course },
      });
      const details = await detailsRes.json();

      let summaryObj = null;
      let participantArr = [];
      if (Array.isArray(details) && details.length > 0) {
        if (
          typeof details[0].NoofAttendes === "number" &&
          typeof details[0].Total_Avg === "number"
        ) {
          summaryObj = {
            NoofAttendes: details[0].NoofAttendes,
            Total_Avg: details[0].Total_Avg,
          };
          participantArr = details.slice(1);
        } else {
          participantArr = details;
        }
      }
      setSummary(summaryObj);
      setTestData(participantArr);
      setLoading(false);
    }
    fetchData();
  }, [testId]);

  // Fetch student details
  useEffect(() => {
    async function fetchStudentDetails() {
      setStudentDetailsLoading(true);
      try {
        const course = localStorage.getItem("apex-batchcode") || "";
        const res = await fetch(`/api/testwise-details?testno=${testId}`, {
          headers: { "x-course": course },
        });
        const data = await res.json();
        const students = Array.isArray(data)
          ? data.filter((d) => d.studname && d.studentid)
          : [];
        setStudentDetails(students);
      } catch {
        setStudentDetails([]);
      }
      setStudentDetailsLoading(false);
    }
    fetchStudentDetails();
  }, [testId]);


  // Download handler for attempted students
  function handleDownloadExcel() {
    const exportData = studentDetails.map(({ studname, studentid, emailid, section1cor, section1wro, section1sco, testdate }) => {
      let formattedDate = "";
      if (testdate) {
        const [year, month, day] = testdate.split("T")[0].split("-");
        formattedDate = `${day}-${month}-${year}`;
      }
      return {
        "Student ID": studentid,
        "Student Name": studname,
        "Student Email": emailid,
        "Total Correct": section1cor,
        "Total Wrong": section1wro,
        "Total Score": section1sco,
        "Test Date": formattedDate,
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attempted Students");
    XLSX.writeFile(wb, `attempted-students-${testId}.xlsx`);
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  // console.log('Fetched test:', test);
  // console.log('Fetched testData:', testData);
  if (!test) {
    notFound();
  }

  // Use summary data if available, otherwise fallback to calculated
  const participants = summary?.NoofAttendes ?? testData.length;
  const avgScore =
    summary?.Total_Avg ??
    (testData.reduce((acc, t) => acc + (t.Total_Score || 0), 0) /
      (testData.length || 1));
  const totalAttempted = testData.reduce(
    (acc, t) => acc + (t.TotalNoOfCorrects || 0) + (t.TotalNoOfWrongs || 0),
    0
  );
  const totalSkipped = testData.reduce(
    (acc, t) => acc + (t.TotalNoOfSkipped || 0),
    0
  );
  const avgAttempted = totalAttempted / (participants || 1);
  const avgSkipped = totalSkipped / (participants || 1);
  const attemptPatternData = [
    { name: "Attempted", value: totalAttempted },
    { name: "Skipped", value: totalSkipped },
  ];
  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))"];
  // Centre-wise performance is not available in API, so skip for now
  const centrePerfData: any[] = [];
  const participantDetails = testData.map((d: any) => ({
    StudentId: d.studentid || d.StudentId || "",
    StudentName: d.studname || d.StudentName || "Unknown",
    Total_Score: d.Total_Score ?? d.section1sco ?? 0,
    TotalNoOfCorrects: d.TotalNoofCorrects ?? d.section1cor ?? 0,
    TotalNoOfWrongs: d.TotalNoofWrongs ?? d.section1wro ?? 0,
    TotalNoOfSkipped: 0,
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header row with breadcrumb for test-wise report */}
      <div className="flex flex-col gap-2  bg-[#1976D2] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Test Report</h1>
        </div>
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:underline  text-white pl-4">Home</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li>
              <Link href="/test-reports" className="hover:underline text-white">Test Reports</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li className="font-medium text-white">{testId} - [Attempted]</li>
          </ol>
        </nav>
      </div>
      <div className="rounded-xl shadow-sm p-4">
        <div className="mb-4 text-black dark:text-white">
          Performance analysis for Exam ID:   <span >{test.ExamId || testId}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 pl-4 pt-3">
          <Dialog>
            <DialogTrigger asChild>
              <div>
                <StatCard title="Total Attendes" value={participants} icon={Users} />
              </div>
            </DialogTrigger>
          </Dialog>
          <StatCard title="Average Score" value={avgScore.toFixed(2)} icon={BarChart2} />
          {/* <StatCard title="Avg. Attempted" value={avgAttempted.toFixed(2)} icon={CheckSquare} /> */}
          {/* <StatCard title="Avg. Skipped" value={avgSkipped.toFixed(2)} icon={HelpCircle} variant="destructive" /> */}
        </div>
        {/* Add gap between cards and table */}
        <div className="h-4" />
        {/* Student Details Card */}
        <Card className="ml-4" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Students Who Attempted This Test</CardTitle>
              <CardDescription>List of students who attempted this test.</CardDescription>
            </div>
            <button
              onClick={handleDownloadExcel}
              className="rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition ml-4"
              title="Download Excel"
            >
              <Download className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={studentDetailsColumns}
              data={studentDetails}
              pageSize={10}
              pagination={pagination}
              onPaginationChange={setPagination}
              loading={studentDetailsLoading}
              filterColumn="studname"
              filterPlaceholder="Search by name..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}