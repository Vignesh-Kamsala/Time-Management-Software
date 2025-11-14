import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock4, MapPin, Video, Plus, Search, UserPlus, Mail, CheckCircle2, AlertCircle, } from "lucide-react";
/**
 * Compact Skeleton Dashboard
 * - Smaller, adaptive skeleton placeholders
 * - Reduced paddings/margins for a compact look while loading
 * - Keeps original layout & logic
 */
export default function Dashboard() {
    const { isDark } = useContext(ThemeContext);
    // date state (YYYY-MM-DD)
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    // backend-driven state
    const [meetings, setMeetings] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // AUTH header helper (adjust if you store token elsewhere)
    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
    // robust fetch helper with diagnostics (returns JSON or throws detailed Error)
    async function safeFetchJson(url, opts = {}) {
        const headers = { "Content-Type": "application/json", ...getAuthHeaders(), ...(opts.headers || {}) };
        const res = await fetch(url, { ...opts, headers });
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
            const text = await res.text().catch(() => "<unable to read>");
            const snippet = text.length > 300 ? text.slice(0, 300) + "..." : text;
            throw new Error(`HTTP ${res.status} ${res.statusText} — ${contentType}. Body: ${snippet}`);
        }
        if (contentType.includes("application/json")) {
            return res.json();
        }
        else {
            const text = await res.text().catch(() => "");
            throw new Error(`Expected JSON but got ${contentType}. Body: ${text.slice(0, 300)}`);
        }
    }
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        // require token early to avoid HTML redirect pages
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
            setError("No auth token found — please sign in.");
            setLoading(false);
            return;
        }
        const dateQuery = date;
        Promise.all([
            safeFetchJson(`https://time-management-software.onrender.com/api/meetings/my-day?date=${encodeURIComponent(dateQuery)}`),
            safeFetchJson("https://time-management-software.onrender.com/api/executive/info"),
            safeFetchJson("https://time-management-software.onrender.com/api/executive/me/tasks"),
        ])
            .then(([meetRes, infoRes, tasksRes]) => {
            if (!mounted)
                return;
            // meetings: ensure array
            const rawMeetings = Array.isArray(meetRes.meetings) ? meetRes.meetings : (meetRes.meetings ? [meetRes.meetings] : []);
            setMeetings(rawMeetings);
            // user info
            const loadedUser = infoRes.user || null;
            setUser(loadedUser);
            // tasks
            const loadedTasks = tasksRes.tasks || [];
            setTasks(loadedTasks);
            // map leaves
            const leavePeriods = (loadedUser && Array.isArray(loadedUser.leavePeriods)) ? loadedUser.leavePeriods : [];
            const mappedLeaves = leavePeriods.map(lp => {
                try {
                    const s = new Date(lp.start).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const e = new Date(lp.end).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const label = lp.reason || "Leave";
                    return { date: s === e ? s : `${s} — ${e}`, label };
                }
                catch (e) {
                    return { date: String(lp.start), label: lp.reason || "Leave" };
                }
            });
            setLeaves(mappedLeaves);
            setLoading(false);
        })
            .catch(err => {
            if (!mounted)
                return;
            console.error("Dashboard load error (diagnostic):", err);
            setError(err.message || "Failed to load dashboard data");
            setLoading(false);
        });
        return () => { mounted = false; };
    }, [date]);
    // KPI calculations
    const kpis = useMemo(() => {
        const meetingsToday = meetings.length;
        let focusMs = 0;
        for (const t of tasks) {
            const s = t.startTime ? new Date(t.startTime).getTime() : null;
            const e = t.endTime ? new Date(t.endTime).getTime() : null;
            if (s && e && e > s)
                focusMs += (e - s);
        }
        const focusHours = Math.round((focusMs / (1000 * 60 * 60)) * 10) / 10;
        const tasksCount = tasks.length;
        const leavesCount = leaves.length;
        return [
            { label: "Meetings Today", value: meetingsToday, icon: CalendarDays },
            { label: "Focus (hrs)", value: focusHours, icon: Clock4 },
            { label: "Tasks", value: tasksCount, icon: Search },
            { label: "Upcoming Leaves", value: leavesCount, icon: Mail },
        ];
    }, [meetings, tasks, leaves]);
    // format meetings for UI
    const formattedMeetings = useMemo(() => {
        return meetings.map((m) => {
            const s = m.startTime ? new Date(m.startTime) : null;
            const e = m.endTime ? new Date(m.endTime) : null;
            const time = s && e
                ? `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : (s ? new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-");
            const title = m.title || m.name || "Untitled";
            const venue = m.venue || m.location || "—";
            const attendees = Array.isArray(m.participants) && m.participants.length > 0
                ? m.participants.map(p => p.name || p.email || String(p))
                : (Array.isArray(m.invited) ? m.invited.map(i => i.email || (i.execId ? String(i.execId) : "invite")) : []);
            const status = m.status ? String(m.status).charAt(0).toUpperCase() + String(m.status).slice(1) : "Pending";
            return { id: m._id, time, title, venue, attendees, status };
        });
    }, [meetings]);
    const formattedTasks = useMemo(() => {
        return tasks.map((t) => {
            const s = t.startTime ? new Date(t.startTime) : null;
            const time = s ? s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
            return {
                id: t._id || `${t.title}-${time}`,
                time,
                task: t.title || t.description || "Untitled Task",
                priority: t.priority || "Medium",
            };
        });
    }, [tasks]);
    // date display
    const today = useMemo(() => new Date(date), [date]);
    const localeDate = useMemo(() => new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(today), [today]);
    // improved dark-mode / card styles
    const base = isDark ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900/95 to-slate-800 text-slate-100" : "bg-slate-50 text-slate-900";
    const cardTone = isDark
        ? "bg-gradient-to-br from-slate-900/70 via-slate-850/50 to-slate-800/60 border border-slate-800/60 backdrop-blur-sm"
        : "bg-white";
    // status badges mapping (more consistent)
    const statusBadge = (status) => {
        const map = {
            Confirmed: { variant: "default", icon: CheckCircle2 },
            Scheduled: { variant: "default", icon: CheckCircle2 },
            "Awaiting RSVP": { variant: "secondary", icon: AlertCircle },
            Tentative: { variant: "outline", icon: AlertCircle },
            Pending: { variant: "outline", icon: AlertCircle },
            Cancelled: { variant: "outline", icon: AlertCircle },
        };
        const cfg = map[status] ?? map["Tentative"];
        const Icon = cfg.icon;
        return (_jsxs(Badge, { variant: cfg.variant, className: "gap-1 inline-flex items-center text-xs", children: [_jsx(Icon, { className: "h-3.5 w-3.5" }), " ", _jsx("span", { children: status })] }));
    };
    // --- Compact skeleton components ---
    // Small, responsive KPI skeletons (uses smaller avatar and tighter spacing)
    const SkeletonKPIs = () => {
        return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-3 rounded-lg border p-3 bg-white/60 dark:bg-slate-300/40 backdrop-blur-sm shadow-sm", children: [_jsx(Skeleton, { className: "h-8 w-8 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-[120px]" }), _jsx(Skeleton, { className: "h-4 w-[80px]" })] })] }, i))) }));
    };
    // Compact list skeleton: reduced avatar + smaller text lines + tighter paddings
    const SkeletonList = ({ rows = 3 }) => {
        return (_jsx("div", { className: "space-y-3", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-3 rounded-lg border p-3 bg-white/60 dark:bg-slate-300/40 backdrop-blur-sm shadow-sm", children: [_jsx(Skeleton, { className: "h-8 w-8 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-2/3" }), _jsx(Skeleton, { className: "h-4 w-1/3" })] })] }, i))) }));
    };
    return (_jsxs("div", { className: `${base} min-h-screen transition-colors duration-150`, children: [_jsx("div", { className: "sticky top-0 z-40", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-4 md:py-5", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 w-full md:w-auto", children: [_jsx("div", { className: "flex-1 min-w-0", children: _jsx(Input, { placeholder: "Search meetings, people, projects...", className: "w-full md:min-w-[360px] shadow-sm border-0 focus-visible:ring-2" }) }), _jsxs(Button, { size: "sm", className: "ml-1 shrink-0", variant: "secondary", children: [_jsx(Search, { className: "h-4 w-4" }), " ", _jsx("span", { className: "hidden md:inline", children: "Search" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 md:gap-3 justify-end", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { className: "gap-2", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4" }), " ", _jsx("span", { className: "hidden sm:inline", children: "New" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { children: "New Meeting" }), _jsx(DropdownMenuItem, { children: "Find Common Slot" }), _jsx(DropdownMenuItem, { children: "Add Task" }), _jsx(DropdownMenuItem, { children: "Add Leave" })] })] }), _jsxs(Button, { size: "sm", variant: "secondary", className: "gap-2 shrink-0", children: [_jsx(UserPlus, { className: "h-4 w-4" }), " ", _jsx("span", { className: "hidden md:inline", children: "Invite" })] })] })] }), _jsxs("div", { className: "mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-2xl md:text-3xl font-semibold tracking-tight leading-tight", children: "Dashboard" }), _jsxs("p", { className: "mt-1 flex items-center gap-2 text-sm opacity-80", children: [_jsx(CalendarDays, { className: "h-4 w-4" }), " ", localeDate] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 md:gap-3", children: [_jsx(Button, { size: "sm", variant: "outline", className: "shrink-0", children: "Today" }), _jsx(Button, { size: "sm", variant: "outline", className: "shrink-0", children: "Week" }), _jsxs(Button, { size: "sm", className: "gap-2 shrink-0", children: [_jsx(Plus, { className: "h-4 w-4" }), " New Meeting"] })] })] })] }) }), _jsxs("div", { className: "mx-auto max-w-7xl px-4 mt-6 pb-12", children: [error && (_jsx(Card, { className: `${cardTone} border-0 shadow-sm mb-4`, children: _jsx(CardContent, { children: _jsxs("div", { className: "text-sm text-destructive", children: ["Error: ", String(error)] }) }) })), loading ? (_jsx(SkeletonKPIs, {})) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: kpis.map(({ label, value, icon: Icon }, i) => (_jsx(Card, { className: `${cardTone} border-0 shadow-sm`, children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-wide opacity-70", children: label }), _jsx("p", { className: "text-xl font-semibold mt-1", children: value })] }), _jsx("div", { className: "rounded-lg p-1 bg-white/5 border border-white/6", children: _jsx(Icon, { className: "h-4 w-4" }) })] }) }) }, i))) })), _jsxs("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6", children: [_jsxs(Card, { className: `${cardTone} border-0 shadow-sm lg:col-span-2`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "tracking-tight", children: "Next Up" }), _jsxs(Button, { size: "sm", variant: "ghost", className: "gap-2", children: [_jsx(Search, { className: "h-4 w-4" }), " ", _jsx("span", { className: "hidden sm:inline", children: "Find Slot" })] })] }) }), _jsx(CardContent, { className: "pt-0", children: loading ? (_jsx(SkeletonList, { rows: 4 })) : (_jsx("div", { className: "space-y-3", children: (() => {
                                                const items = [];
                                                for (const m of meetings) {
                                                    const start = m.startTime ? new Date(m.startTime) : null;
                                                    items.push({ type: "MEETING", start, title: m.title || m.name || "Meeting", meta: m.venue || m.location, isVirtual: m.venue === "Zoom" || m.isVirtual, raw: m });
                                                }
                                                for (const t of tasks) {
                                                    const start = t.startTime ? new Date(t.startTime) : null;
                                                    items.push({ type: "TASK", start, title: t.title || t.description || "Task", meta: t.description || "", raw: t });
                                                }
                                                items.sort((a, b) => {
                                                    const as = a.start ? a.start.getTime() : Infinity;
                                                    const bs = b.start ? b.start.getTime() : Infinity;
                                                    return as - bs;
                                                });
                                                const next = items.slice(0, 6);
                                                if (next.length === 0)
                                                    return _jsx("div", { className: "text-sm opacity-70", children: "No upcoming items." });
                                                return next.map((n, i) => {
                                                    const time = n.start ? n.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                                                    return (_jsxs("div", { className: "flex items-start gap-3 rounded-lg border px-2 py-2", children: [_jsx("div", { className: "shrink-0 mt-0.5", children: _jsx(Badge, { variant: "secondary", className: "text-xs py-0.5 px-2", children: time }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "font-medium truncate text-sm", children: n.title }), _jsxs("div", { className: "mt-1 flex items-center gap-2 text-sm opacity-80", children: [n.type === "MEETING" ? (n.isVirtual ? (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Video, { className: "h-4 w-4" }), " ", n.meta || "Virtual"] })) : (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "h-4 w-4" }), " ", n.meta || "Location"] }))) : (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Clock4, { className: "h-4 w-4" }), " ", n.meta || "Task"] })), _jsx(Badge, { variant: "outline", className: "text-xs", children: n.type })] })] })] }, i));
                                                });
                                            })() })) })] }), _jsxs(Card, { className: `${cardTone} border-0 shadow-sm`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "tracking-tight", children: "Upcoming Leaves" }) }), _jsx(CardContent, { className: "pt-0", children: loading ? (_jsx(SkeletonList, { rows: 3 })) : leaves.length ? (_jsx("div", { className: "space-y-2", children: leaves.map((l, i) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border px-2 py-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CalendarDays, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium text-sm", children: l.date })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: l.label })] }, i))) })) : (_jsx("p", { className: "text-sm opacity-70", children: "No upcoming leaves." })) })] })] }), _jsxs("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6", children: [_jsxs(Card, { className: `${cardTone} border-0 shadow-sm`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "tracking-tight", children: "Today's Meetings" }) }), _jsx(CardContent, { className: "pt-0", children: _jsx("div", { className: "divide-y", children: loading ? (_jsx(SkeletonList, { rows: 4 })) : formattedMeetings.length === 0 ? (_jsx("div", { className: "py-4 text-sm opacity-70", children: "No meetings for this day." })) : (formattedMeetings.map((m, i) => (_jsxs("div", { className: "py-3 flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "font-medium truncate text-sm", children: m.title }), statusBadge(m.status)] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm opacity-80", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Clock4, { className: "h-4 w-4" }), " ", m.time] }), m.venue === "Zoom" ? (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Video, { className: "h-4 w-4" }), " ", m.venue] })) : (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "h-4 w-4" }), " ", m.venue] })), _jsx(Separator, { orientation: "vertical", className: "h-4" }), _jsxs("span", { className: "truncate text-sm", children: ["Attendees: ", m.attendees && m.attendees.length ? m.attendees.join(", ") : "—"] })] })] }, m.id || i)))) }) })] }), _jsxs(Card, { className: `${cardTone} border-0 shadow-sm`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "tracking-tight", children: "Today's Tasks" }), _jsxs(Button, { size: "sm", variant: "ghost", className: "gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), " Add Task"] })] }) }), _jsx(CardContent, { className: "pt-0", children: loading ? (_jsx(SkeletonList, { rows: 4 })) : formattedTasks.length === 0 ? (_jsx("div", { className: "text-sm opacity-70", children: "No tasks for today." })) : (_jsx("div", { className: "space-y-3", children: formattedTasks.map((t, i) => (_jsxs("div", { className: "flex items-start gap-3 rounded-lg border px-2 py-2", children: [_jsx(Badge, { variant: "secondary", className: "text-xs py-0.5 px-2", children: t.time }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "font-medium truncate text-sm", children: t.task }), _jsxs("div", { className: "mt-1 text-sm opacity-80 flex items-center gap-2", children: [_jsx("span", { children: "Priority:" }), _jsx(Badge, { variant: t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "outline", className: "text-xs", children: t.priority })] })] })] }, t.id || i))) })) })] })] })] })] }));
}
