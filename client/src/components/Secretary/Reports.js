// src/components/Secretary/SecretaryReportPage.jsx
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend, } from "recharts";
import { Download, RefreshCcw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ThemeContext } from "@/context/ThemeContext";
/**
 * SecretaryReportPage
 * - fetches /api/secretary/reports/summary?range=...
 * - displays KPIs, charts and tables
 */
export default function SecretaryReportPage() {
    const { isDark } = useContext(ThemeContext || { isDark: false });
    const API_BASE = "https://time-management-software.onrender.com";
    const [range, setRange] = useState("this-month");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    // load token from localStorage (client-only)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    async function loadReports(selectedRange = range) {
        if (!token) {
            setError("Missing auth token (please login).");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/reports/summary?range=${encodeURIComponent(selectedRange)}`, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error ${res.status}: ${text}`);
            }
            const payload = await res.json();
            setData(payload);
        }
        catch (err) {
            console.error("loadReports error", err);
            setError(err.message || "Failed to load reports");
            setData(null);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        // load on first render
        if (typeof window !== "undefined")
            loadReports(range);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // derived data for charts
    const { summary, projects, executives, tasks, meetingsByStatusArray, projectBarData, monthlyTrends, executiveLeaderboard, taskDonutData, } = useMemo(() => {
        if (!data) {
            return {
                summary: { totalMeetings: 0, totalHours: 0, activeProjects: 0, avgHoursPerExecutive: 0, meetingsByStatus: {} },
                projects: [],
                executives: [],
                tasks: { total: 0, completed: 0, pending: 0, scheduled: 0, overdue: 0 },
                meetingsByStatusArray: [],
                projectBarData: [],
                monthlyTrends: [],
                executiveLeaderboard: [],
                taskDonutData: [],
            };
        }
        const summary = data.summary || {};
        const projects = data.projects || [];
        const executives = data.executives || [];
        const tasks = data.tasks || { total: 0, completed: 0, pending: 0, scheduled: 0, overdue: 0 };
        // meetingsByStatus => array for pie chart
        const meetingsByStatus = summary.meetingsByStatus || {};
        const meetingsByStatusArray = Object.entries(meetingsByStatus).map(([k, v]) => ({
            name: k.replace(/_/g, " "),
            value: v,
        }));
        // projectBarData: project => hours
        const projectBarData = projects.map((p) => ({ name: p.project, hours: Number(p.hours || 0) }));
        // monthlyTrends: the server returns months like "2025-03" etc. Try to make labels friendlier
        const monthlyTrends = (data.monthlyTrends || data.monthly || []).map((m) => {
            // if month is "YYYY-MM" convert to "MMM YYYY"
            let label = m.month;
            try {
                if (/^\d{4}-\d{2}$/.test(label)) {
                    const [y, mm] = label.split("-");
                    const dt = new Date(Number(y), Number(mm) - 1, 1);
                    label = dt.toLocaleString(undefined, { month: "short", year: "numeric" });
                }
            }
            catch { }
            return { ...m, month: label };
        });
        // executive leaderboard is already prepared on server; fallback to computed order
        const executiveLeaderboard = executives.length > 0
            ? executives.map((e) => ({ name: e.name, meetings: e.meetings, hours: e.hours }))
            : [];
        // task donut data
        const taskDonutData = [
            { name: "Scheduled", value: tasks.scheduled || 0, color: "#60A5FA" },
            { name: "Completed", value: tasks.completed || 0, color: "#34D399" },
            { name: "Pending", value: tasks.pending || 0, color: "#F59E0B" },
            { name: "Overdue", value: tasks.overdue || 0, color: "#EF4444" },
        ];
        return { summary, projects, executives, tasks, meetingsByStatusArray, projectBarData, monthlyTrends, executiveLeaderboard, taskDonutData };
    }, [data]);
    // small helpers for colors according to theme
    const palette = {
        bg: isDark ? "bg-slate-900" : "bg-slate-50",
        cardBg: isDark ? "bg-slate-800" : "bg-white",
        text: isDark ? "text-slate-100" : "text-slate-900",
        muted: isDark ? "text-slate-300" : "text-slate-500",
    };
    // PDF export (captures #secretary-report-root)
    async function downloadPdf() {
        // properties to inline (add more if you rely on extra properties)
        const PROPS_TO_INLINE = [
            "backgroundColor",
            "background",
            "color",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "boxShadow",
            "outlineColor",
            "fill",
            "stroke",
            "opacity",
            "font",
            "fontSize",
            "fontFamily",
            "fontWeight",
            "lineHeight",
        ];
        // Inline computed styles for elements within root. Returns restore fn.
        function inlineComputedStyles(root) {
            const nodes = Array.from(root.querySelectorAll("*"));
            nodes.unshift(root);
            const saved = [];
            nodes.forEach((el) => {
                try {
                    const cs = window.getComputedStyle(el);
                    if (!cs)
                        return;
                    const prevInline = el.getAttribute("style") || "";
                    const additions = [];
                    PROPS_TO_INLINE.forEach((prop) => {
                        const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
                        const val = cs.getPropertyValue(cssProp);
                        if (val)
                            additions.push(`${cssProp}: ${val};`);
                    });
                    if (additions.length) {
                        saved.push({ el, prevInline });
                        // prepend to ensure they override stylesheet values
                        el.setAttribute("style", additions.join(" ") + " " + prevInline);
                    }
                }
                catch (e) {
                    // ignore elements that throw
                }
            });
            return () => {
                saved.forEach(({ el, prevInline }) => {
                    if (prevInline)
                        el.setAttribute("style", prevInline);
                    else
                        el.removeAttribute("style");
                });
            };
        }
        // Force concrete pixel sizes on Recharts wrappers and SVGs to avoid -1/0 sizes
        function fixRechartsSizing(root) {
            const modified = [];
            // Targets: common recharts elements and svg
            const selectors = [".recharts-wrapper", ".recharts-surface", "svg"];
            const elems = root.querySelectorAll(selectors.join(","));
            elems.forEach((el) => {
                try {
                    const r = el.getBoundingClientRect();
                    if (!r || (r.width <= 0 && r.height <= 0)) {
                        // if zero, attempt to use parent's bounding rect
                        const p = el.parentElement;
                        if (p) {
                            const pr = p.getBoundingClientRect();
                            if (pr && pr.width > 0 && pr.height > 0) {
                                el.style.width = `${Math.max(1, Math.round(pr.width))}px`;
                                el.style.height = `${Math.max(1, Math.round(pr.height))}px`;
                                if (el.tagName.toLowerCase() === "svg") {
                                    el.setAttribute("width", `${Math.max(1, Math.round(pr.width))}`);
                                    el.setAttribute("height", `${Math.max(1, Math.round(pr.height))}`);
                                }
                                modified.push({ el });
                            }
                        }
                    }
                    else {
                        // set explicit pixel width/height from measured size (avoid fractional values)
                        el.style.width = `${Math.max(1, Math.round(r.width))}px`;
                        el.style.height = `${Math.max(1, Math.round(r.height))}px`;
                        if (el.tagName.toLowerCase() === "svg") {
                            el.setAttribute("width", `${Math.max(1, Math.round(r.width))}`);
                            el.setAttribute("height", `${Math.max(1, Math.round(r.height))}`);
                        }
                        modified.push({ el });
                    }
                }
                catch (e) {
                    // ignore
                }
            });
            return () => {
                modified.forEach(({ el }) => {
                    // remove inline width/height we added (but preserve any pre-existing inline style)
                    // best-effort: remove width/height properties only
                    const prev = el.getAttribute("style") || "";
                    // remove width/height styles we set (simple regex)
                    const cleaned = prev
                        .replace(/(?:^|\s)width:\s*[^;]+;?/i, "")
                        .replace(/(?:^|\s)height:\s*[^;]+;?/i, "")
                        .trim();
                    if (cleaned)
                        el.setAttribute("style", cleaned);
                    else
                        el.removeAttribute("style");
                    if (el.tagName.toLowerCase() === "svg") {
                        // remove width/height attributes we added only if they match pixel values
                        try {
                            el.removeAttribute("width");
                            el.removeAttribute("height");
                        }
                        catch (e) { }
                    }
                });
            };
        }
        const root = document.getElementById("secretary-report-root");
        if (!root) {
            alert("Report root element not found");
            return;
        }
        // Hide interactive/no-print controls using display:none (store previous displays)
        const controls = Array.from(root.querySelectorAll(".no-print"));
        const prevDisplays = controls.map((c) => c.style.display);
        // Hide by setting display none (better than visibility for layout)
        controls.forEach((c) => (c.style.display = "none"));
        // Inline computed styles to prevent html2canvas parsing oklch() and other unsupported functions
        const restoreInline = inlineComputedStyles(root);
        // Force concrete sizes on recharts wrappers/SVGs so charts report meaningful widths/heights
        const restoreChartSizing = fixRechartsSizing(root);
        // wait for fonts and a short render tick for charts
        try {
            if (document.fonts && document.fonts.ready)
                await document.fonts.ready;
        }
        catch (e) { }
        await new Promise((r) => setTimeout(r, 250));
        // ensure explicit background to avoid transparent PDF
        const originalBg = root.style.background;
        // If you use class names for background, fallback to computed style
        root.style.background = getComputedStyle(root).backgroundColor || "#ffffff";
        try {
            // conservative scale (1..2). Using devicePixelRatio can create very large canvases.
            const deviceScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
            const scale = Math.min(2, Math.max(1, Math.round(deviceScale)));
            const canvas = await html2canvas(root, {
                scale,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: null,
                windowWidth: root.scrollWidth,
                windowHeight: root.scrollHeight,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY,
                foreignObjectRendering: true,
            });
            // create PDF, slicing if tall
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidthMM = 210;
            const pageHeightMM = 297;
            const canvasWpx = canvas.width;
            const canvasHpx = canvas.height;
            const pxPerMm = canvasWpx / pageWidthMM;
            const pageHeightPx = Math.floor(pageHeightMM * pxPerMm);
            if (canvasHpx <= pageHeightPx) {
                pdf.addImage(imgData, "PNG", 0, 0, pageWidthMM, (canvasHpx / pxPerMm));
            }
            else {
                // slice vertically
                let remainingPx = canvasHpx;
                let srcY = 0;
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = canvasWpx;
                while (remainingPx > 0) {
                    const sliceHeightPx = Math.min(pageHeightPx, remainingPx);
                    tmpCanvas.height = sliceHeightPx;
                    const ctx = tmpCanvas.getContext("2d");
                    ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
                    ctx.drawImage(canvas, 0, srcY, canvasWpx, sliceHeightPx, 0, 0, canvasWpx, sliceHeightPx);
                    const pageImgData = tmpCanvas.toDataURL("image/png");
                    const pageImgHeightMM = sliceHeightPx / pxPerMm;
                    if (pdf.internal.getNumberOfPages() > 0)
                        pdf.addPage();
                    pdf.addImage(pageImgData, "PNG", 0, 0, pageWidthMM, pageImgHeightMM);
                    remainingPx -= sliceHeightPx;
                    srcY += sliceHeightPx;
                }
            }
            pdf.save(`Secretary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
        catch (err) {
            console.error("PDF export error", err);
            alert("Failed to export PDF — see console. If you see 'tainted canvas' errors, your images need CORS headers.");
        }
        finally {
            // restore everything
            restoreInline();
            restoreChartSizing();
            controls.forEach((c, i) => (c.style.display = prevDisplays[i] ?? ""));
            root.style.background = originalBg;
        }
    }
    // simple palette for charts
    const CHART_COLORS = ["#2563EB", "#F97316", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"];
    return (_jsxs("div", { id: "secretary-report-root", className: `${palette.bg} p-6 min-h-[80vh]`, children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: `text-2xl font-semibold ${palette.text}`, children: "Secretary \u2014 Reports & Statistics" }), _jsx("p", { className: `text-sm ${palette.muted} mt-1`, children: "Overview of assigned executives, meetings, conflicts and task health." })] }), _jsxs("div", { className: "flex items-center gap-2 no-print", children: [_jsxs("select", { className: "rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700", value: range, onChange: (e) => {
                                    setRange(e.target.value);
                                    loadReports(e.target.value);
                                }, disabled: loading, children: [_jsx("option", { value: "this-month", children: "This month" }), _jsx("option", { value: "this-week", children: "This week" }), _jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "last-week", children: "Last week" }), _jsx("option", { value: "this-quarter", children: "This quarter" })] }), _jsxs("button", { onClick: () => loadReports(range), className: "inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-slate-100", disabled: loading, title: "Refresh", children: [_jsx(RefreshCcw, { size: 16 }), _jsx("span", { className: "text-sm", children: loading ? "Refreshing…" : "Refresh" })] }), _jsxs("button", { onClick: downloadPdf, className: "inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-800 text-white hover:opacity-95", title: "Download PDF", children: [_jsx(Download, { size: 16 }), _jsx("span", { className: "text-sm", children: "Download PDF" })] })] })] }), error && (_jsx("div", { className: "mb-4 p-4 rounded border border-red-200 bg-red-50", children: _jsxs("div", { className: "text-sm text-red-700", children: ["Error: ", error] }) })), loading && !data && (_jsx("div", { className: "py-20 flex items-center justify-center", children: _jsx("div", { className: "text-sm text-slate-500", children: "Loading report\u2026" }) })), data && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsx("div", { className: "text-sm text-slate-400", children: "Total meetings" }), _jsx("div", { className: "text-2xl font-bold mt-2", children: summary.totalMeetings ?? 0 }), _jsxs("div", { className: "text-xs mt-1 text-slate-400", children: ["Range: ", data.range?.label || range] })] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsx("div", { className: "text-sm text-slate-400", children: "Total meeting hours" }), _jsxs("div", { className: "text-2xl font-bold mt-2", children: [summary.totalHours ?? 0, " hrs"] }), _jsx("div", { className: "text-xs mt-1 text-slate-400", children: "Sum of meeting durations" })] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsx("div", { className: "text-sm text-slate-400", children: "Active projects" }), _jsx("div", { className: "text-2xl font-bold mt-2", children: summary.activeProjects ?? 0 }), _jsx("div", { className: "text-xs mt-1 text-slate-400", children: "In selected range" })] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsx("div", { className: "text-sm text-slate-400", children: "Avg hrs / executive" }), _jsxs("div", { className: "text-2xl font-bold mt-2", children: [summary.avgHoursPerExecutive ?? 0, " hrs"] }), _jsx("div", { className: "text-xs mt-1 text-slate-400", children: "Load per assigned exec" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: `text-sm font-medium ${palette.text}`, children: "Meeting status mix" }), _jsxs("div", { className: "text-xs text-slate-400", children: [Object.keys(summary.meetingsByStatus || {}).length, " statuses"] })] }), meetingsByStatusArray.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400", children: "No meetings in selected range." })) : (_jsx("div", { style: { height: 220 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: meetingsByStatusArray, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 80, label: true, innerRadius: 36, children: meetingsByStatusArray.map((entry, i) => (_jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))) }), _jsx(Tooltip, {})] }) }) }))] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: `text-sm font-medium ${palette.text}`, children: "Task health" }), _jsx("div", { className: "text-xs text-slate-400", children: "Scheduled / Completed / Pending / Overdue" })] }), _jsx("div", { style: { height: 220 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: taskDonutData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 48, outerRadius: 80, label: true, children: taskDonutData.map((d, i) => (_jsx(Cell, { fill: d.color }, i))) }), _jsx(Tooltip, {})] }) }) }), _jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: taskDonutData.map((t) => (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { style: { width: 12, height: 12, background: t.color, borderRadius: 4, display: "inline-block" } }), _jsxs("span", { className: "text-slate-600", children: [t.name, ": "] }), _jsx("span", { className: "font-semibold", children: t.value })] }, t.name))) })] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: `text-sm font-medium ${palette.text}`, children: "Project time distribution" }), _jsxs("div", { className: "text-xs text-slate-400", children: [projects.length, " projects"] })] }), projectBarData.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400", children: "No project-linked meetings in this period." })) : (_jsx("div", { style: { height: 220 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: projectBarData, layout: "vertical", margin: { left: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { type: "number" }), _jsx(YAxis, { dataKey: "name", type: "category", width: 140 }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "hours", fill: CHART_COLORS[0] })] }) }) }))] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: `text-sm font-medium ${palette.text}`, children: "Monthly productivity trends" }), _jsx("div", { className: "text-xs text-slate-400", children: "Meetings vs productivity" })] }), monthlyTrends.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400", children: "No monthly data available." })) : (_jsx("div", { style: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: monthlyTrends, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "productivity", stroke: CHART_COLORS[2] }), _jsx(Line, { type: "monotone", dataKey: "meetings", stroke: CHART_COLORS[0] })] }) }) }))] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: `text-sm font-medium ${palette.text}`, children: "Executive workload leaderboard" }), _jsx("div", { className: "text-xs text-slate-400", children: "Sorted by booked hours" })] }), executiveLeaderboard.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400", children: "No assigned executives or activity in this range." })) : (_jsx("div", { className: "space-y-3", children: executiveLeaderboard.map((e, i) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [i + 1, ". ", e.name] }), _jsxs("div", { className: "text-xs text-slate-400", children: [e.meetings, " meetings"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: [e.hours, " hrs"] }), _jsx("div", { style: { width: 160 }, className: "bg-slate-100 rounded-full h-2 mt-2 overflow-hidden", children: _jsx("div", { style: { width: `${Math.min(100, (e.hours / Math.max(1, executiveLeaderboard[0]?.hours || 1)) * 100)}%` }, className: "h-2 bg-blue-500" }) })] })] }, e.name))) }))] })] }), _jsxs("div", { className: `${palette.cardBg} rounded-lg p-4 shadow-sm mb-6`, children: [_jsx("h3", { className: `text-sm font-medium ${palette.text} mb-3`, children: "Project-wise meeting summary" }), projects.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400", children: "No project-linked meetings in this period." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "text-xs text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2", children: "Project" }), _jsx("th", { className: "px-3 py-2", children: "Meetings" }), _jsx("th", { className: "px-3 py-2", children: "Hours" }), _jsx("th", { className: "px-3 py-2", children: "Unique executives" })] }) }), _jsx("tbody", { children: projects.map((p) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-3 py-2", children: p.project }), _jsx("td", { className: "px-3 py-2", children: p.meetings }), _jsxs("td", { className: "px-3 py-2", children: [p.hours, " hrs"] }), _jsx("td", { className: "px-3 py-2", children: p.uniqueExecutives })] }, p.project))) })] }) }))] })] }))] }));
}
