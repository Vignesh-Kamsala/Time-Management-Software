"use client";
import React, { useState, useContext } from "react";
import { Sun, Moon, LogOut, Home, Calendar, Users, ClipboardList, BarChart2 } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

// Executive Pages
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
    <div className={`flex flex-col md:flex-row min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 p-6 shadow-lg
        ${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
        
        {/* Role at Top Left */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">TMS</h1>
          <span className="text-sm text-gray-400 dark:text-gray-400">Role: Executive</span>
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
        
        {/* Mobile Role Display */}
      {/* Mobile Top Header with Role and Buttons */}
             <header className="md:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="flex flex-col">
                 <h1 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">TMS - Executive</h1>
                 <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Role: Executive</span>
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
          {activeView === "Dashboard" && <Dashboard />}
          {activeView === "Schedule" && <Schedule />}
          {activeView === "Meetings" && <Meetings />}
          {activeView === "Engagements" && <Engagements />}
          {activeView === "Reports" && <Reports />}
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
              {item.name.slice(0, 6)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
