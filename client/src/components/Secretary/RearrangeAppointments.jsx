"use client";
import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function RearrangeAppointments() {
  const { isDark } = useContext(ThemeContext);

  const appointments = [
    { id: 1, executive: "Alice", project: "Project X", current: "10:00 AM", proposed: "11:00 AM" },
    { id: 2, executive: "Bob", project: "Budget Review", current: "2:30 PM", proposed: "3:30 PM" },
    { id: 3, executive: "Carol", project: "Marketing Sync", current: "4:00 PM", proposed: "4:30 PM" },
  ];

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className="text-3xl font-bold mb-6">Rearrange Appointments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Rearrangements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Executive</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Current Time</TableCell>
                <TableCell>Proposed Time</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.executive}</TableCell>
                  <TableCell>{a.project}</TableCell>
                  <TableCell>{a.current}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-700">
                      {a.proposed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">
                      Accept
                    </Button>
                    <Button variant="secondary" size="sm">
                      Modify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* TODO: integrate drag-drop calendar later */}
        </CardContent>
      </Card>
    </div>
  );
}
