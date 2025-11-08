"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

/* -------------------------------------------------
   TimePickerPopover
   - Replaces the compact analog clock with a roomy,
     keyboard-friendly grid + minute-steps control.
   - Shows hours in a grid (0-23) and quick minute
     options (0, 15, 30, 45) plus +/- buttons and
     a fine-grained input.
   - Works well in dark/light modes and is accessible.
   ------------------------------------------------- */
function TimePickerPopover({ open, anchorRef, initial = "09:00", onClose, onUse, isDark }) {
  const [hour, setHour] = useState(Number(initial.split(":")[0] || "9"));
  const [minute, setMinute] = useState(Number(initial.split(":")[1] || "0"));
  const popRef = useRef(null);

  useEffect(() => {
    setHour(Number(initial.split(":")[0] || "9"));
    setMinute(Number(initial.split(":")[1] || "0"));
  }, [initial, open]);

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (popRef.current && !popRef.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose && onClose();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const apply = () => {
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    onUse && onUse(`${hh}:${mm}`);
  };

  const toggleMinuteStep = (step) => setMinute((m) => {
    const n = Math.min(59, Math.max(0, m + step));
    return n;
  });

  return (
    <div
      ref={popRef}
      role="dialog"
      aria-label="Select time"
      className="absolute right-0 top-10 z-[9999] w-[320px] rounded-2xl p-3 shadow-2xl"
      style={{ background: isDark ? '#0b1220' : '#ffffff', color: isDark ? '#e6eef8' : '#0f1724' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5" />
          <div className="text-sm font-medium">Choose time</div>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
      </div>

      <div className="grid grid-cols-6 gap-2 mt-2">
        {/* Hours grid 0..23 */}
        {Array.from({ length: 24 }).map((_, i) => (
          <button
            key={`h-${i}`}
            onClick={() => setHour(i)}
            className={`py-1 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-offset-1 ${hour === i ? 'ring-2 ring-offset-1 font-semibold' : 'hover:bg-gray-100'}`}
            style={{
              background: hour === i ? (isDark ? '#0ea5e9' : '#e6f0ff') : 'transparent',
              color: hour === i ? (isDark ? '#00243b' : '#0b1220') : undefined,
            }}
            aria-pressed={hour === i}
            aria-label={`Hour ${String(i).padStart(2, '0')}`}
          >
            {String(i).padStart(2, "0")}
          </button>
        ))}
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-xs">Minutes</div>
            <div className="text-sm font-medium">{String(minute).padStart(2, '0')}</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinute(0)}
              className="text-xs px-2 py-1 rounded-md border"
              aria-label="Set minutes to 00"
            >00</button>
            <button
              onClick={() => setMinute(15)}
              className="text-xs px-2 py-1 rounded-md border"
              aria-label="Set minutes to 15"
            >15</button>
            <button
              onClick={() => setMinute(30)}
              className="text-xs px-2 py-1 rounded-md border"
              aria-label="Set minutes to 30"
            >30</button>
            <button
              onClick={() => setMinute(45)}
              className="text-xs px-2 py-1 rounded-md border"
              aria-label="Set minutes to 45"
            >45</button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => toggleMinuteStep(-5)}
            className="px-2 py-1 rounded-md border text-xs"
            aria-label="Decrease minutes by 5"
          >-5</button>
          <input
            type="number"
            value={minute}
            min={0}
            max={59}
            onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value || 0))))}
            className="w-20 px-2 py-1 rounded-md text-sm text-center border"
            aria-label="Custom minutes"
          />
          <button
            onClick={() => toggleMinuteStep(5)}
            className="px-2 py-1 rounded-md border text-xs"
            aria-label="Increase minutes by 5"
          >+5</button>

          <div className="ml-auto text-xs text-gray-500">Step: 5 min</div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 rounded-md text-sm">Cancel</button>
        <button
          onClick={apply}
          className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
        >
          Use {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   EventModal (updated) - uses TimePickerPopover
   - Keeps the same API as your original component.
   - Uses anchor refs so the popover positions properly.
   ------------------------------------------------- */
export default function EventModal({ open, onClose, initialValues = {}, onSave, isDark = false }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    start: "09:00",
    end: "10:00",
    guests: "",
    venue: "",
    notes: "",
    ...initialValues,
  });

  const [showStartClock, setShowStartClock] = useState(false);
  const [showEndClock, setShowEndClock] = useState(false);
  const startAnchor = useRef(null);
  const endAnchor = useRef(null);

  useEffect(() => {
    setForm((f) => ({ ...f, ...initialValues }));
  }, [initialValues]);

  if (!open) return null;

  const handleSave = () => {
    // Basic validation: ensure end >= start
    const [sh, sm] = form.start.split(":").map(Number);
    const [eh, em] = form.end.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) {
      // auto-fix by adding 30 minutes if end is before start
      const newEnd = startMinutes + 30;
      const eh2 = Math.floor(newEnd / 60) % 24;
      const em2 = newEnd % 60;
      setForm({ ...form, end: `${String(eh2).padStart(2, "0")}:${String(em2).padStart(2, "0")}` });
      // still call onSave with corrected value
      onSave && onSave({ ...form, end: `${String(eh2).padStart(2, "0")}:${String(em2).padStart(2, "0")}` });
      return;
    }
    onSave && onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-2 relative">
            <div className="relative">
              <Label>Start</Label>
              <div className="flex items-center gap-2" ref={startAnchor}>
                <Input
                  type="text"
                  readOnly
                  value={form.start}
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setShowStartClock((s) => !s);
                    setShowEndClock(false);
                  }}
                />
                <Clock
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => {
                    setShowStartClock((s) => !s);
                    setShowEndClock(false);
                  }}
                />
              </div>

              {showStartClock && (
                <TimePickerPopover
                  open={showStartClock}
                  anchorRef={startAnchor}
                  onClose={() => setShowStartClock(false)}
                  onUse={(val) => {
                    setForm({ ...form, start: val });
                    setShowStartClock(false);
                    // if end is earlier than start, nudge end
                    const [sh, sm] = val.split(":").map(Number);
                    const [eh, em] = form.end.split(":").map(Number);
                    if (eh * 60 + em <= sh * 60 + sm) {
                      const newEnd = sh * 60 + sm + 30;
                      const eh2 = Math.floor(newEnd / 60) % 24;
                      const em2 = newEnd % 60;
                      setForm((f) => ({ ...f, end: `${String(eh2).padStart(2, "0")}:${String(em2).padStart(2, "0")}` }));
                    }
                  }}
                  isDark={isDark}
                  initial={form.start}
                />
              )}
            </div>

            <div className="relative">
              <Label>End</Label>
              <div className="flex items-center gap-2" ref={endAnchor}>
                <Input
                  type="text"
                  readOnly
                  value={form.end}
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setShowEndClock((s) => !s);
                    setShowStartClock(false);
                  }}
                />
                <Clock
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => {
                    setShowEndClock((s) => !s);
                    setShowStartClock(false);
                  }}
                />
              </div>

              {showEndClock && (
                <TimePickerPopover
                  open={showEndClock}
                  anchorRef={endAnchor}
                  onClose={() => setShowEndClock(false)}
                  onUse={(val) => {
                    setForm({ ...form, end: val });
                    setShowEndClock(false);
                  }}
                  isDark={isDark}
                  initial={form.end}
                />
              )}
            </div>
          </div>

          <div>
            <Label>Guests</Label>
            <Input
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              placeholder="Add guests"
            />
          </div>

          <div>
            <Label>Venue</Label>
            <Input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="Meeting room / link"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
