"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card";

type Student = {
  Idcardno: string;
  studname: string;
  emailid: string;
  batchcode: string;
  Batchname: string;
};

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "Idcardno",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID Card No
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "studname",
    header: "Name",
  },
  {
    accessorKey: "emailid",
    header: "Email",
  },
  {
    accessorKey: "batchcode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Batch
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "Batchname",
    header: "Batch Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/student-reports/${student.Idcardno}`}>
            View Report
          </Link>
        </Button>
      );
    },
  },
];

export default function StudentReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null);
  const [searchId, setSearchId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [totalStudents, setTotalStudents] = useState<number | null>(null);


  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const userDataRaw = localStorage.getItem("apex-login");
        const userData = userDataRaw ? JSON.parse(userDataRaw) : null;

        const res = await fetch("/api/studentwise", {
          headers: {
            "x-usertype": userData?.Usertype || "",
            "x-city": userData?.centercity || "",
            "x-course": userData?.batchcode || "",
          },
        });

        const data = await res.json();
        setRawData(data);
        // console.log('API studentwise data:', data);

        // Filter out Password and map into Student[]
        const studentList = Array.isArray(data)
          ? data.map(({ Password, BatchName, Batchname, ...rest }) => ({
            ...rest,
            Batchname: Batchname || BatchName || "", // normalize to Batchname
          }))
          : [];
        // console.log('Processed studentList:', studentList);
        setStudents(studentList);
        const course = localStorage.getItem("apex-batchcode");
        const dashboardRes = await fetch("/api/dashboard", {
          headers: {
            "x-course": course || "",
          },
        });
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          if (Array.isArray(dashboardData) && dashboardData.length > 0) {
            setTotalStudents(dashboardData[0].Total_Students);
          } else if (dashboardData?.Total_Students) {
            setTotalStudents(dashboardData.Total_Students);
          }
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
        setRawData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  function handleDownloadExcel() {
    const exportData = students.map(({ Idcardno, studname, emailid, batchcode, Batchname }) => ({
      "Student ID": Idcardno,
      Name: studname,
      Email: emailid,
      Batch: batchcode,
      BatchName: Batchname,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student-list.xlsx");
  }

  const filteredStudents = students.filter(student => {
    const idMatch = searchId ? student.Idcardno.toLowerCase().includes(searchId.toLowerCase()) : true;
    const emailMatch = searchEmail ? student.emailid.toLowerCase().includes(searchEmail.toLowerCase()) : true;
    return idMatch && emailMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 bg-[#1976D2] p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl text-white font-bold tracking-tight pl-1">
            Student Reports
          </h1>
        </div>
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:underline text-white pl-4">
                Home
              </Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li className="font-medium text-white">Student Reports</li>
          </ol>
        </nav>
        <p className="text-blue-100 mt-1 pl-4">
          Browse and search for individual student performance reports.
        </p>
      </div>

      {/* StatCard */}
      <div className="px-4 w-1/4">
        <StatCard
          title="Total Students"
          value={totalStudents ?? students.length}
          icon={Users}
        />
      </div>

      {/* Main content */}
      <div className="rounded-xl p-4 flex flex-col gap-8 shadow-lg">
        <Card className="bg-white dark:bg-black rounded-xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Student List</h2>
            <button
              onClick={handleDownloadExcel}
              className="rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition"
              title="Download Excel"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          {/* Search bars for ID, Name, and Email */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by TIME ID..."
              className="w-50 dark:bg-black-900 dark:text-white dark:placeholder-gray-400"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Search by Email..."
              className="w-50 dark:bg-black-900 dark:text-white dark:placeholder-gray-400"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
            />
          </div>
          <DataTable
            columns={columns}
            data={filteredStudents}
            filterColumn="studname"
            filterPlaceholder="Search by Name."
          />
        </Card>
        {loading && (
          <div className="p-4 text-center bg-white dark:bg-black rounded-xl shadow-sm dark:text-white">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}