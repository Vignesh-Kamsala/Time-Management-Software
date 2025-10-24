import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Reports() {
  const { isDark } = useContext(ThemeContext);

  const projectStats = [
    { project: "Project A", hours: 5 },
    { project: "Project B", hours: 3 },
  ];

  const taskStats = { completed: 4, pending: 2 };

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <h1 className="text-3xl font-bold mb-6">Reports & Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>Time Spent on Meetings</CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {projectStats.map((p, i) => (
                <p key={i} className="py-2 border-b last:border-b-0">
                  {p.project}: {p.hours} hours
                </p>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Tasks & Engagements</CardHeader>
          <CardContent>
            <p>Completed: {taskStats.completed}</p>
            <p>Pending: {taskStats.pending}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
