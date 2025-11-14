"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
const API_BASE = "https://time-management-software.onrender.com";
function toDateTimeLocal(value) {
    if (!value)
        return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export default function RearrangeAppointments() {
    const { isDark } = useContext(ThemeContext);
    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
    const [conflicts, setConflicts] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [proposalForm, setProposalForm] = useState({ startTime: "", endTime: "", notes: "" });
    const [resolutionForm, setResolutionForm] = useState({ startTime: "", endTime: "", notes: "" });
    const [consultationForm, setConsultationForm] = useState({ participantKey: "", decision: "approved", notes: "" });
    const [savingProposal, setSavingProposal] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [escalating, setEscalating] = useState(false);
    const [savingConsultation, setSavingConsultation] = useState(false);
    const loadConflicts = useCallback(async () => {
        if (!token)
            return;
        setLoadingList(true);
        setListError(null);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts?limit=20`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Unable to load conflicts");
            const data = await res.json();
            const items = Array.isArray(data?.conflicts) ? data.conflicts : [];
            setConflicts(items.filter((item) => item.status === "open" || item.status === "in_progress"));
        }
        catch (err) {
            console.error(err);
            setListError("Failed to fetch conflicts");
        }
        finally {
            setLoadingList(false);
        }
    }, [token]);
    const loadConflictDetail = useCallback(async (id) => {
        if (!token || !id)
            return;
        setDetailLoading(true);
        setDetailError(null);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Unable to load conflict detail");
            const data = await res.json();
            const conflict = data?.conflict ?? null;
            setDetail(conflict);
            if (conflict?.meeting) {
                setResolutionForm({
                    startTime: toDateTimeLocal(conflict.meeting.startTime),
                    endTime: toDateTimeLocal(conflict.meeting.endTime),
                    notes: "",
                });
            }
            setProposalForm({ startTime: "", endTime: "", notes: "" });
            setConsultationForm({ participantKey: "", decision: "approved", notes: "" });
        }
        catch (err) {
            console.error(err);
            setDetailError("Unable to load conflict detail");
        }
        finally {
            setDetailLoading(false);
        }
    }, [token]);
    useEffect(() => {
        loadConflicts();
    }, [loadConflicts]);
    const openDialogForConflict = (id) => {
        setSelectedId(id);
        setDialogOpen(true);
        loadConflictDetail(id);
    };
    const handleProposalSubmit = async (event) => {
        event.preventDefault();
        if (!selectedId || !proposalForm.startTime || !proposalForm.endTime)
            return;
        setSavingProposal(true);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts/${selectedId}/proposals`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    startTime: proposalForm.startTime,
                    endTime: proposalForm.endTime,
                    notes: proposalForm.notes,
                }),
            });
            if (!res.ok)
                throw new Error("Failed to save proposal");
            const data = await res.json();
            setDetail(data?.conflict ?? detail);
            setProposalForm({ startTime: "", endTime: "", notes: "" });
            loadConflicts();
        }
        catch (err) {
            console.error(err);
            setDetailError("Unable to add proposal");
        }
        finally {
            setSavingProposal(false);
        }
    };
    const handleResolve = async (event) => {
        event.preventDefault();
        if (!selectedId || !resolutionForm.startTime || !resolutionForm.endTime)
            return;
        setResolving(true);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts/${selectedId}/resolve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    startTime: resolutionForm.startTime,
                    endTime: resolutionForm.endTime,
                    resolutionNotes: resolutionForm.notes,
                }),
            });
            if (!res.ok)
                throw new Error("Failed to resolve conflict");
            const data = await res.json();
            setDetail(data?.conflict ?? detail);
            loadConflicts();
        }
        catch (err) {
            console.error(err);
            setDetailError("Unable to resolve conflict");
        }
        finally {
            setResolving(false);
        }
    };
    const handleEscalate = async () => {
        if (!selectedId)
            return;
        setEscalating(true);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts/${selectedId}/escalate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: resolutionForm.notes || "Escalated" }),
            });
            if (!res.ok)
                throw new Error("Failed to escalate conflict");
            const data = await res.json();
            setDetail(data?.conflict ?? detail);
            loadConflicts();
        }
        catch (err) {
            console.error(err);
            setDetailError("Unable to escalate conflict");
        }
        finally {
            setEscalating(false);
        }
    };
    const participantOptions = useMemo(() => {
        if (!detail)
            return [];
        const map = new Map();
        const addOption = ({ id, email, name }) => {
            const normalizedEmail = email ? String(email).toLowerCase() : null;
            const key = id ? `id:${id}` : normalizedEmail ? `email:${normalizedEmail}` : null;
            if (!key)
                return;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    id,
                    email: normalizedEmail,
                    label: name || email || 'Executive',
                });
            }
        };
        (detail.overlaps || []).forEach((item) => {
            addOption({
                id: item.executive?._id,
                email: item.executiveEmail || item.executive?.email,
                name: item.executive?.name,
            });
        });
        (detail.participantIds || []).forEach((id) => {
            if (id)
                addOption({ id, email: null, name: null });
        });
        (detail.participantEmails || []).forEach((email) => addOption({ id: null, email, name: email }));
        return Array.from(map.values());
    }, [detail]);
    const handleConsultationSubmit = async (event) => {
        event.preventDefault();
        if (!selectedId || !consultationForm.participantKey)
            return;
        const option = participantOptions.find((item) => item.key === consultationForm.participantKey);
        if (!option)
            return;
        const payload = {
            decision: consultationForm.decision,
            notes: consultationForm.notes,
        };
        if (option.id)
            payload.executiveId = option.id;
        if (option.email)
            payload.executiveEmail = option.email;
        payload.executiveName = option.label;
        setSavingConsultation(true);
        try {
            const res = await fetch(`${API_BASE}/api/secretary/conflicts/${selectedId}/consultations`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error("Failed to save consultation");
            const data = await res.json();
            setDetail(data?.conflict ?? detail);
            setConsultationForm({ participantKey: option.key, decision: consultationForm.decision, notes: "" });
            loadConflicts();
        }
        catch (err) {
            console.error(err);
            setDetailError("Unable to record consultation");
        }
        finally {
            setSavingConsultation(false);
        }
    };
    const dialogSurface = isDark
        ? "bg-slate-950/80 border-slate-800/80 text-slate-100"
        : "bg-white/95 border-white/60 text-slate-900";
    const glassPanel = isDark
        ? "bg-slate-900/60 border-slate-800/80 shadow-[0_24px_40px_-32px_rgba(15,23,42,0.9)]"
        : "bg-white/85 border-slate-200/80 shadow-[0_26px_48px_-30px_rgba(15,23,42,0.25)]";
    const softAccent = isDark
        ? "bg-gradient-to-r from-indigo-500/25 via-purple-500/10 to-transparent"
        : "bg-gradient-to-r from-indigo-500/15 via-sky-400/10 to-transparent";
    const participantsList = Array.isArray(detail?.participantEmails)
        ? detail.participantEmails.filter(Boolean)
        : [];
    const hasAgenda = Boolean(detail?.meeting?.description?.trim());
    const hasParticipants = participantsList.length > 0;
    const hasContextCards = hasAgenda || hasParticipants;
    const hasProposals = Array.isArray(detail?.proposedOptions) && detail.proposedOptions.length > 0;
    const hasConsultations = Array.isArray(detail?.consultations) && detail.consultations.length > 0;
    const projectLabel = detail?.meeting?.project?.trim() || null;
    const requestedByLabel = detail?.requestedBy?.name || detail?.requestedBy?.email || null;
    return (_jsxs("div", { className: `${isDark ? "text-gray-100" : "text-gray-900"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Rearrange Appointments" }), _jsx("p", { className: "text-sm text-gray-500", children: "Review conflicts, consult executives, and confirm updated times." })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: loadConflicts, disabled: loadingList, children: "Refresh list" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Conflict queue" }) }), _jsx(CardContent, { children: loadingList ? (_jsx("p", { className: "text-sm text-gray-500", children: "Loading conflicts\u2026" })) : listError ? (_jsx("p", { className: "text-sm text-red-500", children: listError })) : conflicts.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No meetings awaiting rearrangement." })) : (_jsx("div", { className: "grid gap-3", children: conflicts.map((conflict) => (_jsx(Card, { className: "border border-slate-200", children: _jsxs(CardContent, { className: "p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-base", children: conflict.meeting?.title ?? "Untitled meeting" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Requested by ", conflict.requestedBy?.name || conflict.requestedBy?.email || "Unknown"] }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: ["Current slot: ", conflict.meeting?.startTime ? new Date(conflict.meeting.startTime).toLocaleString() : "TBD"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "outline", className: "capitalize", children: conflict.status }), _jsx(Button, { size: "sm", onClick: () => openDialogForConflict(conflict._id), children: "Review" })] })] }) }, conflict._id))) })) })] }), _jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: _jsxs(DialogContent, { className: `${dialogSurface} top-[6vh] translate-y-0 w-[min(96vw,1100px)] max-w-5xl max-h-[82vh] overflow-hidden rounded-2xl border
          shadow-[0_40px_72px_-40px_rgba(15,23,42,0.65)] sm:rounded-3xl`, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-2xl font-semibold tracking-tight", children: "Conflict resolution" }), _jsx(DialogDescription, { className: "text-base text-muted-foreground", children: "Coordinate with executives, suggest alternatives, then guide the executive team to a confirmed plan." })] }), detailLoading ? (_jsx("p", { className: "text-sm text-gray-500", children: "Loading details\u2026" })) : detailError ? (_jsx("p", { className: "text-sm text-red-500", children: detailError })) : !detail ? (_jsx("p", { className: "text-sm text-gray-500", children: "Select a conflict to inspect details." })) : (_jsx(ScrollArea, { className: "max-h-[calc(82vh-8rem)] pr-3", children: _jsxs("div", { className: "space-y-6 pb-2", children: [_jsxs("section", { className: `rounded-3xl border ${glassPanel} overflow-hidden`, children: [_jsx("div", { className: `px-6 py-5 ${softAccent}`, children: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.35em] text-indigo-500/80", children: "Overview" }), _jsx("h3", { className: "text-xl font-semibold", children: detail.meeting?.title || "Untitled meeting" }), (projectLabel || requestedByLabel) && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [projectLabel ? `Project ${projectLabel}` : "", projectLabel && requestedByLabel ? " · " : "", requestedByLabel ? `Requested by ${requestedByLabel}` : ""] }))] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Badge, { variant: "outline", className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30", children: detail.status?.replace(/_/g, " ") || "open" }), _jsxs("span", { children: ["Current slot: ", detail.meeting?.startTime ? new Date(detail.meeting.startTime).toLocaleString() : "TBD"] })] })] }) }), hasContextCards && (_jsx("div", { className: "px-6 pb-6 pt-4 text-sm text-muted-foreground", children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [hasAgenda && (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-slate-800/60 dark:bg-slate-950/40", children: [_jsx("p", { className: "text-xs uppercase tracking-widest text-indigo-500/80", children: "Agenda" }), _jsx("p", { className: "mt-2 leading-relaxed", children: detail.meeting?.description })] })), hasParticipants && (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-slate-800/60 dark:bg-slate-950/40", children: [_jsx("p", { className: "text-xs uppercase tracking-widest text-indigo-500/80", children: "Participants" }), _jsx("p", { className: "mt-2 leading-relaxed", children: participantsList.join(", ") })] }))] }) }))] }), _jsxs("section", { className: `rounded-3xl border ${glassPanel} p-6`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase tracking-[0.35em] text-indigo-500/80", children: "Conflicts" }), _jsx("h4", { className: "mt-2 text-lg font-semibold", children: "Schedule overlaps" })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Review affected calendars and capture their feedback." })] }), detail.overlaps?.length ? (_jsx("div", { className: "mt-4 space-y-3", children: detail.overlaps.map((item) => (_jsx(Card, { className: `border ${glassPanel} px-4 py-3`, children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: item.executive?.name || item.executiveEmail }), _jsx("p", { className: "text-xs text-muted-foreground", children: item.executiveEmail })] }), _jsxs(Badge, { variant: "outline", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", children: [item.conflicts?.length ?? 0, " overlapping items"] })] }), _jsx("ul", { className: "mt-3 space-y-2 text-xs text-muted-foreground", children: (item.conflicts || []).map((conflict, index) => (_jsxs("li", { className: "rounded-xl border border-white/10 bg-white/5 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-950/30", children: [_jsx("span", { className: "font-semibold capitalize text-foreground", children: conflict.type }), conflict.title ? ` · ${conflict.title}` : "", conflict.startTime ? ` · ${new Date(conflict.startTime).toLocaleString()}` : ""] }, index))) })] }) }, item.executiveEmail || item.executive?._id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "No overlaps captured." }))] }), _jsxs("section", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-xs uppercase tracking-[0.35em] text-indigo-500/80", children: "Resolution flow" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Move through each step to capture alternative slots, confirm the final timing, and document executive consent." })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("form", { onSubmit: handleProposalSubmit, className: `relative flex flex-col gap-3 rounded-3xl border ${glassPanel} p-5`, children: [_jsx("span", { className: "text-xs uppercase tracking-[0.4em] text-indigo-500/80", children: "Step 1" }), _jsx("h4", { className: "text-base font-semibold", children: "Log alternative slot" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Capture candidate timings to keep everyone aligned while you coordinate." }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "proposal-start", children: "Start" }), _jsx(Input, { id: "proposal-start", type: "datetime-local", value: proposalForm.startTime, onChange: (e) => setProposalForm((prev) => ({ ...prev, startTime: e.target.value })), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "proposal-end", children: "End" }), _jsx(Input, { id: "proposal-end", type: "datetime-local", value: proposalForm.endTime, onChange: (e) => setProposalForm((prev) => ({ ...prev, endTime: e.target.value })), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "proposal-notes", children: "Notes" }), _jsx(Textarea, { id: "proposal-notes", rows: 3, value: proposalForm.notes, onChange: (e) => setProposalForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Record whom you consulted and their feedback" })] }), _jsx(Button, { type: "submit", size: "sm", className: "mt-auto", disabled: savingProposal, children: savingProposal ? "Saving…" : "Add proposal" })] }), _jsxs("form", { onSubmit: handleResolve, className: `relative flex flex-col gap-3 rounded-3xl border ${glassPanel} p-5`, children: [_jsx("span", { className: "text-xs uppercase tracking-[0.4em] text-indigo-500/80", children: "Step 2" }), _jsx("h4", { className: "text-base font-semibold", children: "Confirm final timing" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Finalise the agreed window, update notes, and notify stakeholders." }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "resolve-start", children: "Start" }), _jsx(Input, { id: "resolve-start", type: "datetime-local", value: resolutionForm.startTime, onChange: (e) => setResolutionForm((prev) => ({ ...prev, startTime: e.target.value })), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "resolve-end", children: "End" }), _jsx(Input, { id: "resolve-end", type: "datetime-local", value: resolutionForm.endTime, onChange: (e) => setResolutionForm((prev) => ({ ...prev, endTime: e.target.value })), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "resolve-notes", children: "Notes" }), _jsx(Textarea, { id: "resolve-notes", rows: 3, value: resolutionForm.notes, onChange: (e) => setResolutionForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Document decisions, attendees consulted, etc." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [_jsx(Button, { type: "submit", size: "sm", disabled: resolving, children: resolving ? "Saving…" : "Resolve conflict" }), _jsx(Button, { type: "button", variant: "destructive", size: "sm", onClick: handleEscalate, disabled: escalating, children: escalating ? "Escalating…" : "Escalate" })] })] }), _jsxs("form", { onSubmit: handleConsultationSubmit, className: `relative flex flex-col gap-3 rounded-3xl border ${glassPanel} p-5`, children: [_jsx("span", { className: "text-xs uppercase tracking-[0.4em] text-indigo-500/80", children: "Step 3" }), _jsx("h4", { className: "text-base font-semibold", children: "Record executive consent" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Note down feedback from each participant and mark their decision status." }), participantOptions.length === 0 ? (_jsx("p", { className: "text-xs text-gray-500", children: "No participants detected for this conflict." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "consultation-target", children: "Executive" }), _jsxs("select", { id: "consultation-target", className: `w-full rounded-md border px-3 py-2 text-sm ${isDark ? "bg-slate-900 border-slate-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`, value: consultationForm.participantKey, onChange: (event) => setConsultationForm((prev) => ({ ...prev, participantKey: event.target.value })), required: true, children: [_jsx("option", { value: "", disabled: true, children: "Select executive" }), participantOptions.map((option) => (_jsx("option", { value: option.key, children: option.label }, option.key)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "consultation-decision", children: "Decision" }), _jsxs("select", { id: "consultation-decision", className: `w-full rounded-md border px-3 py-2 text-sm ${isDark ? "bg-slate-900 border-slate-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`, value: consultationForm.decision, onChange: (event) => setConsultationForm((prev) => ({ ...prev, decision: event.target.value })), children: [_jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "declined", children: "Declined" }), _jsx("option", { value: "pending", children: "Pending" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "consultation-notes", children: "Notes" }), _jsx(Textarea, { id: "consultation-notes", rows: 3, value: consultationForm.notes, onChange: (event) => setConsultationForm((prev) => ({ ...prev, notes: event.target.value })), placeholder: "Document when and how consent was obtained" })] }), _jsx(Button, { type: "submit", size: "sm", className: "mt-auto", disabled: savingConsultation, children: savingConsultation ? "Saving…" : "Log decision" })] }))] })] })] }), hasProposals && (_jsxs("section", { className: `rounded-3xl border ${glassPanel} p-6`, children: [_jsx("span", { className: "text-xs uppercase tracking-[0.35em] text-indigo-500/80", children: "Activity" }), _jsx("h4", { className: "mt-2 text-lg font-semibold", children: "Proposals logged" }), _jsx("ul", { className: "mt-3 space-y-2 text-xs text-muted-foreground", children: detail.proposedOptions.map((proposal, index) => (_jsx("li", { className: "rounded-md bg-white/5 px-3 py-2", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: proposal.title || "Proposed slot" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [proposal.startTime ? new Date(proposal.startTime).toLocaleString() : "", proposal.endTime ? ` – ${new Date(proposal.endTime).toLocaleString()}` : ""] })] }), proposal.notes && _jsx("p", { className: "text-xs text-muted-foreground", children: proposal.notes })] }) }, proposal._id || index))) })] })), hasConsultations && (_jsxs("section", { className: `rounded-3xl border ${glassPanel} p-6`, children: [_jsx("span", { className: "text-xs uppercase tracking-[0.35em] text-indigo-500/80", children: "Audit trail" }), _jsx("h4", { className: "mt-2 text-lg font-semibold", children: "Consultation record" }), _jsx("ul", { className: "mt-3 space-y-2 text-xs text-gray-500", children: detail.consultations.map((entry, index) => {
                                                    const recordedAt = entry.updatedAt || entry.recordedAt;
                                                    return (_jsxs("li", { className: "rounded-md bg-slate-100/70 px-3 py-2", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "font-semibold text-sm", children: entry.executive?.name || entry.executiveName || entry.executiveEmail || "Executive" }), _jsx(Badge, { variant: "outline", className: `capitalize ${entry.decision === "approved"
                                                                            ? "bg-emerald-100 text-emerald-700"
                                                                            : entry.decision === "declined"
                                                                                ? "bg-rose-100 text-rose-700"
                                                                                : "bg-amber-100 text-amber-700"}`, children: entry.decision })] }), entry.notes && _jsx("p", { className: "mt-1", children: entry.notes }), _jsxs("div", { className: "mt-1 flex items-center justify-between text-[10px] text-gray-400", children: [_jsx("span", { children: recordedAt ? new Date(recordedAt).toLocaleString() : "" }), _jsx("span", { children: entry.recordedBy?.name ? `Logged by ${entry.recordedBy.name}` : "" })] })] }, entry._id || index));
                                                }) })] }))] }) }))] }) })] }));
}
