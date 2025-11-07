"use client";

import { useContext, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Calendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function timeToday(timeStr) {
  const [time, meridiem] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hours = h % 12 + (meridiem?.toLowerCase() === "pm" ? 12 : 0);
  const d = new Date();
  d.setHours(hours, m || 0, 0, 0);
  return d;
}

export default function Schedule() {
  const { isDark } = useContext(ThemeContext);

  const appointments = [
    { time: "09:00 AM", event: "Team Meeting" },
    { time: "11:00 AM", event: "Project Discussion" },
    { time: "02:00 PM", event: "Client Call" },
  ];

  const events = useMemo(
    () =>
      appointments.map((a) => ({
        title: a.event,
        start: timeToday(a.time),
        end: new Date(timeToday(a.time).getTime() + 60 * 60 * 1000),
      })),
    [appointments]
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState(Views.MONTH);

  const bgBase = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white";

  const workdayMin = new Date(1970, 0, 1, 9, 0, 0);
  const workdayMax = new Date(1970, 0, 1, 17, 0, 0);

  function go(dir) {
    if (dir === "today") return setCurrentDate(new Date());
    const d = new Date(currentDate);
    if (activeView === Views.MONTH) {
      d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    } else {
      d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    }
    setCurrentDate(d);
  }

  function handleSelectSlot(slotInfo) {
    // If you click a day in Month view, drill into that Day (work hours will show)
    if (activeView === Views.MONTH) {
      setCurrentDate(slotInfo.start);
      setActiveView(Views.DAY);
    }
  }

  // Style weekends as disabled (for both Month and Work Week views)
  function dayPropGetter(date) {
    const day = date.getDay(); // 0 Sun, 6 Sat
    if (day === 0 || day === 6) {
      return { className: "rbc-weekend-disabled" };
    }
    return {};
  }

  return (
    <div className={`${bgBase} min-h-screen`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">My Schedule</h1>
            <p className="text-sm text-muted-foreground">Month, Work Week, and Day views. Weekends disabled; hours 9am–5pm.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => go("today")}>
              <CalendarIcon className="h-4 w-4" /> Today
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className={`${cardBg} mb-6`}> 
          <CardContent className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => go("prev")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-[14rem] text-center text-lg font-medium tracking-tight">
                {format(currentDate, activeView === Views.MONTH ? "MMMM yyyy" : "PPPP")}
              </div>
              <Button variant="ghost" size="icon" onClick={() => go("next")}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Tabs value={activeView} onValueChange={(v) => setActiveView(v)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger className="px-4" value={Views.MONTH}>Month</TabsTrigger>
                <TabsTrigger className="px-4" value={Views.WORK_WEEK}>Work Week</TabsTrigger>
                <TabsTrigger className="px-4" value={Views.DAY}>Day</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className={`${cardBg} lg:col-span-2`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rbc-tailwind-overrides">
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={currentDate}
                  view={activeView}
                  views={[Views.MONTH, Views.WORK_WEEK, Views.DAY]}
                  onView={(v) => setActiveView(v)}
                  onNavigate={(d) => setCurrentDate(d)}
                  selectable
                  onSelectSlot={handleSelectSlot}
                  step={30}
                  timeslots={2}
                  popup
                  min={workdayMin}
                  max={workdayMax}
                  scrollToTime={workdayMin}
                  dayPropGetter={dayPropGetter}
                  className="rounded-2xl border"
                  style={{ height: 680 }}
                  toolbar={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card className={`${cardBg}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Agenda — {format(currentDate, "PPP")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[680px] rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="w-[140px] text-xs uppercase tracking-wide">Time</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a, i) => (
                      <TableRow key={i} className="hover:bg-muted/40">
                        <TableCell className="font-medium">{a.time}</TableCell>
                        <TableCell>{a.event}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        /* Calendar polish */
        .rbc-tailwind-overrides .rbc-toolbar { display: none; }
        .rbc-tailwind-overrides .rbc-month-view, 
        .rbc-tailwind-overrides .rbc-time-view { background: transparent; }
        .dark .rbc-off-range-bg { background: rgba(255,255,255,0.03); }
        .dark .rbc-today { background: rgba(59,130,246,0.10); }
        .rbc-today { background: rgba(59,130,246,0.08); }
        .rbc-event { border-radius: 12px; padding: 4px 8px; box-shadow: 0 1px 1px rgba(0,0,0,0.08);}        
        .rbc-header { padding: 10px 0; font-weight: 600; }
        .rbc-time-view .rbc-time-content { border-top: none; }
        .rbc-timeslot-group { min-height: 44px; }
        .rbc-time-gutter .rbc-timeslot-group { align-items: center; }
        .rbc-time-gutter .rbc-time-slot { padding-top: 2px; }
        /* Disable weekends visually + interactions */
        .rbc-weekend-disabled { opacity: 0.35; filter: saturate(0.4); pointer-events: none; }
      `}</style>
    </div>
  );
}
