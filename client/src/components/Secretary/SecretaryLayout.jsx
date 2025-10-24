"use client";
import React, { useState, useContext } from "react";
import { Sun, Moon, LogOut, Home, Calendar, Users, BarChart2, Bell } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

// Secretary Pages
import SecretaryDashboard from "./SecretaryDashboard";
import ScheduleMeeting from "./ScheduleMeeting";
import RearrangeAppointments from "./RearrangeAppointments";
import Reports from "./Reports";
import Notifications from "./Notifications";

export default function SecretaryLayout() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeView, setActiveView] = useState("Dashboard");

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Schedule Meeting", icon: Calendar },
    { name: "Rearrange Appointments", icon: Users },
    { name: "Reports", icon: BarChart2 },
    { name: "Notifications", icon: Bell },
  ];

  const handleLogout = () => console.log("Logout clicked");

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 p-6 shadow-lg
        ${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        {/* Role at Top Left */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">TMS - Secretary</h1>
          <span className="text-sm text-gray-400 dark:text-gray-400">Role: Secretary</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm
                ${activeView === item.name ? "bg-indigo-600 text-white" : "hover:bg-gray-700 hover:text-white transition-all"}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <Button onClick={toggleTheme} variant="outline" className="flex items-center gap-2 w-full">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2 w-full">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Header with Role and Buttons */}
        <header className="md:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">TMS - Secretary</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Role: Secretary</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={toggleTheme} variant="outline" size="sm" className="p-1">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="p-1">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeView === "Dashboard" && <SecretaryDashboard />}
          {activeView === "Schedule Meeting" && <ScheduleMeeting />}
          {activeView === "Rearrange Appointments" && <RearrangeAppointments />}
          {activeView === "Reports" && <Reports />}
          {activeView === "Notifications" && <Notifications />}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden flex justify-around p-2">
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`flex flex-col items-center justify-center text-sm
                ${activeView === item.name ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}
              `}
            >
              <item.icon className="w-6 h-6 mb-1" />
              {item.name.length > 10 ? item.name.slice(0, 10) : item.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
