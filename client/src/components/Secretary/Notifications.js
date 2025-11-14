"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const API_BASE = "https://time-management-software.onrender.com";
const FILTERS = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
];
export default function Notifications() {
    const { isDark } = useContext(ThemeContext);
    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("all");
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchNotifications = async (status = filter) => {
        if (!token)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/notifications?status=${status}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Failed to load notifications");
            const data = await res.json();
            setItems(Array.isArray(data?.notifications) ? data.notifications : []);
            setUnreadCount(data?.unreadCount ?? 0);
        }
        catch (err) {
            console.error(err);
            setError("Unable to fetch notifications");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (token) {
            fetchNotifications(filter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, filter]);
    const handleMark = async (id, mark = "read") => {
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/api/secretary/notifications/${id}/read`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ mark }),
            });
            if (!res.ok)
                throw new Error("Failed to update notification");
            const data = await res.json();
            setItems((prev) => prev.map((item) => (item._id === id ? { ...item, ...data.notification } : item)));
            setUnreadCount(data?.unreadCount ?? 0);
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleMarkAll = async () => {
        if (!token)
            return;
        try {
            const res = await fetch(`${API_BASE}/api/secretary/notifications/mark-all-read`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Failed to mark notifications");
            await fetchNotifications(filter);
        }
        catch (err) {
            console.error(err);
        }
    };
    return (_jsxs("div", { className: `${isDark ? "text-gray-100" : "text-gray-900"}`, children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Notifications" }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [unreadCount, " unread notification", unreadCount === 1 ? "" : "s", "."] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("select", { className: `rounded-md border px-3 py-2 text-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`, value: filter, onChange: (event) => setFilter(event.target.value), children: FILTERS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => fetchNotifications(filter), disabled: loading, children: loading ? "Refreshing…" : "Refresh" }), _jsx(Button, { size: "sm", onClick: handleMarkAll, disabled: loading || unreadCount === 0, children: "Mark all read" })] })] }), error ? (_jsx(Card, { className: "border border-red-300 bg-red-50 text-red-700", children: _jsx(CardContent, { className: "py-6 text-sm", children: error }) })) : (_jsx("div", { className: "space-y-4", children: loading && items.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-6 text-sm text-gray-500", children: "Loading notifications\u2026" }) })) : items.length === 0 ? (_jsx(Card, { children: _jsx(CardContent, { className: "py-6 text-sm text-gray-500", children: "Nothing new right now." }) })) : (items.map((notification) => {
                    const isUnread = !notification.readAt;
                    const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
                    const dateLabel = createdAt ? createdAt.toLocaleString() : "";
                    const channelLabel = notification.channel || "system";
                    return (_jsxs(Card, { className: `transition-all ${isUnread ? "border-l-4 border-indigo-600" : "opacity-90"}`, children: [_jsxs(CardHeader, { className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "font-semibold", children: notification.title }), _jsx("span", { className: "text-sm text-gray-500", children: notification.message }), dateLabel && _jsx("span", { className: "text-xs text-gray-400", children: dateLabel })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "capitalize", children: channelLabel }), _jsx(Badge, { variant: "outline", className: `capitalize ${notification.severity === "critical"
                                                    ? "bg-red-100 text-red-700"
                                                    : notification.severity === "warning"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-slate-100 text-slate-700"}`, children: notification.severity })] })] }), _jsxs(CardContent, { className: "flex items-center gap-2", children: [isUnread ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleMark(notification._id, "read"), children: "Mark as read" })) : (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleMark(notification._id, "unread"), children: "Mark unread" })), notification.metadata?.meetingTitle && (_jsxs("span", { className: "text-xs text-gray-500", children: ["Meeting: ", notification.metadata.meetingTitle] }))] })] }, notification._id));
                })) }))] }));
}
