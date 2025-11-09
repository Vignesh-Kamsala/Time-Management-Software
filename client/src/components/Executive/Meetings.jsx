// // import { useContext } from "react";
// // import { ThemeContext } from "@/context/ThemeContext";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader } from "@/components/ui/card";
// // import { ScrollArea } from "@/components/ui/scroll-area";

// // export default function Meetings() {
// //   const { isDark } = useContext(ThemeContext);

// //   return (
// //     <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
// //       <h1 className="text-3xl font-bold mb-6">Meetings</h1>

// //       <Card className="max-w-md mx-auto">
// //         <CardHeader>Schedule a Meeting</CardHeader>
// //         <CardContent className="flex flex-col gap-4">
// //           <Input placeholder="Meeting Title / Purpose" />
// //           <Input placeholder="Participants (comma separated)" />
// //           <Input placeholder="Venue" />
// //           <Input type="time" placeholder="Start Time" />
// //           <Input type="number" placeholder="Duration (hours)" />
// //           <Button>Find Common Slot & Schedule</Button>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }
// // Meetings.jsx
// import React, { useState, useContext } from "react";
// import { ThemeContext } from "@/context/ThemeContext";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "react-hot-toast"; // optional, remove if you don't use it

// export default function Meetings() {
//   const { isDark } = useContext(ThemeContext);

//   // form state
//   const [title, setTitle] = useState("");
//   const [participants, setParticipants] = useState(""); // comma separated emails or ids
//   const [venue, setVenue] = useState("");
//   const [startRange, setStartRange] = useState(""); // ISO or date/time string
//   const [endRange, setEndRange] = useState("");
//   const [durationHours, setDurationHours] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

//   const resetResult = () => setResult(null);
// async function handleSchedule(e) {
//   e.preventDefault();
//   setResult(null);

//   if (!title || !participants) {
//     toast?.error?.("Please enter title and participants");
//     return;
//   }

//   const parts = participants.split(",").map((p) => p.trim()).filter(Boolean);
//   if (parts.length === 0) {
//     toast?.error?.("Please enter at least one participant");
//     return;
//   }

//   // default day range if user didn't set it
//   let rangeStart = startRange;
//   let rangeEnd = endRange;
//   if (!rangeStart || !rangeEnd) {
//     const d = new Date();
//     d.setHours(9, 0, 0, 0);
//     rangeStart = new Date(d).toISOString();
//     d.setHours(17, 0, 0, 0);
//     rangeEnd = new Date(d).toISOString();
//   }

//   // compute startTime so it satisfies either backend variant (insert-only needs startTime)
//   // We'll send startTime == rangeStart (the earliest time in the search window).
//   const startTime = new Date(rangeStart).toISOString();

//   // compute durationMinutes from hours input (still send both)
//   const durationMinutes = Math.round(Number(durationHours) * 60);

//   const payload = {
//     title,
//     participants: parts,
//     // include both styles so whichever backend you have will accept it:
//     durationMinutes,
//     rangeStart,   // used by availability route
//     rangeEnd,     // used by availability route
//     startTime,    // used by insert-only route
//     // optionally you can include endTime as well:
//     endTime: new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString(),
//     venue,
//     project: ""
//   };

//   setLoading(true);

//   try {
//     const res = await fetch("http://localhost:5000/api/meetings/schedule", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: JSON.stringify(payload),
//     });

