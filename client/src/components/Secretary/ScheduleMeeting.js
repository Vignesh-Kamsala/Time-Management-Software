"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
const API_BASE = "https://time-management-software.onrender.com";
export default function ScheduleMeeting() {
    const { isDark } = useContext(ThemeContext);
    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
    const [inProgress, setInProgress] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/api/secretary/conflicts?status=in_progress&limit=10`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
            if (!res.ok)
                throw new Error("Failed to load conflicts");
            return res.json();
        })
            .then((data) => {
            setInProgress(Array.isArray(data?.conflicts) ? data.conflicts : []);
        })
            .catch((err) => {
            console.error(err);
            setError("Unable to load active conflicts");
        })
            .finally(() => setLoading(false));
    }, [token]);
    return (_jsxs("div", { className: `${isDark ? "text-gray-100" : "text-gray-900"}`, children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Manual Coordination Inbox" }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your role in conflict resolution" }) }), _jsxs(CardContent, { className: "space-y-3 text-sm text-gray-600", children: [_jsx("p", { children: "When the system cannot find a common slot, it raises a conflict ticket. Review participant calendars, consult the executives, and record any alternative slots discussed." }), _jsx("p", { children: "Once everyone agrees, confirm the final schedule below. The platform will update meeting times and notify all participants automatically." }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }), children: "Jump to conflict queue" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "In-progress consultations" }) }), _jsx(CardContent, { children: loading ? (_jsx("p", { className: "text-sm text-gray-500", children: "Loading\u2026" })) : error ? (_jsx("p", { className: "text-sm text-red-500", children: error })) : inProgress.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No active consultations at the moment." })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Meeting" }), _jsx(TableCell, { children: "Requested By" }), _jsx(TableCell, { children: "Current Slot" }), _jsx(TableCell, { children: "Status" })] }) }), _jsx(TableBody, { children: inProgress.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: item.meeting?.title ?? "Untitled" }), _jsx(TableCell, { children: item.requestedBy?.name || item.requestedBy?.email }), _jsx(TableCell, { children: item.meeting?.startTime ? new Date(item.meeting.startTime).toLocaleString() : "TBD" }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: "capitalize bg-amber-100 text-amber-700", children: item.status }) })] }, item._id))) })] })) })] })] }));
}
