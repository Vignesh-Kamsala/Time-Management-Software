"use client";
import React, { useState, useContext } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import SecretaryDashboard from "./SecretaryDashboard";
import ScheduleMeeting from "./ScheduleMeeting";
import RearrangeAppointments from "./RearrangeAppointments";
import Reports from "./Reports";
import Notifications from "./Notifications";


export default function SecretaryLayout() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeView, setActiveView] = useState("Dashboard");

  const sidebarItems = [
    "Dashboard",
    "Schedule Meeting",
    "Rearrange Appointments",
    "Reports",
    "Notifications",
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your logout logic here
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <aside
        className={`w-64 p-4 flex flex-col justify-between transition-all ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        } shadow-lg`}
      >
        <div>
          <h1 className="text-2xl font-bold mb-8 text-indigo-500 text-center">
            TMS - Secretary
          </h1>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveView(item)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeView === item
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* <Separator className="my-4" /> */}

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-3">
          <Button onClick={toggleTheme} variant="outline" className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2 mt-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto transition-all">
        {activeView === "Dashboard" && <SecretaryDashboard />}
        {activeView === "Schedule Meeting" && <ScheduleMeeting />}
        {activeView === "Rearrange Appointments" && <RearrangeAppointments />}
        {activeView === "Reports" && <Reports />}
        {activeView === "Notifications" && <Notifications />}
      </main>
    </div>
  );
}
