import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Meetings() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>

      <div className="flex flex-col gap-3 max-w-md">
        <Input placeholder="Meeting Title / Purpose" />
        <Input placeholder="Participants (comma separated)" />
        <Input placeholder="Venue" />
        <Input type="time" placeholder="Start Time" />
        <Input type="number" placeholder="Duration (hours)" />
        <Button>Find Common Slot & Schedule</Button>
      </div>
    </div>
  );
}
