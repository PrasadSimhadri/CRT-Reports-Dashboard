"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { Users, Download } from "lucide-react";
import * as XLSX from "xlsx";

const studentDetailsColumns: ColumnDef<any>[] = [
    { accessorKey: "idcardno", header: "ID Card No" },
    { accessorKey: "Studname", header: "Student Name" },
    { accessorKey: "Emailid", header: "Email ID" },
];

export default function BatchReportPage() {
    const [studentDetails, setStudentDetails] = useState<any[]>([]);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const params = useParams();
    const batchId = params.batchId as string;

    useEffect(() => {
        async function fetchStudentDetails() {
            setStudentDetailsLoading(true);
            try {
                const usertype = localStorage.getItem("apex-usertype") || "";
                const city = localStorage.getItem("apex-centercity") || "";
                const course = localStorage.getItem("apex-batchcode") || "";

                if (!usertype || !city || !course) {
                    console.warn("Missing user info in localStorage");
                    setStudentDetails([]);
                    setStudentDetailsLoading(false);
                    return;
                }

                const res = await fetch(`/api/batchwise-details?batchId=${batchId}`, {
                    headers: {
                        "x-usertype": usertype,
                        "x-city": city,
                        "x-course": course,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch batch data");
                const data = await res.json();

                const students = Array.isArray(data) ? data : [];
                setStudentDetails(students);

            } catch (e) {
                console.error("Error fetching batch students:", e);
                setStudentDetails([]);
            }
            setStudentDetailsLoading(false);
        }

        fetchStudentDetails();
    }, [batchId]);

    function handleDownloadExcel() {
        const exportData = studentDetails.map(({ idcardno, Studname, Emailid }) => ({
            "Student ID": idcardno,
            "Student Name": Studname,
            "Email ID": Emailid,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, `batch-${batchId}-students.xlsx`);
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col gap-2  bg-[#1976D2] px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Batch Students</h1>
                </div>
                <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="/" className="hover:underline text-white pl-4">Home</Link>
                            <span className="mx-2 text-white">/</span>
                        </li>
                        <li>
                            <Link href="/batch-reports" className="hover:underline text-white">Batch Reports</Link>
                            <span className="mx-2 text-white">/</span>
                        </li>
                        <li className="font-medium text-foreground text-white">{batchId}</li>
                    </ol>
                </nav>
            </div>
            <div className="rounded-xl p-4 mb-4">
                <div className="mb-4 text-black dark:text-white">
                    List of students in BatchID: <span>{batchId}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 pl-4 pt-3">
                    <StatCard
                        title="Total Students"
                        value={studentDetails.length}
                        icon={Users}
                    />
                </div>
                {/* Table with download button */}
                <div
                    className="dark:bg-black bg-white rounded-xl shadow-sm p-4 ml-4"
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
                        columns={studentDetailsColumns}
                        data={studentDetails}
                        pageSize={10}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        loading={studentDetailsLoading}
                        filterColumn="Studname"
                        filterPlaceholder="Search by name..."
                    />
                </div>
            </div>
        </div>
    );
}