"use client";
import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const { isDark } = useContext(ThemeContext);

  const notifications = [
    {
      id: 1,
      message: "Project Alpha meeting scheduled for tomorrow 3 PM",
      type: "Meeting",
      time: "1h ago",
      status: "unread",
    },
    {
      id: 2,
      message: "Executive B accepted your meeting invite",
      type: "Update",
      time: "4h ago",
      status: "read",
    },
    {
      id: 3,
      message: "New request for Project Gamma discussion",
      type: "Request",
      time: "Yesterday",
      status: "unread",
    },
  ];

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`transition-all ${
              n.status === "unread"
                ? "border-l-4 border-indigo-600"
                : "opacity-80"
            }`}
          >
            <CardHeader className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{n.message}</span>
                <span className="text-sm text-gray-500">{n.time}</span>
              </div>
              <Badge
                variant={
                  n.type === "Meeting"
                    ? "default"
                    : n.type === "Update"
                    ? "outline"
                    : "secondary"
                }
              >
                {n.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline">
                {/* TODO: handleMarkAsRead() */}
                Mark as read
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
