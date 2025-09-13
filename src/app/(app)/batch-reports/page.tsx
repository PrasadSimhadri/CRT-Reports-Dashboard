"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import * as XLSX from "xlsx";

// Batch type for this page
type Batch = {
    batchcode: string;
    batchname?: string;
    studentCount?: number;
};

const columns: ColumnDef<Batch>[] = [
    {
        accessorKey: "batchcode",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Batch ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const batch = row.original;
            return (
                <span
                    className="font-semibold cursor-pointer"
                    onClick={() => {
                        window.location.href = `/batch-reports/${batch.batchcode}`;
                    }}
                >
                    {batch.batchcode}
                </span>
            );
        },
    },
    {
        accessorKey: "batchname",
        header: "Batch Name",
        cell: ({ row }) => <span>{row.original.batchname ?? "-"}</span>,
    },
    {
        accessorKey: "studentCount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Students Count
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ), cell: ({ row }) => <span>{row.original.studentCount ?? 0}</span>,
    },
];

export default function BatchReportsPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [rawBatchesData, setRawBatchesData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchBatchName, setSearchBatchName] = useState("");

    useEffect(() => {
        async function fetchBatches() {
            setLoading(true);
            try {
                const usertype = localStorage.getItem("apex-usertype") || "";
                const city = localStorage.getItem("apex-centercity") || "";
                const course = localStorage.getItem("apex-batchcode") || "";

                if (!usertype || !city || !course) {
                    setError("User info missing. Please log in again.");
                    setLoading(false);
                    return;
                }

                // Fetch batches
                const res = await fetch("/api/batches", {
                    headers: {
                        "x-usertype": usertype,
                        "x-city": city,
                        "x-course": course,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch batches");
                const data = await res.json();
                setRawBatchesData(data);
                let batchArr: Batch[] = Array.isArray(data) ? data : [];

                // Fetch student counts & batch names in parallel
                const batchDetails = await Promise.all(
                    batchArr.map(async (batch) => {
                        try {
                            const res = await fetch(
                                `/api/batchwise-details?batchId=${batch.batchcode}&city=${encodeURIComponent(
                                    city
                                )}&course=${encodeURIComponent(course)}`,
                                {
                                    headers: {
                                        "x-usertype": usertype,
                                        "x-city": city,
                                        "x-course": course,
                                    },
                                }
                            );
                            if (!res.ok) return { studentCount: 0, batchname: "" };

                            const students = await res.json();

                            if (Array.isArray(students) && students.length > 0) {
                                return {
                                    studentCount: students.length,
                                    batchname: students[0].Batchname || "",
                                };
                            }
                            return { studentCount: 0, batchname: "" };
                        } catch {
                            return { studentCount: 0, batchname: "" };
                        }
                    })
                );

                batchArr = batchArr.map((batch, idx) => ({
                    ...batch,
                    studentCount: batchDetails[idx].studentCount,
                    batchname: batchDetails[idx].batchname,
                }));

                setBatches(batchArr);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Unexpected error");
            } finally {
                setLoading(false);
            }
        }

        fetchBatches();
    }, []);

    function handleDownloadExcel() {
        const exportData = batches.map(({ batchcode, batchname, studentCount }) => ({
            "Batch ID": batchcode,
            "Batch Name": batchname ?? "",
            "Students Count": studentCount ?? 0,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Batches");
        XLSX.writeFile(wb, "batch-list.xlsx");
    }

    // Filter batches by batch name
    const filteredBatches = batches.filter(batch => {
        if (!searchBatchName) return true;
        return batch.batchname?.toLowerCase().includes(searchBatchName.toLowerCase());
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header row */}
            <div className="flex flex-col gap-2 bg-[#1976D2] px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Batch Reports
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
                        <li className="font-medium text-white">Batch Reports</li>
                    </ol>
                </nav>
                <p className="text-blue-100 mt-1 pl-4">
                    Browse and search for batch-wise student counts.
                </p>
            </div>

            {/* Data table */}
            <div className="overflow-auto rounded-xl shadow-sm p-4">
                <div
                    className="dark:bg-black bg-white rounded-xl shadow-sm p-4"
                    style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
                >

                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleDownloadExcel}
                            className="w-9 h-9 rounded-full p-2 bg-[#1976d2] hover:bg-[#1251a3] text-white shadow transition"
                            title="Download Excel"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <Input
                            type="text"
                            placeholder="Search by Batch Name..."
                            className="w-1/5"
                            value={searchBatchName}
                            onChange={e => setSearchBatchName(e.target.value)}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredBatches}
                        filterColumn="batchcode"
                        filterPlaceholder="Search by Batch ID..."
                    />
                </div>
            </div>

            {loading && <div className="p-4 text-center">Loading...</div>}
            {error && <div className="p-4 text-center text-red-600">{error}</div>}
        </div>
    );
}
