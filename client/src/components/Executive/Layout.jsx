"use client";
import React, { useState, useContext } from "react";
import {
  Sun,
  Moon,
  LogOut,
  Home,
  Calendar,
  Users,
  ClipboardList,
  BarChart2,
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

import Dashboard from "./Dashboard";
import Schedule from "./Schedule";
import Meetings from "./Meetings";
import Engagements from "./Engagements";
import Reports from "./Reports";

export default function ExecutiveLayout() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeView, setActiveView] = useState("Dashboard");

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Schedule", icon: Calendar },
    { name: "Meetings", icon: Users },
    { name: "Engagements", icon: ClipboardList },
    { name: "Reports", icon: BarChart2 },
  ];

  const handleLogout = () => console.log("Logout clicked");

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 p-6 shadow-2xl border-r transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700"
            : "bg-gradient-to-b from-white to-gray-50 border-gray-200"
        }`}
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col">
          <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            TMS
          </h1>
          <span className="text-sm text-gray-500 mt-1">Role: Executive</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeView === item.name
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md scale-[1.02]"
                  : isDark
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={toggleTheme}
            variant="outline"
            className={`flex items-center gap-2 w-full justify-center font-medium ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
                : "bg-gray-50 border-gray-300 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2 w-full justify-center font-medium bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header
          className={`md:hidden flex justify-between items-center p-4 border-b transition-all ${
            isDark
              ? "border-gray-800 bg-gray-900"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
              TMS - Executive
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Role: Executive
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="p-2 rounded-full"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="p-2 rounded-full bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Page Content */}
        <main
          className={`flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300 ${
            isDark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {activeView === "Dashboard" && <Dashboard />}
          {activeView === "Schedule" && <Schedule />}
          {activeView === "Meetings" && <Meetings />}
          {activeView === "Engagements" && <Engagements />}
          {activeView === "Reports" && <Reports />}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className={`fixed bottom-0 left-0 w-full border-t md:hidden flex justify-around py-2 backdrop-blur-md bg-opacity-90 transition-colors duration-300 ${
            isDark
              ? "bg-gray-900/90 border-gray-800"
              : "bg-white/90 border-gray-200 shadow-lg"
          }`}
        >
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`flex flex-col items-center text-xs font-medium transition-all ${
                activeView === item.name
                  ? "text-indigo-600 dark:text-indigo-400 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-indigo-500"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              {item.name.slice(0, 6)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
