import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import Clock from 'react-clock';
// CRITICAL: This CSS file contains the styling for the needles and their rotation!
// NOTE: I'm adding custom styling here for contrast, feel free to remove/change it.
function DynamicClockSelector() {
    // 1. Initialize state with a standard JavaScript Date object.
    //    The Date object is the best way to control the Clock component's needle positions.
    const initialTime = new Date();
    initialTime.setHours(10, 30, 0, 0); // Start at 10:30
    const [selectedDate, setSelectedDate] = useState(initialTime);
    // Helper to format the Date object for simple display
    const formatDisplayTime = (date) => {
        if (!date)
            return "N/A";
        // Format for display: HH:MM AM/PM (e.g., 10:30 AM)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (_jsxs("div", { style: { padding: '20px', border: '2px solid #333', borderRadius: '10px', maxWidth: '400px', margin: '20px auto', textAlign: 'center' }, children: [_jsx("h2", { children: "Set Time: Drag Clock Needles " }), _jsx("p", { children: "The hands will now move dynamically as you drag them to select the time." }), _jsx("div", { style: { display: 'flex', justifyContent: 'center', padding: '20px 0' }, children: _jsx(Clock, { value: selectedDate, onChange: setSelectedDate, size: 250 }) }), _jsx("hr", {}), _jsx("h3", { children: "Selected Time:" }), _jsx("div", { style: { backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }, children: _jsx("h2", { style: { margin: 0, color: '#0056b3' }, children: _jsx("strong", { children: formatDisplayTime(selectedDate) }) }) })] }));
}
export default DynamicClockSelector;
