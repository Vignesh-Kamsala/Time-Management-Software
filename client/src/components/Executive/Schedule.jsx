import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Schedule() {
  const { isDark } = useContext(ThemeContext);

  const appointments = [
    { time: "09:00 AM", event: "Team Meeting" },
    { time: "11:00 AM", event: "Project Discussion" },
    { time: "02:00 PM", event: "Client Call" },
  ];

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <h1 className="text-3xl font-bold mb-6">My Schedule</h1>

      <ScrollArea className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a, i) => (
              <TableRow key={i}>
                <TableCell>{a.time}</TableCell>
                <TableCell>{a.event}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
