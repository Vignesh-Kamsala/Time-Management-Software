import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Engagements() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1 className="text-2xl font-bold mb-4">Engagements / Tasks</h1>

      <div className="flex flex-col gap-3 max-w-md">
        <Input placeholder="Task / Project Job" />
        <Input placeholder="Time allocation (hours)" type="number" />
        <Button>Add Task</Button>
      </div>
    </div>
  );
}
