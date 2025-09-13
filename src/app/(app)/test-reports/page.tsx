"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import * as XLSX from "xlsx";


type Test = {
  testno: string;
  total: number;
  missed?: number;
};

const columns: ColumnDef<Test>[] = [
  {
    accessorKey: "testno",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Test No.
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "total",
    header: "Participants",
    cell: ({ row }) => {
      const test = row.original;
      return (
        <span
          className="font-semibold cursor-pointer"
          onClick={() => {
            window.location.href = `/test-reports/${test.testno}`;
          }}
        >
          {test.total}
        </span>
      );
    },
  },
  {
    accessorKey: "missed",
    header: "Missed Participants",
    cell: ({ row }) => {
      const test = row.original;
      return (
        <span
          className="font-semibold cursor-pointer"
          onClick={() => {
            window.location.href = `/test-missing-reports/${test.testno}`;
          }}
        >
          {row.original.missed ?? 0}
        </span>
      );
    },
  },
  {
    accessorKey: "allStudents",
    header: "All Students",
    cell: ({ row }) => {
      const test = row.original;
      const [downloading, setDownloading] = useState(false);
      const handleDownloadAll = async () => {
        setDownloading(true);
        try {
          const course = localStorage.getItem("apex-batchcode") || "";
          const res = await fetch(`/api/testwise-attempted-missed?testno=${test.testno}`, {
            headers: { "x-course": course },
          });
          if (!res.ok) throw new Error("Failed to fetch all students data");
          const students = await res.json();
          // Format for Excel with Status and Score
          const exportData = Array.isArray(students)
            ? students.map((s) => ({
              "Student ID": s.idcardno,
              "Student Name": s.studname,
              "Student Email": s.Emailid,
              "Status": s.score != null ? "Attempted" : "Missed",
              "Score": s.score ?? '',
            }))
            : [];
          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, `Test_${test.testno}_All_Students`);
          XLSX.writeFile(wb, `all-students-for-${test.testno}.xlsx`);
        } catch (err) {
          alert("Download failed: " + err);
        }
        setDownloading(false);
      };
      return (
        <span
          onClick={handleDownloadAll}
          className={`cursor-pointer px-3 py-1 rounded bg-green-100 text-green-800 font-medium hover:bg-green-200 transition ${downloading ? 'opacity-50 pointer-events-none' : ''}`}
          title="Download All Students"
        >
          Download Excel
        </span>
      );
    },
  },
];


export default function TestReportsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawTestsData, setRawTestsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      const course = localStorage.getItem("apex-batchcode") || "";
      const res = await fetch("/api/testwise", {
        headers: { "x-course": course },
      });
      if (!res.ok) throw new Error(`Failed to fetch testwise data: ${res.statusText}`);
      const data = await res.json();
      setRawTestsData(data); // Save raw API data
      let testsArr: Test[] = Array.isArray(data) ? data : [];

      // Fetch missed count for each test in parallel
      const missedCounts = await Promise.all(
        testsArr.map(async (test) => {
          try {
            const res = await fetch(`/api/testwise-missing-details?testno=${test.testno}`, {
              headers: { "x-course": course },
            });
            if (!res.ok) return 0;
            const missedData = await res.json();
            // missedData is expected to be an array of students who missed
            return Array.isArray(missedData) ? missedData.length : 0;
          } catch {
            return 0;
          }
        })
      );

      // Attach missed count to each test
      testsArr = testsArr.map((test, idx) => ({
        ...test,
        missed: missedCounts[idx] ?? 0,
      }));

      setTests(testsArr);
      setLoading(false);
    }
    fetchTests();
  }, []);

  function handleDownloadExcel() {
    const exportData = tests.map(({ testno, total, missed }) => ({
      "Test No.": testno,
      "Participants": total,
      "Missed Participants": missed ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tests");
    XLSX.writeFile(wb, "test-reports.xlsx");
  }

  return (
    <div className="flex flex-col gap-8 ">
      {/* Header row with title and breadcrumb */}
      <div className="flex flex-col gap-2  bg-[#1976D2] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Test Reports</h1>
        </div>
        {/* Breadcrumb below the header */}
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:underline text-white pl-4">Home</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li className="font-medium text-white">Test Reports</li>
          </ol>
        </nav>
        <p className="text-blue-100 mt-1 pl-4" >Browse and search for test-specific performance analysis.</p>
      </div>

      {/* Raw API Data Preview
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Raw Testwise API Data</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(rawTestsData, null, 2)}</pre>
        </div> */}

      {/* Data table */}
      <div className="overflow-auto rounded-xl p-4">
        <div
          className="dark:bg-black rounded-xl p-4"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
        >
          {/* Button aligned to top-right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadExcel}
              className="w-9 h-9 rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition"
              title="Download Excel"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <DataTable
            columns={columns}
            data={tests}
            filterColumn="testno"
            filterPlaceholder="Filter by test no..."
          />
        </div>
      </div>

      {loading && <div className="p-4 text-center">Loading...</div>}
    </div>
  );
}