"use client";
import React, { useContext } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeContext } from "@/context/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

export default function SecretaryDashboard() {
  const { isDark } = useContext(ThemeContext);

  const meetings = [
    { id: 1, project: "Project Alpha", time: "10:00 AM", venue: "Room 301", participants: 4 },
    { id: 2, project: "Project Beta", time: "2:30 PM", venue: "Online", participants: 3 },
    { id: 3, project: "Budget Review", time: "4:00 PM", venue: "Room 105", participants: 5 },
  ];

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Meetings Today", value: "5", color: "text-indigo-500" },
          { title: "Pending Approvals", value: "2", color: "text-yellow-500" },
          { title: "Rescheduled", value: "1", color: "text-green-500" },
        ].map((card, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table of meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.project}</TableCell>
                  <TableCell>{m.time}</TableCell>
                  <TableCell>{m.venue}</TableCell>
                  <TableCell>{m.participants}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
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
