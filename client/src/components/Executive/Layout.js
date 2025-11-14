"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import { Sun, Moon, LogOut, Home, Calendar, Users, ClipboardList, BarChart2, ChevronLeft, ChevronRight, } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";
import Schedule from "./Schedule";
import Meetings from "./Meetings";
import Engagements from "./Engagements";
import Reports from "./Reports";
export default function ExecutiveLayout() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const [activeView, setActiveView] = useState("Dashboard");
    const [collapsed, setCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
    // user info state
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [error, setError] = useState(null);
    const API_BASE = "https://time-management-software.onrender.com";
    const API_USER_URL = `${API_BASE}/api/executive/info`;
    // ✅ Fetch current user info
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }
        async function fetchUser() {
            setLoadingUser(true);
            setError(null);
            try {
                const res = await fetch(API_USER_URL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/signin");
                    return;
                }
                const data = await res.json();
                const userData = data?.user ?? data;
                setUser(userData);
                if (userData?.email)
                    localStorage.setItem("userEmail", userData.email);
                if (userData?._id)
                    localStorage.setItem("userId", userData._id);
                if (userData?.role)
                    localStorage.setItem("role", userData.role);
            }
            catch (err) {
                console.error("Failed to fetch user:", err);
                setError("Failed to fetch user info");
            }
            finally {
                setLoadingUser(false);
            }
        }
        fetchUser();
    }, [navigate]);
    // Responsive width listener
    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        navigate("/signin");
    };
    const navItems = [
        { name: "Dashboard", icon: Home },
        { name: "Schedule", icon: Calendar },
        { name: "Meetings", icon: Users },
        { name: "Engagements", icon: ClipboardList },
        { name: "Reports", icon: BarChart2 },
    ];
    // Layout size styling
    const sidebarExpanded = "md:w-64";
    const sidebarCollapsed = "md:w-20";
    const mainMarginExpanded = "md:ml-64";
    const mainMarginCollapsed = "md:ml-20";
    return (_jsxs("div", { className: `flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-700"}`, children: [_jsxs("aside", { className: `hidden md:flex flex-col p-6 transition-all duration-300 ease-in-out ${collapsed ? sidebarCollapsed : sidebarExpanded} md:fixed md:top-0 md:left-0 md:h-screen overflow-auto`, children: [_jsxs("div", { className: `mb-8 flex flex-col items-start ${collapsed ? "items-center" : ""}`, children: [_jsx("h1", { className: `font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text ${collapsed ? "text-2xl" : "text-3xl"}`, children: "TMS" }), !collapsed && _jsx("span", { className: "text-sm text-gray-500 mt-1", children: "Role: Executive" }), !collapsed && (_jsx("div", { className: `mt-4 w-full p-3 rounded-lg border transition-colors duration-200 ${isDark ? "bg-gradient-to-r from-slate-800 to-indigo-900 border-slate-700 text-slate-50 shadow-sm" : "bg-white border-slate-200 text-gray-900"}`, children: loadingUser ? (_jsx("div", { className: "text-xs text-gray-400", children: "Loading user..." })) : error ? (_jsx("div", { className: "text-xs text-red-400", children: error })) : user ? (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: user.name ?? "Unnamed Executive" }), _jsx("div", { className: "text-xs text-gray-300", children: user.email }), user.department && _jsxs("div", { className: "text-xs text-gray-300 mt-1", children: ["Dept: ", user.department] })] })) : (_jsx("div", { className: "text-xs text-gray-400", children: "No user info" })) }))] }), _jsx("nav", { className: "flex flex-col gap-2 flex-1", children: navItems.map((item) => {
                            const Icon = item.icon;
                            const active = activeView === item.name;
                            return (_jsxs("button", { onClick: () => setActiveView(item.name), title: item.name, "aria-current": active ? "page" : undefined, className: `flex items-center gap-3 transition-all duration-200 rounded-xl select-none ${collapsed ? "justify-center py-3 px-0" : "px-4 py-2.5"} ${active
                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md scale-[1.02]"
                                    : isDark
                                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"}`, children: [_jsx(Icon, { className: "w-5 h-5" }), !collapsed && _jsx("span", { className: "font-medium text-sm", children: item.name })] }, item.name));
                        }) }), _jsxs("div", { className: `mt-auto flex flex-col gap-3 pt-6 ${collapsed ? "items-center" : "items-stretch"}`, children: [_jsxs(Button, { onClick: toggleTheme, variant: "outline", className: "flex items-center gap-2 justify-center", children: [isDark ? _jsx(Sun, { className: "w-4 h-4" }) : _jsx(Moon, { className: "w-4 h-4" }), !collapsed && (isDark ? "Light Mode" : "Dark Mode")] }), _jsxs(Button, { onClick: handleLogout, variant: "destructive", className: `flex items-center gap-2 justify-center ${collapsed ? "px-0" : ""}`, children: [_jsx(LogOut, { className: "w-4 h-4" }), !collapsed && "Logout"] })] }), _jsx("div", { role: "button", "aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar", "aria-pressed": collapsed, onClick: () => setCollapsed((s) => !s), tabIndex: 0, className: "absolute top-0 right-0 h-full flex items-center z-40 cursor-pointer", style: { width: 16, transform: "translateX(50%)" }, children: _jsx("div", { className: "h-10 w-6 rounded-l-full flex items-center justify-center", children: collapsed ? _jsx(ChevronRight, { className: "w-4 h-4" }) : _jsx(ChevronLeft, { className: "w-4 h-4" }) }) })] }), _jsxs("div", { className: `flex-1 flex flex-col ${isDesktop ? (collapsed ? mainMarginCollapsed : mainMarginExpanded) : ""}`, children: [_jsxs("header", { className: `md:hidden flex justify-between items-center p-4 border-b ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white shadow-sm"}`, children: [_jsxs("div", { children: [_jsx("h1", { className: "font-bold text-xl text-indigo-600", children: "TMS - Executive" }), user && _jsxs("span", { className: "text-sm text-gray-500", children: [user.name, " \u00B7 ", user.email] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: toggleTheme, variant: "outline", size: "sm", className: "p-2 rounded-full", children: isDark ? _jsx(Sun, { className: "w-4 h-4" }) : _jsx(Moon, { className: "w-4 h-4" }) }), _jsx(Button, { onClick: handleLogout, variant: "destructive", size: "sm", className: "p-2 rounded-full", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })] }), _jsxs("main", { className: "flex-1 p-4 md:p-6 overflow-y-auto", children: [activeView === "Dashboard" && _jsx(Dashboard, { user: user }), activeView === "Schedule" && _jsx(Schedule, { user: user }), activeView === "Meetings" && _jsx(Meetings, { user: user }), activeView === "Engagements" && _jsx(Engagements, { user: user }), activeView === "Reports" && _jsx(Reports, { user: user })] })] }), _jsx("nav", { className: `fixed bottom-3 left-3 right-3 md:hidden rounded-2xl z-50 shadow-lg transition-all duration-200 ${isDark ? "bg-gradient-to-r from-indigo-900/95 via-slate-900/95 to-rose-900/95 border border-slate-700 text-slate-100" : "bg-white/95 border border-gray-200 text-gray-900"}`, role: "tablist", "aria-label": "Primary Navigation", children: _jsx("div", { className: "flex justify-between items-center px-2", children: navItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeView === item.name;
                        return (_jsxs("button", { onClick: () => setActiveView(item.name), role: "tab", "aria-selected": active, title: item.name, className: `flex-1 py-2 px-1 flex flex-col items-center justify-center text-xs transition-all duration-150 ${active
                                ? "scale-[1.03] font-semibold"
                                : "opacity-90"}`, children: [_jsx("div", { className: `p-2 rounded-md ${active ? (isDark ? "bg-amber-500/10" : "bg-indigo-50") : ""}`, children: _jsx(Icon, { className: `w-5 h-5 ${active ? (isDark ? "text-amber-300" : "text-indigo-600") : ""}` }) }), _jsx("span", { className: `mt-1 ${active ? (isDark ? "text-amber-200" : "text-indigo-600") : "text-xs text-muted-foreground"}`, children: item.name })] }, item.name));
                    }) }) })] }));
}
