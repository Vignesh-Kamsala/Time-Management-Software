"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
const API_BASE = "https://time-management-software.onrender.com";
export default function SecretaryDashboard({ user, loading }) {
    const { isDark } = useContext(ThemeContext);
    const [summary, setSummary] = useState({ open: 0, in_progress: 0, resolved: 0, escalated: 0, openMeetings: 0 });
    const [conflicts, setConflicts] = useState([]);
    const [loadingConflicts, setLoadingConflicts] = useState(false);
    const [error, setError] = useState(null);
    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
    const loadSummary = useCallback(async () => {
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts?summary=true`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Failed to load summary");
            const data = await res.json();
            setSummary((prev) => ({
                ...prev,
                open: data?.summary?.open ?? 0,
                in_progress: data?.summary?.in_progress ?? 0,
                resolved: data?.summary?.resolved ?? 0,
                escalated: data?.summary?.escalated ?? 0,
                openMeetings: data?.openMeetings ?? 0,
            }));
        }
        catch (err) {
            console.error(err);
        }
    }, [token]);
    const loadConflicts = useCallback(async () => {
        if (!token)
            return;
        setError(null);
        setLoadingConflicts(true);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts?status=open&limit=5`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Failed to load conflicts");
            const data = await res.json();
            setConflicts(Array.isArray(data?.conflicts) ? data.conflicts : []);
        }
        catch (err) {
            console.error(err);
            setError("Unable to load conflicts");
        }
        finally {
            setLoadingConflicts(false);
        }
    }, [token]);
    useEffect(() => {
        if (token) {
            loadSummary();
            loadConflicts();
        }
    }, [token, loadSummary, loadConflicts]);
    const cards = [
        { title: "Open Conflicts", value: summary.open, color: "text-red-500" },
        { title: "In Progress", value: summary.in_progress, color: "text-yellow-500" },
        { title: "Resolved (7d)", value: summary.resolved, color: "text-green-500" },
    ];
    return (_jsxs("div", { className: `${isDark ? "text-gray-100" : "text-gray-900"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Dashboard" }), user?.name && _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Signed in as ", user.name] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { loadSummary(); loadConflicts(); }, children: "Refresh" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: cards.map((card, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: card.title }) }), _jsx(CardContent, { children: _jsx("p", { className: `text-3xl font-bold ${card.color}`, children: card.value }) })] }, index))) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Open Conflict Tickets" }) }), _jsx(CardContent, { children: loadingConflicts ? (_jsx("p", { className: "text-sm text-gray-500", children: "Loading conflicts\u2026" })) : error ? (_jsx("p", { className: "text-sm text-red-500", children: error })) : conflicts.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No conflicts require attention \uD83C\uDF89" })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Meeting" }), _jsx(TableCell, { children: "Requested By" }), _jsx(TableCell, { children: "When" }), _jsx(TableCell, { children: "Status" })] }) }), _jsx(TableBody, { children: conflicts.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium", children: item.meeting?.title ?? "Untitled" }), _jsx("span", { className: "text-xs text-gray-500", children: item.meeting?.project || "General" })] }) }), _jsx(TableCell, { children: item.requestedBy?.name || item.requestedBy?.email || "—" }), _jsx(TableCell, { children: item.meeting?.startTime ? new Date(item.meeting.startTime).toLocaleString() : "TBD" }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: "bg-yellow-100 text-yellow-700 capitalize", children: item.status }) })] }, item._id))) })] })) })] }), _jsxs("div", { className: "mt-4 text-xs text-gray-500", children: ["Coordinating ", summary.openMeetings, " meetings awaiting reschedule."] })] }));
}
