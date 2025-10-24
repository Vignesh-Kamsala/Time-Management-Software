import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Meetings() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <h1 className="text-3xl font-bold mb-6">Meetings</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>Schedule a Meeting</CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input placeholder="Meeting Title / Purpose" />
          <Input placeholder="Participants (comma separated)" />
          <Input placeholder="Venue" />
          <Input type="time" placeholder="Start Time" />
          <Input type="number" placeholder="Duration (hours)" />
          <Button>Find Common Slot & Schedule</Button>
        </CardContent>
      </Card>
    </div>
  );
}
