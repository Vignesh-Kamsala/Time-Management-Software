import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Engagements() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <h1 className="text-3xl font-bold mb-6">Engagements / Tasks</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>Add a Task</CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input placeholder="Task / Project Job" />
          <Input placeholder="Time allocation (hours)" type="number" />
          <Button>Add Task</Button>
        </CardContent>
      </Card>
    </div>
  );
}
