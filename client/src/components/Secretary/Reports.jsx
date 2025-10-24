"use client";
import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const { isDark } = useContext(ThemeContext);

  const stats = [
    { project: "Project Alpha", hours: 12, meetings: 4 },
    { project: "Project Beta", hours: 8, meetings: 3 },
    { project: "Budget Planning", hours: 10, meetings: 5 },
  ];

  const totalHours = stats.reduce((a, b) => a + b.hours, 0);

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className="text-3xl font-bold mb-6">Reports & Statistics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-indigo-600">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Hours Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">{totalHours} hrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-500">{stats.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Project details */}
      <Card>
        <CardHeader>
          <CardTitle>Project-wise Meeting Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Total Meetings</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Progress</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.project}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-700">
                      {s.meetings}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.hours} hrs</TableCell>
                  <TableCell>
                    <Progress value={(s.hours / totalHours) * 100} className="w-[120px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
