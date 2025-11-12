"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:5000";
const RANGE_OPTIONS = [
  { value: "this-month", label: "This month" },
  { value: "this-week", label: "This week" },
  { value: "today", label: "Today" },
  { value: "last-week", label: "Last week" },
  { value: "this-quarter", label: "This quarter" },
];

export default function Reports() {
  const { isDark } = useContext(ThemeContext);
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  const [range, setRange] = useState("this-month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReports = async (selectedRange = range) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/secretary/reports/summary?range=${selectedRange}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error(err);
      setError("Unable to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadReports(range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, range]);

  const summary = data?.summary || { totalMeetings: 0, totalHours: 0, activeProjects: 0, avgHoursPerExecutive: 0, meetingsByStatus: {} };
  const projects = data?.projects || [];
  const executives = data?.executives || [];
  const tasks = data?.tasks || { total: 0, completed: 0, pending: 0, scheduled: 0, overdue: 0 };

  const totalHoursForProgress = projects.reduce((acc, project) => acc + project.hours, 0) || 1;
  const statusEntries = Object.entries(summary.meetingsByStatus || {});

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports &amp; Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking meeting load, time investments, and outstanding tasks for assigned executives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className={`rounded-md border px-3 py-2 text-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => loadReports(range)} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border border-red-300 bg-red-50 text-red-700">
          <CardContent className="py-6 text-sm">{error}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-indigo-600">{summary.totalMeetings}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total meeting hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">{summary.totalHours} hrs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-yellow-500">{summary.activeProjects}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg hrs / executive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-500">{summary.avgHoursPerExecutive}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting status mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {statusEntries.length === 0 ? (
                  <p className="text-gray-500">No meetings in selected range.</p>
                ) : (
                  statusEntries.map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task health</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Stat pill="bg-blue-100 text-blue-700" label="Scheduled" value={tasks.scheduled} />
                <Stat pill="bg-emerald-100 text-emerald-700" label="Completed" value={tasks.completed} />
                <Stat pill="bg-amber-100 text-amber-700" label="Pending" value={tasks.pending} />
                <Stat pill="bg-rose-100 text-rose-700" label="Overdue" value={tasks.overdue} />
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Project-wise meeting summary</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500">No project-linked meetings in this period.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Total meetings</TableCell>
                      <TableCell>Total hours</TableCell>
                      <TableCell>Unique executives</TableCell>
                      <TableCell>Share</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.project}>
                        <TableCell>{project.project}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-indigo-100 text-indigo-700">
                            {project.meetings}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.hours} hrs</TableCell>
                        <TableCell>{project.uniqueExecutives}</TableCell>
                        <TableCell>
                          <Progress value={(project.hours / totalHoursForProgress) * 100} className="w-[140px]" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Executive workload leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {executives.length === 0 ? (
                <p className="text-sm text-gray-500">No assigned executives or no activity in range.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Executive</TableCell>
                      <TableCell>Meetings</TableCell>
                      <TableCell>Hours booked</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executives.map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{exec.name}</span>
                            {exec.email && <span className="text-xs text-gray-500">{exec.email}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{exec.meetings}</TableCell>
                        <TableCell>{exec.hours} hrs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ pill, label, value }) {
  return (
    <div className={`rounded-lg px-4 py-3 border ${pill} border-transparent`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
