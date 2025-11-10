import React, { useContext, useMemo } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock4,
  MapPin,
  Video,
  Plus,
  Search,
  UserPlus,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const { isDark } = useContext(ThemeContext);

  // ---- Dummy Data (you can swap this with API data later) ----
  const today = useMemo(() => new Date(), []);
  const localeDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(today),
    [today]
  );

  const kpis = [
    { label: "Meetings Today", value: 4, icon: CalendarDays },
    { label: "Focus (hrs)", value: 2, icon: Clock4 },
    { label: "Free Slots", value: 3, icon: Search },
    { label: "Emails Sent", value: 5, icon: Mail },
  ];

  const nextUp = [
    { time: "09:30 AM", title: "Deep Work Block", type: "TASK", meta: "Strategy draft" },
    { time: "10:30 AM", title: "Project Apollo Sync", type: "MEETING", meta: "Room 3A", venue: "Room 3A" },
    { time: "12:00 PM", title: "Client Call – Northwind", type: "MEETING", meta: "Zoom", isVirtual: true },
    { time: "01:00 PM", title: "Lunch", type: "BREAK", meta: "Cafeteria" },
  ];

  const meetings = [
    { time: "10:30 AM – 11:00 AM", title: "Project Apollo Sync", venue: "Room 3A", attendees: ["Asha","Rohan","Meera"], status: "Confirmed" },
    { time: "12:00 PM – 12:45 PM", title: "Client Call – Northwind", venue: "Zoom", attendees: ["You","Client Team"], status: "Awaiting RSVP" },
    { time: "02:15 PM – 03:00 PM", title: "Budget Review", venue: "Room 2B", attendees: ["Finance","Ops"], status: "Confirmed" },
    { time: "04:00 PM – 04:30 PM", title: "1:1 – Mentorship", venue: "Room 1C", attendees: ["You","Intern"], status: "Tentative" },
  ];

  const tasks = [
    { time: "09:30 AM", task: "Draft Q4 Strategy", priority: "High" },
    { time: "01:45 PM", task: "Review PRD v2", priority: "Medium" },
    { time: "03:15 PM", task: "Email follow-ups", priority: "Low" },
  ];

  const leaves = [{ date: "Nov 12", label: "Casual Leave" }, { date: "Nov 22", label: "Half-day (PM)" }];

  // ---- Styling helpers ----
  const base = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardTone = isDark ? "bg-slate-900/60" : "bg-white";

  const statusBadge = (status) => {
    const map = {
      Confirmed: { variant: "default", icon: CheckCircle2 },
      "Awaiting RSVP": { variant: "secondary", icon: AlertCircle },
      Tentative: { variant: "outline", icon: AlertCircle },
    };
    const cfg = map[status] ?? map["Tentative"];
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1 inline-flex items-center">
        <Icon className="h-3.5 w-3.5" /> <span className="text-xs">{status}</span>
      </Badge>
    );
  };

  return (
    <div className={`${base} min-h-screen`}>
      {/* Top header: search + actions */}
      <div className="sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
          {/* Search + Actions container */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left: search (allows shrinking, won't push actions) */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search meetings, people, projects..."
                  className="w-full md:min-w-[360px] shadow-sm border-0 focus-visible:ring-2"
                />
              </div>

              <Button size="sm" className="ml-1 shrink-0" variant="secondary">
                <Search className="h-4 w-4" /> <span className="hidden md:inline">Search</span>
              </Button>
            </div>

            {/* Right: actions */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" size="sm">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>New Meeting</DropdownMenuItem>
                  <DropdownMenuItem>Find Common Slot</DropdownMenuItem>
                  <DropdownMenuItem>Add Task</DropdownMenuItem>
                  <DropdownMenuItem>Add Leave</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" variant="secondary" className="gap-2 shrink-0">
                <UserPlus className="h-4 w-4" /> <span className="hidden md:inline">Invite</span>
              </Button>
            </div>
          </div>

          {/* Title row */}
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">Dashboard</h1>
              <p className="mt-1 flex items-center gap-2 text-sm opacity-80">
                <CalendarDays className="h-4 w-4" /> {localeDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Button size="sm" variant="outline" className="shrink-0">Today</Button>
              <Button size="sm" variant="outline" className="shrink-0">Week</Button>
              <Button size="sm" className="gap-2 shrink-0"><Plus className="h-4 w-4" /> New Meeting</Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - NOTICE: removed negative top-margin to avoid overlapping */}
      <div className="mx-auto max-w-7xl px-4 mt-6 pb-12">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {kpis.map(({ label, value, icon: Icon }, i) => (
            <Card key={i} className={`${cardTone} border-0 shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
                    <p className="text-2xl font-semibold mt-1">{value}</p>
                  </div>
                  <div className="rounded-xl p-2 bg-opacity-10">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Next Up timeline */}
          <Card className={`${cardTone} border-0 shadow-sm lg:col-span-2`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="tracking-tight">Next Up</CardTitle>
                <Button size="sm" variant="ghost" className="gap-2">
                  <Search className="h-4 w-4" /> <span className="hidden sm:inline">Find Slot</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {nextUp.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border px-3 py-3">
                    <div className="shrink-0 mt-0.5">
                      <Badge variant="secondary">{n.time}</Badge>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{n.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm opacity-80">
                        {n.type === "MEETING" ? (
                          n.isVirtual ? (
                            <span className="inline-flex items-center gap-1"><Video className="h-4 w-4" /> {n.meta}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {n.meta}</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1"><Clock4 className="h-4 w-4" /> {n.meta}</span>
                        )}

                        <Badge variant="outline" className="text-xs">{n.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Leaves */}
          <Card className={`${cardTone} border-0 shadow-sm`}>
            <CardHeader className="pb-2">
              <CardTitle className="tracking-tight">Upcoming Leaves</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {leaves.length ? (
                  leaves.map((l, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-medium">{l.date}</span>
                      </div>
                      <Badge variant="outline">{l.label}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-70">No upcoming leaves.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Today's Meetings */}
          <Card className={`${cardTone} border-0 shadow-sm`}>
            <CardHeader className="pb-2">
              <CardTitle className="tracking-tight">Today's Meetings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y">
                {meetings.map((m, i) => (
                  <div key={i} className="py-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium truncate">{m.title}</p>
                      {statusBadge(m.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm opacity-80">
                      <span className="inline-flex items-center gap-1"><Clock4 className="h-4 w-4" /> {m.time}</span>
                      {m.venue === "Zoom" ? (
                        <span className="inline-flex items-center gap-1"><Video className="h-4 w-4" /> {m.venue}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {m.venue}</span>
                      )}
                      <Separator orientation="vertical" className="h-4" />
                      <span className="truncate">Attendees: {m.attendees.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className={`${cardTone} border-0 shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="tracking-tight">Today's Tasks</CardTitle>
                <Button size="sm" variant="ghost" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {tasks.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border px-3 py-3">
                    <Badge variant="secondary">{t.time}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{t.task}</p>
                      <div className="mt-1 text-sm opacity-80 flex items-center gap-2">
                        <span>Priority:</span>
                        <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "outline"}>
                          {t.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
//**
/** **/