"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { performanceData, students } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StatCard } from "@/components/stat-card";
import { Award, Users, Frown, Smile, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";

export default function DashboardPage() {
  // Dashboard API state
  const [dashboardData, setDashboardData] = useState<{
    Total_Tests: number;
    Total_Students: number;
    Total_Attendes: number;
    Total_tests_Avg_Score: number;
  } | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const course = localStorage.getItem("apex-batchcode");
        const res = await fetch("/api/dashboard", {
          headers: {
            "x-course": course || "",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await res.json();
        setDashboardData(data);
        if (Array.isArray(data) && data.length > 0) {
          setDashboardData(data[0]);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    }

    fetchDashboard();
  }, []);

  // Only use API values, show nothing if not loaded yet
  const totalStudents = dashboardData?.Total_Students ?? "";
  const totalTests = dashboardData?.Total_Tests ?? "";
  const totalAttendees = dashboardData?.Total_Attendes ?? "";
  const avgScore = dashboardData?.Total_tests_Avg_Score ?? "";

  const avgAccuracy = (performanceData.reduce((acc, t) => acc + (t.TotalNoOfCorrects / t.TotalQuestions), 0) / performanceData.length) * 100;

  const leaderboard = [...performanceData]
    .sort((a, b) => b.Total_Score - a.Total_Score)
    .slice(0, 5)
    .map(d => ({
      name: students.find(s => s.StudentId === d.StudentId)?.StudentName || 'Unknown',
      score: d.Total_Score,
      id: d.StudentId
    }));

  const testsByDate = performanceData.sort((a, b) => new Date(a.TestDate).getTime() - new Date(b.TestDate).getTime()).slice(-10);

  const chartData = testsByDate.map(t => ({
    date: new Date(t.TestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: t.Total_Score
  }));

  const topCentres = useMemo(() => {
    const centreScores: { [key: string]: { totalScore: number; count: number } } = {};
    performanceData.forEach(d => {
      const centre = students.find(s => s.StudentId === d.StudentId)?.centre;
      if (centre) {
        if (!centreScores[centre]) {
          centreScores[centre] = { totalScore: 0, count: 0 };
        }
        centreScores[centre].totalScore += d.Total_Score;
        centreScores[centre].count++;
      }
    });

    return Object.entries(centreScores)
      .map(([name, data]) => ({ name, avgScore: data.totalScore / data.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }, []);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header row with breadcrumb for dashboard */}
      <div className="w-full bg-[#1976D2] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        </div>
        <nav className="text-sm text-blue-100 mt-1" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li className="font-medium text-white pl-4">Home</li>
          </ol>
        </nav>
        <p className="text-blue-100 mt-1 pl-4">
          An overview of student performance metrics and trends.
        </p>
      </div>

      {/* Content wrapper with spacing */}
      <div className="flex flex-col gap-8 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={totalStudents} icon={Users} />
          <StatCard title="Students Attempting Test" value={totalAttendees} icon={Smile} />
          <StatCard title="Students Skipped Test" value={Number(totalStudents) - Number(totalAttendees)} icon={Award} />
          <StatCard title="Total Tests Taken" value={totalTests} icon={Frown} variant="destructive" />
        </div>
      </div>

      {/* <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard API Data Check</h1>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(dashboardData, null, 2)}</pre>
      </div> */}

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 animate-slide-up animation-delay-400">
          <CardHeader>
            <CardTitle>Top 5 Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {leaderboard.map((student, index) => (
                <li key={index}>
                  <Link href={`/student-reports/${student.id}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary transition-colors">
                    <Avatar>
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                    </div>
                    <div className="font-bold text-primary">{student.score}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div> */}

      {/* <Card className="animate-slide-up animation-delay-600">
        <CardHeader>
            <CardTitle>Top 5 Performing Centres</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {topCentres.map((centre, index) => (
                    <li key={index} className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary transition-colors">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-lg">{centre.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-primary text-xl">{centre.avgScore.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Avg. Score</p>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card> */}
    </div>
  );
}
