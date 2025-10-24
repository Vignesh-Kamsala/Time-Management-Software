import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { CalendarDays } from "lucide-react";

export default function Schedule() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <CalendarDays className="mr-2" /> My Schedule
      </h1>

      <div className="border p-4 rounded">
        {/* Dummy calendar for now */}
        <p>09:00 AM - Meeting with Team A</p>
        <p>11:00 AM - Project Discussion</p>
        <p>02:00 PM - Client Call</p>
      </div>
    </div>
  );
}
