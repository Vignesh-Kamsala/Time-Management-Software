"use client";
import React, { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ScheduleMeeting() {
  const { isDark } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    title: "",
    participants: "",
    date: "",
    startTime: "",
    duration: "",
    venue: "",
    purpose: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
      <h1 className="text-3xl font-bold mb-6">Schedule Meeting</h1>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>New Meeting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Input
              placeholder="Meeting Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <Input
              placeholder="Participants (comma separated emails)"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <Input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
            <Input
              placeholder="Duration (hours)"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
            <Input
              placeholder="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
            />
            <Textarea
              placeholder="Purpose or project details..."
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
            />

            <div className="flex gap-3">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                {/* TODO: handleFindCommonSlot() */}
                Find Common Slot
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                {/* TODO: handleCreateMeeting() */}
                Create Meeting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