//     // read as text first to avoid JSON parse errors on empty or HTML responses
//     const text = await res.text();
//     let data = null;
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch (parseErr) {
//       // not JSON (maybe HTML or empty) — keep raw text in dataRaw
//       data = { dataRaw: text };
//     }

//     if (!res.ok) {
//       // try to show server message if available
//       const msg = data?.msg || data?.error || data?.dataRaw || `Server returned ${res.status}`;
//       throw new Error(msg);
//     }

//     // success
//     setResult(data);
//     toast?.success?.(data?.meeting ? "Meeting scheduled" : "Request succeeded");
//   } catch (err) {
//     console.error("Schedule error:", err);
//     toast?.error?.(err.message || "Error scheduling meeting");
//     setResult({ error: err.message || String(err) });
//   } finally {
//     setLoading(false);
//   }
// }


//   return (
//     <div className={isDark ? "bg-gray-900 text-white min-h-screen p-6" : "bg-gray-100 text-black min-h-screen p-6"}>
//       <h1 className="text-3xl font-bold mb-6">Meetings</h1>

//       <Card className="max-w-3xl mx-auto mb-6">
//         <CardHeader>Schedule a Meeting</CardHeader>
//         <CardContent className="flex flex-col gap-4">
//           <Input value={title} onChange={(e) => { setTitle(e.target.value); resetResult(); }} placeholder="Meeting Title / Purpose" />
//           <Input value={participants} onChange={(e) => { setParticipants(e.target.value); resetResult(); }} placeholder="Participants (comma separated emails or IDs)" />
//           <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue (e.g., Room 3A or Zoom)" />
//           <div className="grid grid-cols-2 gap-2">
//             <Input type="datetime-local" value={startRange} onChange={(e) => setStartRange(e.target.value)} placeholder="Range Start (optional)" />
//             <Input type="datetime-local" value={endRange} onChange={(e) => setEndRange(e.target.value)} placeholder="Range End (optional)" />
//           </div>
//           <div className="flex gap-2">
//             <Input type="number" min="0.25" step="0.25" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} placeholder="Duration (hours)" />
//             <Button onClick={handleSchedule} className="ml-auto" disabled={loading}>
//               {loading ? "Scheduling..." : "Find Common Slot & Schedule"}
//             </Button>
//           </div>

//           {result && (
//             <div className="mt-4">
//               {result.error && <div className="text-red-400">Error: {result.error}</div>}
//               {result.meeting ? (
//                 <div>
//                   <h3 className="font-semibold">Meeting created</h3>
//                   <p className="text-sm">Title: {result.meeting.title}</p>
//                   <p className="text-sm">Start: {new Date(result.meeting.startTime).toLocaleString()}</p>
//                   <p className="text-sm">End: {new Date(result.meeting.endTime).toLocaleString()}</p>
//                   <p className="text-sm">Venue: {result.meeting.venue || "TBD"}</p>
//                 </div>
//               ) : (
//                 <div>
//                   <h3 className="font-semibold">No common slot found</h3>
//                   <p className="text-sm">{result.msg || "Try expanding the range or change participants."}</p>
//                   {result.suggestion && <pre className="text-xs bg-black/10 p-2 rounded mt-2">{JSON.stringify(result.suggestion, null, 2)}</pre>}
//                 </div>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <div className="max-w-3xl mx-auto">
//         <h2 className="text-xl font-semibold mb-3">Notes</h2>
//         <p className="text-sm opacity-80">
//           Participants may be provided either as executive **emails** (recommended) or as **IDs** (if you already know them).
//           If given as emails, the backend will try to resolve emails to executives. If some emails are not found, scheduling will fail — register those executives first.
//         </p>
//       </div>
//     </div>
//   );
// }
import React, { useState, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Meetings Page — simplified (no shadcn Select)
 * Matches your MeetingSchema:
 * { title, startTime, endTime, venue, participants, project, status }
 */
export default function Meetings() {
  const { isDark } = useContext(ThemeContext);

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");

  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [errors, setErrors] = useState({});

  function addParticipant() {
    const email = participantInput.trim();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    if (participants.includes(email)) return;
    setParticipants([...participants, email]);
    setParticipantInput("");
  }

  function removeParticipant(email) {
    setParticipants(participants.filter((p) => p !== email));
  }

  function validate() {
    const err = {};
    if (!title.trim()) err.title = "Title is required";
    if (!startTime) err.startTime = "Start time required";
    if (!endTime) err.endTime = "End time required";
    else if (new Date(endTime) <= new Date(startTime)) err.endTime = "End must be after start";
    if (participants.length === 0) err.participants = "Add at least one participant";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix form errors");
      return;
    }

    setLoading(true);
    setCreatedMeeting(null);

    const payload = {
      title,
  participantEmails: participants,  // <-- send expected key
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      venue,
      project,
      status,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/meetings/create-and-addtasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      if (!res.ok) throw new Error(data?.msg || data?.error || "Failed to schedule");

      setCreatedMeeting(data.meeting || data);
      toast.success("Meeting scheduled successfully ✅");

      // reset
      setTitle("");
      setStartTime("");
      setEndTime("");
      setVenue("");
      setProject("");
      setParticipants([]);
      setStatus("scheduled");
      setNotes("");
      setErrors({});
    } catch (err) {
      console.error("Error scheduling meeting:", err);
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  const cardBg = isDark ? "bg-slate-900/70 text-slate-100" : "bg-white text-slate-900";

  return (
    <div className={`${isDark ? "bg-slate-900" : "bg-slate-100"} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        <Card className={`${cardBg} shadow-xl rounded-2xl`}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              Schedule a Meeting
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Purpose or project (e.g. Client Review)"
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  {errors.startTime && <p className="text-xs text-red-400 mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time *</label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  {errors.endTime && <p className="text-xs text-red-400 mt-1">{errors.endTime}</p>}
                </div>
              </div>

              {/* Venue & Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Venue</label>
                  <Input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Room 3A, Zoom, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <Input
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="Project name (optional)"
                  />
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Participants (emails) *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    placeholder="Type email and press Add"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addParticipant();
                      }
                    }}
                  />
                  <Button type="button" onClick={addParticipant}>
                    Add
                  </Button>
                </div>
                {errors.participants && (
                  <p className="text-xs text-red-400 mt-1">{errors.participants}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {participants.map((p) => (
                    <div
                      key={p}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800"
                    >
                      <span className="text-sm">{p}</span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(p)}
                        className="hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Dropdown (plain select) */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="tentative">Tentative</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add remarks or agenda (optional)"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setStartTime("");
                    setEndTime("");
                    setVenue("");
                    setProject("");
                    setParticipants([]);
                    setParticipantInput("");
                    setNotes("");
                    setErrors({});
                    setCreatedMeeting(null);
                  }}
                >
                  Clear
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            {createdMeeting ? (
              <div className="w-full rounded border p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">✅ Meeting Scheduled</p>
                    <p className="text-sm">
                      Title: {createdMeeting.title || createdMeeting.meeting?.title}
                    </p>
                    <p className="text-sm">
                      Start:{" "}
                      {new Date(
                        createdMeeting.startTime || createdMeeting.meeting?.startTime
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      End:{" "}
                      {new Date(
                        createdMeeting.endTime || createdMeeting.meeting?.endTime
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      Venue: {createdMeeting.venue || createdMeeting.meeting?.venue}
                    </p>
                  </div>
                  <Badge>
                    ID: {createdMeeting._id || createdMeeting.meeting?._id}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tip: Add participant emails registered in the system.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
