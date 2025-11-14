import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/app/(whatever)/Meetings.jsx
import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
/**
 * Meetings (invitations-only)
 * - no "Tentative" button
 * - Accept is green and visible in both light/dark themes
 * - Skeleton shown while loading
 * - Creator can mark meeting "completed" only after endTime
 */
export default function Meetings() {
    const { isDark } = useContext(ThemeContext);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // per-meeting loading and chosen state
    const [rsvpLoading, setRsvpLoading] = useState({}); // { [meetingId]: bool }
    const [rsvpChosen, setRsvpChosen] = useState({}); // { [meetingId]: "accepted"|"declined" }
    const [acceptAllLoading, setAcceptAllLoading] = useState(false); // for Accept all declined action
    const API_BASE = "https://time-management-software.onrender.com"; // change if your backend runs elsewhere
    // derived: is any action in progress
    const isAnyActionLoading = loading || acceptAllLoading || Object.values(rsvpLoading).some(Boolean);
    async function fetchMeetings(dateStr) {
        setError(null);
        setLoading(true);
        // do NOT call setMeetings([]) here — preserve current meetings to prevent layout collapse
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const url = `${API_BASE}/api/meetings/my-day?date=${encodeURIComponent(dateStr)}`;
            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: API_BASE ? "omit" : "same-origin",
            });
            if (res.status === 401) {
                setError("Unauthorized — please log in.");
                setLoading(false);
                return;
            }
            const text = await res.text();
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            if (!res.ok) {
                let serverMsg = text;
                try {
                    const parsed = ct.includes("application/json") ? JSON.parse(text) : null;
                    if (parsed)
                        serverMsg = parsed.msg || parsed.error || JSON.stringify(parsed);
                }
                catch (e) { /* ignore */ }
                throw new Error(`Server returned ${res.status}: ${serverMsg}`);
            }
            let raw;
            if (ct.includes("application/json")) {
                raw = JSON.parse(text);
            }
            else if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
                raw = JSON.parse(text);
            }
            else {
                throw new Error("Expected JSON but received non-JSON response. Preview: " + text.slice(0, 200));
            }
            let arr = [];
            if (Array.isArray(raw))
                arr = raw.map(item => (item.meeting ? item.meeting : item));
            else if (raw && Array.isArray(raw.meetings))
                arr = raw.meetings.map(item => (item.meeting ? item.meeting : item));
            else if (raw && raw.meeting)
                arr = [raw.meeting];
            else
                arr = [];
            // initialize rsvpChosen from server data so accepted/declined from backend are reflected
            const initialChosen = {};
            const myEmail = (typeof window !== "undefined" ? localStorage.getItem("userEmail") : null) || "";
            const myId = (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
            arr.forEach(m => {
                const invited = Array.isArray(m.invited) ? m.invited : [];
                const invitedEntry = invited.find(i => (i.execId && String(i.execId) === String(myId)) ||
                    (i.email && i.email.toLowerCase() === myEmail.toLowerCase()));
                if (invitedEntry && invitedEntry.status && invitedEntry.status !== "invited") {
                    initialChosen[m._id || m.id] = invitedEntry.status;
                }
                else {
                    if (m.participants && myId && m.participants.map(String).includes(String(myId))) {
                        initialChosen[m._id || m.id] = "accepted";
                    }
                }
            });
            setRsvpChosen(initialChosen);
            setMeetings(arr);
        }
        catch (err) {
            console.error("fetchMeetings error", err);
            setError(err.message || "Failed to fetch meetings");
            toast.error(err.message || "Failed to fetch meetings");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchMeetings(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);
    // central RSVP handler
    async function handleRsvp(meetingId, response, { force = false } = {}) {
        setError(null);
        if (!force && rsvpChosen[meetingId])
            return;
        setRsvpChosen(prev => ({ ...prev, [meetingId]: response }));
        setRsvpLoading(prev => ({ ...prev, [meetingId]: true }));
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token)
                throw new Error("Not authenticated — please log in.");
            const res = await fetch(`${API_BASE}/api/meetings/rsvp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ meetingId, response }),
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : null;
            }
            catch {
                data = { raw: text };
            }
            if (!res.ok) {
                const msg = data?.msg || data?.error || data?.raw || `Server ${res.status}`;
                throw new Error(msg);
            }
            await fetchMeetings(selectedDate);
        }
        catch (err) {
            console.error("RSVP failed", err);
            setRsvpChosen(prev => {
                const copy = { ...prev };
                delete copy[meetingId];
                return copy;
            });
            setError(err.message || "Failed to send response");
            toast.error(err.message || "Failed to send response");
        }
        finally {
            setRsvpLoading(prev => ({ ...prev, [meetingId]: false }));
        }
    }
    // "Accept all declined" action
    async function handleAcceptAllDeclined() {
        const myEmail = (typeof window !== "undefined" ? localStorage.getItem("userEmail") : null) || "";
        const myId = (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
        const declined = meetings.filter(m => {
            const invited = Array.isArray(m.invited) ? m.invited : [];
            const invitedEntry = invited.find(i => (i.execId && String(i.execId) === String(myId)) ||
                (i.email && i.email.toLowerCase() === myEmail.toLowerCase()));
            const id = m._id || m.id;
            const localChosen = rsvpChosen[id];
            return (localChosen === "declined") || (invitedEntry && invitedEntry.status === "declined");
        });
        if (!declined.length)
            return;
        if (!confirm(`Accept all ${declined.length} declined invitation(s) for ${selectedDate}?`))
            return;
        setAcceptAllLoading(true);
        try {
            for (const m of declined) {
                const id = m._id || m.id;
                try {
                    await handleRsvp(id, "accepted", { force: true });
                }
                catch (err) {
                    console.error(`Failed to accept meeting ${id}`, err);
                }
            }
        }
        finally {
            setAcceptAllLoading(false);
            await fetchMeetings(selectedDate);
        }
    }
    // cancel meeting (creator-only)
    async function handleCancelMeeting(meetingId) {
        setError(null);
        setRsvpLoading(prev => ({ ...prev, [meetingId]: true }));
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token)
                throw new Error("Not authenticated — please log in.");
            const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/cancel`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : null;
            }
            catch {
                data = { raw: text };
            }
            if (!res.ok) {
                const msg = data?.msg || data?.error || data?.raw || `Server ${res.status}`;
                throw new Error(msg);
            }
            // refresh meetings for UI state
            await fetchMeetings(selectedDate);
            toast.success("Meeting cancelled");
        }
        catch (err) {
            console.error('cancel meeting failed', err);
            setError(err.message || 'Failed to cancel meeting');
            toast.error(err.message || 'Failed to cancel meeting');
        }
        finally {
            setRsvpLoading(prev => ({ ...prev, [meetingId]: false }));
        }
    }
    // mark completed (creator-only)
    async function handleMarkCompleted(meetingId) {
        setError(null);
        setRsvpLoading(prev => ({ ...prev, [meetingId]: true }));
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token)
                throw new Error("Not authenticated — please log in.");
            const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/complete`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : null;
            }
            catch {
                data = { raw: text };
            }
            if (!res.ok) {
                const msg = data?.msg || data?.error || data?.raw || `Server ${res.status}`;
                throw new Error(msg);
            }
            await fetchMeetings(selectedDate);
            toast.success("Meeting marked completed");
        }
        catch (err) {
            console.error('mark completed failed', err);
            setError(err.message || 'Failed to mark meeting completed');
            toast.error(err.message || 'Failed to mark meeting completed');
        }
        finally {
            setRsvpLoading(prev => ({ ...prev, [meetingId]: false }));
        }
    }
    const pageBg = isDark ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-900";
    const cardBg = isDark ? "bg-slate-900/70 text-slate-100" : "bg-white text-slate-900";
    const skeletonBase = isDark ? "bg-slate-700/60" : "bg-slate-200";
    // compute declined count for Accept all button
    const declinedCount = meetings.reduce((acc, m) => {
        const myEmail = (typeof window !== "undefined" ? localStorage.getItem("userEmail") : null) || "";
        const myId = (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
        const invited = Array.isArray(m.invited) ? m.invited : [];
        const invitedEntry = invited.find(i => (i.execId && String(i.execId) === String(myId)) || (i.email && i.email.toLowerCase() === myEmail.toLowerCase()));
        const id = m._id || m.id;
        const localChosen = rsvpChosen[id];
        if ((localChosen === "declined") || (invitedEntry && invitedEntry.status === "declined"))
            return acc + 1;
        return acc;
    }, 0);
    return (_jsx("div", { className: `${pageBg} min-h-screen p-6`, children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Meeting Invitations" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm mr-2", children: "Date" }), _jsx(Input, { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "max-w-[160px]" }), declinedCount > 0 && (_jsx(Button, { onClick: handleAcceptAllDeclined, className: "ml-3 px-3 py-1", disabled: isAnyActionLoading, children: acceptAllLoading ? _jsx(Loader2, { className: "animate-spin w-4 h-4" }) : `Accept all declined (${declinedCount})` }))] })] }), _jsxs(Card, { className: `${cardBg} shadow-md`, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-lg", children: ["Invitations for ", format(new Date(selectedDate), "yyyy-MM-dd")] }) }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: `p-4 rounded-xl ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`, children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "w-3/4", children: [_jsx(Skeleton, { className: "h-5 w-1/2 mb-3" }), _jsx(Skeleton, { className: "h-3 w-2/3 mb-2" }), _jsx(Skeleton, { className: "h-3 w-1/3" })] }), _jsx("div", { className: "w-1/4 text-right", children: _jsx(Skeleton, { className: "h-4 w-16 mx-auto" }) })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx(Skeleton, { className: "h-8 w-24" }), _jsx(Skeleton, { className: "h-8 w-24" }), _jsx(Skeleton, { className: "h-8 w-24" })] })] }, i))) })) : error ? (_jsx("div", { className: "py-6 text-center text-red-400", children: error })) : meetings.length === 0 ? (_jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "No invitations for this date." })) : (_jsx("div", { className: "space-y-3", children: meetings.map((mOrWrapped) => {
                                    const m = mOrWrapped.meeting ? mOrWrapped.meeting : mOrWrapped;
                                    const isCancelled = m.status === 'cancelled';
                                    const id = m._id || m.id;
                                    const start = m.startTime ? new Date(m.startTime) : null;
                                    const end = m.endTime ? new Date(m.endTime) : null;
                                    const timeRange = start && end
                                        ? `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                        : "—";
                                    const participantsList = Array.isArray(m.participants)
                                        ? m.participants.map(p => (typeof p === "string" ? p : p.name || p.email)).join(", ")
                                        : "";
                                    const myEmail = (typeof window !== "undefined" ? localStorage.getItem("userEmail") : null) || "";
                                    const myId = (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
                                    // isCreator computed once (string-safe compare)
                                    const isCreator = Boolean(m.createdBy && String(m.createdBy._id || m.createdBy) === String(myId));
                                    // invited entry only used for non-creators (keeps check simple)
                                    const invitedEntry = Array.isArray(m.invited)
                                        ? m.invited.find(i => (i.execId && String(i.execId) === String(myId)) || (i.email && i.email.toLowerCase() === myEmail.toLowerCase()))
                                        : null;
                                    // For the creator, show a clear creator status and avoid forcing accept/decline
                                    const currentStatus = isCreator
                                        ? "creator"
                                        : (invitedEntry?.status || (m.participants && myId && m.participants.map(String).includes(String(myId)) ? "accepted" : "invited"));
                                    const locked = Boolean(rsvpChosen[id]);
                                    const loadingForThis = Boolean(rsvpLoading[id]);
                                    // disable other meetings' buttons when some action is in progress
                                    const disableOtherButtons = isAnyActionLoading && !loadingForThis;
                                    const meetingEnded = m.endTime ? (new Date(m.endTime).getTime() <= Date.now()) : false;
                                    const alreadyCompleted = m.status === 'completed';
                                    return (_jsxs("div", { className: `p-3 rounded-lg border ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-white"}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-sm font-semibold truncate", children: m.title }), m.project && _jsx(Badge, { className: "ml-2", children: m.project })] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [timeRange, " \u00B7 ", m.venue || "Venue: TBD"] }), _jsxs("div", { className: "text-xs mt-2 text-muted-foreground", children: [_jsx("strong", { children: "Participants:" }), " ", participantsList || "None"] }), (m.notes || m.description) && (_jsx("div", { className: "text-xs mt-2 text-muted-foreground", children: m.notes || m.description })), m.createdBy && (_jsxs("div", { className: "text-xs mt-2 text-muted-foreground", children: [_jsx("strong", { children: "Created by:" }), " ", m.createdBy.name || m.createdBy.email] }))] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: new Date(m.createdAt || m.created || Date.now()).toLocaleDateString() }), _jsxs("div", { className: "text-xs mt-2", children: [m.status === "pending" && _jsx("span", { className: "text-yellow-400", children: "Pending" }), m.status === "scheduled" && _jsx("span", { className: "text-green-400", children: "Scheduled \u2705" }), m.status === "cancelled" && _jsx("span", { className: "text-red-400", children: "Cancelled \u2014 by creator" }), m.status === "completed" && _jsx("span", { className: "text-violet-400", children: "Completed" }), !["pending", "scheduled", "cancelled", "completed"].includes(m.status) && _jsx("span", { children: m.status })] })] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2 flex-wrap", children: [_jsxs("div", { className: "text-xs text-muted-foreground mr-2", children: ["Your status: ", _jsx("strong", { className: "ml-1", children: rsvpChosen[id] || currentStatus })] }), !isCreator && (_jsxs(_Fragment, { children: [_jsx(Button, { disabled: loadingForThis || locked || disableOtherButtons || isCancelled, onClick: () => handleRsvp(id, "accepted"), className: `px-3 py-1 rounded ${loadingForThis || locked || isCancelled ? "opacity-60 cursor-not-allowed" : ""} ${isDark ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white shadow-sm"}`, children: isCancelled ? 'Accept' : (loadingForThis ? _jsx(Loader2, { className: "animate-spin w-4 h-4" }) : "Accept") }), _jsx(Button, { disabled: loadingForThis || locked || disableOtherButtons || isCancelled, onClick: () => handleRsvp(id, "declined"), variant: "ghost", className: `px-3 py-1 ${loadingForThis || locked || isCancelled ? "opacity-60 cursor-not-allowed" : ""} ${!locked ? "text-red-600" : ""}`, children: isCancelled ? 'Cancelled' : (loadingForThis ? _jsx(Loader2, { className: "animate-spin w-4 h-4" }) : "Decline") })] })), isCreator && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => {
                                                                    if (isCancelled) {
                                                                        alert('Meeting already cancelled');
                                                                        return;
                                                                    }
                                                                    if (m.status === 'cancelled') {
                                                                        alert('Meeting is already cancelled.');
                                                                        return;
                                                                    }
                                                                    if (!confirm('Cancel this meeting for everyone?'))
                                                                        return;
                                                                    handleCancelMeeting(id);
                                                                }, disabled: m.status === 'cancelled' || Boolean(rsvpLoading[id]) || disableOtherButtons, variant: "destructive", className: "ml-2 px-3 py-1", children: rsvpLoading[id] ? _jsx(Loader2, { className: "animate-spin w-4 h-4" }) : (m.status === 'cancelled' ? 'Cancelled' : 'Cancel') }), _jsx(Button, { onClick: () => {
                                                                    if (isCancelled) {
                                                                        alert('Meeting is cancelled — cannot mark completed');
                                                                        return;
                                                                    }
                                                                    if (!meetingEnded) {
                                                                        alert('Meeting is not finished yet — can only mark completed after end time.');
                                                                        return;
                                                                    }
                                                                    if (!confirm('Mark this meeting as completed?'))
                                                                        return;
                                                                    handleMarkCompleted(id);
                                                                }, disabled: !meetingEnded || alreadyCompleted || Boolean(rsvpLoading[id]) || disableOtherButtons || isCancelled, className: `ml-2 px-3 py-1 ${(!meetingEnded || alreadyCompleted) ? "opacity-60 cursor-not-allowed" : "bg-blue-600 text-white"}`, children: alreadyCompleted ? 'Completed' : meetingEnded ? (rsvpLoading[id] ? _jsx(Loader2, { className: "animate-spin w-4 h-4" }) : 'Mark completed') : 'Will be available after end' })] }))] })] }, id));
                                }) })) }), _jsx(CardFooter, { children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", meetings.length, " invitation(s)"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Auto-refreshed when you change date" })] }) })] })] }) }));
}
