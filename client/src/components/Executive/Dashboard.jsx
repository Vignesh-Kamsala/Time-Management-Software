import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Dashboard() {
  const { isDark } = useContext(ThemeContext);

  const meetings = [
    { time: "10:00 AM", title: "Project Sync", venue: "Room 101" },
    { time: "12:00 PM", title: "Client Call", venue: "Zoom" },
  ];

  const tasks = [
    { time: "02:00 PM", task: "Prepare presentation slides" },
    { time: "04:00 PM", task: "Review project report" },
  ];

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>Today's Meetings</CardHeader>
        <CardContent>
          {meetings.map((m, i) => (
            <p key={i}>{m.time} - {m.title} ({m.venue})</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Today's Tasks</CardHeader>
        <CardContent>
          {tasks.map((t, i) => (
            <p key={i}>{t.time} - {t.task}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
