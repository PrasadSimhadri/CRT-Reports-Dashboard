"use client";

import { useEffect, useState, useRef } from "react";
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
  const [selectedBatchNames, setSelectedBatchNames] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  // Dropdown open state
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(250);
  const [showAllBatches, setShowAllBatches] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById("batch-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setBatchDropdownOpen(false);
      }
    }
    if (batchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [batchDropdownOpen]);

  // Dynamically set dropdown max height to avoid overlapping table
  useEffect(() => {
    if (batchDropdownOpen && filterBarRef.current) {
      const filterBarRect = filterBarRef.current.getBoundingClientRect();
      const tableRect = document.querySelector(".data-table")?.getBoundingClientRect();
      if (tableRect) {
        // Space between filter bar and top of table
        const space = tableRect.top - filterBarRect.bottom - 16; // 16px margin
        setDropdownMaxHeight(space > 120 ? space : 120); // minimum 120px
      } else {
        setDropdownMaxHeight(250);
      }
    }
  }, [batchDropdownOpen, students]);

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

  // Extract unique batch names for filter dropdown
  const batchNameOptions = Array.from(
    new Set(students.map(s => s.Batchname).filter(Boolean))
  );

  const filteredStudents = students.filter(student => {
    const idMatch = searchId ? student.Idcardno.toLowerCase().includes(searchId.toLowerCase()) : true;
    const emailMatch = searchEmail ? student.emailid.toLowerCase().includes(searchEmail.toLowerCase()) : true;
    const batchMatch = selectedBatchNames.length > 0 ? selectedBatchNames.includes(student.Batchname) : true;
    return idMatch && emailMatch && batchMatch;
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
          {/* Search bars for ID, Name, Email, and Batch Name */}
          <div
            className="flex flex-col md:flex-row gap-4 mb-4 items-center"
            ref={filterBarRef}
            style={{ minHeight: "40px" }}
          >
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
            {/* Batch Name Multi-Select Dropdown */}
            <div className="relative" style={{ minWidth: "300px", width: "300px" }}>
              <button
                type="button"
                className="w-full border rounded px-2 dark:bg-black-900 dark:text-white text-left text-sm text-gray-500"
                style={{ height: "40px" }}
                onClick={() => setBatchDropdownOpen(open => !open)}
              >
                {selectedBatchNames.length > 0
                  ? `Filter by Batch Name (${selectedBatchNames.length} selected)`
                  : "Filter by Batch Name"}
              </button>
              {batchDropdownOpen && (
                <div
                  id="batch-dropdown"
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 bg-white dark:bg-black border rounded shadow w-full overflow-auto"
                  style={{
                    maxHeight: dropdownMaxHeight,
                    minHeight: "80px",
                    transition: "max-height 0.2s",
                  }}
                >
                  {batchNameOptions.map(batch => {
                    const selected = selectedBatchNames.includes(batch);
                    return (
                      <div
                        key={batch}
                        className={`flex items-center px-2 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition text-sm`}
                        onClick={() => {
                          if (!selected) {
                            setSelectedBatchNames(prev => [...prev, batch]);
                          } else {
                            setSelectedBatchNames(prev =>
                              prev.filter(b => b !== batch)
                            );
                          }
                        }}
                        style={{ userSelect: "none", fontSize: "0.92rem" }}
                      >
                        <span className="mr-2 w-4 text-blue-600 text-sm">
                          {selected ? "✔" : ""}
                        </span>
                        <span>{batch}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Show collapsed badges of selected batches to the right */}
            <div className="flex items-center ml-2 relative">
              {selectedBatchNames.length > 0 && (
                <>
                  <span
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-1"
                  >
                    {selectedBatchNames[0]}
                    <button
                      type="button"
                      className="ml-1 text-blue-800 hover:text-red-600"
                      onClick={() =>
                        setSelectedBatchNames(prev =>
                          prev.filter(b => b !== selectedBatchNames[0])
                        )
                      }
                      aria-label={`Remove ${selectedBatchNames[0]}`}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "1em",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                  {selectedBatchNames.length > 1 && (
                    <span
                      className="inline-flex items-center bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded cursor-pointer"
                      onClick={() => setShowAllBatches(true)}
                      style={{ userSelect: "none" }}
                    >
                      +{selectedBatchNames.length - 1} more
                    </span>
                  )}
                  {/* Popover for all selected batches */}
                  {showAllBatches && (
                    <div
                      className="absolute left-0 mt-2 bg-white dark:bg-black border rounded shadow-lg p-2 z-20"
                      style={{ minWidth: "220px" }}
                    >
                      <div className="flex flex-col gap-2">
                        {selectedBatchNames.map(batch => (
                          <span
                            key={batch}
                            className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                          >
                            {batch}
                            <button
                              type="button"
                              className="ml-1 text-blue-800 hover:text-red-600"
                              onClick={() => {
                                setSelectedBatchNames(prev =>
                                  prev.filter(b => b !== batch)
                                );
                                // If last batch removed, close popover
                                if (selectedBatchNames.length === 1) setShowAllBatches(false);
                              }}
                              aria-label={`Remove ${batch}`}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "1em",
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        className="mt-2 text-xs text-gray-600 hover:text-blue-700 underline"
                        onClick={() => setShowAllBatches(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredStudents}
            filterColumn="studname"
            filterPlaceholder="Search by Name..."
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