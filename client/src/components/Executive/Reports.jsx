import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Reports() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1 className="text-2xl font-bold mb-4">Reports & Statistics</h1>

      <Card className="mb-4">
        <CardHeader>Time Spent on Meetings</CardHeader>
        <CardContent>
          <p>Project A: 5 hours</p>
          <p>Project B: 3 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Tasks & Engagements</CardHeader>
        <CardContent>
          <p>Completed: 4 tasks</p>
          <p>Pending: 2 tasks</p>
        </CardContent>
      </Card>
    </div>
  );
}
