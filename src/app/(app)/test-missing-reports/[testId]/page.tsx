"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { Users, Download } from "lucide-react";
import * as XLSX from "xlsx";

const studentDetailsColumns: ColumnDef<any>[] = [
    { accessorKey: "idcardno", header: "ID Card No" },
    { accessorKey: "studname", header: "Student Name" },
    { accessorKey: "Emailid", header: "Student Email" },
];

export default function TestMissingReportPage() {
    const [studentDetails, setStudentDetails] = useState<any[]>([]);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const params = useParams();
    const testId = params.testId as string;

    useEffect(() => {
        async function fetchStudentDetails() {
            setStudentDetailsLoading(true);
            try {
                const course = localStorage.getItem("apex-batchcode") || "";
                if (!course) {
                    console.warn("No course found in localStorage");
                    setStudentDetails([]);
                    setStudentDetailsLoading(false);
                    return;
                }

                const res = await fetch(
                    `/api/testwise-missing-details?testno=${encodeURIComponent(testId)}`,
                    {
                        headers: {
                            "x-course": course,
                        },
                    }
                );

                if (!res.ok) {
                    console.error("Failed to fetch missing students:", res.statusText);
                    setStudentDetails([]);
                    setStudentDetailsLoading(false);
                    return;
                }

                const data = await res.json();
                // Only keep valid student records
                const students = Array.isArray(data) ? data : [];
                setStudentDetails(students);
            } catch (e) {
                console.error("Error fetching missing students:", e);
                setStudentDetails([]);
            }
            setStudentDetailsLoading(false);
        }
        fetchStudentDetails();
    }, [testId]);

    // Download handler for missed students
    function handleDownloadExcel() {
        const exportData = studentDetails.map(({ idcardno, studname, Emailid }) => ({
            "Student ID": idcardno,
            "Student Name": studname,
            "Student Email": Emailid,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Missed Students");
        XLSX.writeFile(wb, `missed-students-${testId}.xlsx`);
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col gap-2 bg-[#1976D2] px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Missed Students
                    </h1>
                </div>
                <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="/" className="hover:underline text-white pl-4">
                                Home
                            </Link>
                            <span className="mx-2 text-white">/</span>
                        </li>
                        <li>
                            <Link href="/test-reports" className="hover:underline text-white">
                                Test Reports
                            </Link>
                            <span className="mx-2 text-white">/</span>
                        </li>
                        <li className="font-medium text-white">
                            {testId} - [Not Attempted]
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="rounded-xl p-4 mb-4">
                <div className="mb-4 flex items-center text-black justify-between dark:text-white">
                    <span>
                        List of students who did not attempt for ExamID:{" "}
                        <span>{testId}</span>
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 ml-4 pt-3">
                    <StatCard title="Missed Students" value={studentDetails.length} icon={Users} />
                </div>

                <div
                    className="dark:bg-black rounded-xl shadow-sm p-4 m-4"
                    style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
                >
                    {/* Header row inside table card */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleDownloadExcel}
                            className="rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition"
                            title="Download Excel"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>

                    {/* DataTable */}
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
                </div>
            </div>
        </div>
    );
}