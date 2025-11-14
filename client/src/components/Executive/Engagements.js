import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Engagements.jsx
import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
const API = "https://time-management-software.onrender.com"; // e.g. 
function getAuthHeaders() {
    const token = localStorage.getItem('token'); // make sure your login stores the JWT here
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    return headers;
}
export default function Engagements() {
    const { isDark } = useContext(ThemeContext);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    async function fetchTasks() {
        try {
            const res = await fetch(`${API}/api/executive/me/tasks`, {
                method: 'GET',
                headers: getAuthHeaders(),
                // credentials: 'include' // uncomment if your server uses cookie sessions
            });
            if (res.status === 401) {
                toast.error('Not authenticated — please log in');
                console.warn('fetchTasks: 401 Unauthorized');
                return;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({ msg: 'Failed to fetch tasks' }));
                throw new Error(err.msg || 'Failed to fetch tasks');
            }
            const data = await res.json();
            setTasks(data.tasks || []);
        }
        catch (err) {
            console.error('fetchTasks error', err);
        }
    }
    useEffect(() => { fetchTasks(); }, []);
    async function handleAdd(e) {
        e.preventDefault();
        if (!title || !startTime)
            return toast.error('Title and start time required');
        setLoading(true);
        try {
            const payload = { tasks: { title, startTime, endTime: endTime || undefined, description } };
            const res = await fetch(`${API}/api/executive/me/tasks`, {
                method: 'POST',
                headers: getAuthHeaders(),
                // credentials: 'include' // uncomment if using cookie sessions
                body: JSON.stringify(payload)
            });
            if (res.status === 401) {
                toast.error('Not authenticated — please log in');
                console.warn('handleAdd: 401 Unauthorized — No token sent or token expired');
                return;
            }
            const body = await res.json();
            if (!res.ok)
                throw new Error(body.msg || body.error || 'Failed to add task');
            toast.success('Task created');
            setTitle('');
            setStartTime('');
            setEndTime('');
            setDescription('');
            if (body.tasks)
                setTasks(prev => [...body.tasks, ...prev]);
        }
        catch (err) {
            toast.error(err.message || 'Error');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: isDark ? 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-8' : 'min-h-screen bg-gray-50 text-gray-900 p-8', children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-6", children: "Engagements" }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Add a Task" }), _jsx("p", { className: "text-sm opacity-80", children: "Create time-blocked engagements for your calendar" })] }) }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleAdd, className: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full", children: [_jsx("div", { className: "col-span-1 md:col-span-2", children: _jsx(Input, { placeholder: "Task title", value: title, onChange: e => setTitle(e.target.value) }) }), _jsxs("div", { children: [_jsx("label", { className: "text-sm mb-1 block", children: "Start" }), _jsx("input", { className: "w-full rounded-md p-2 border bg-transparent", type: "datetime-local", value: startTime, onChange: e => setStartTime(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm mb-1 block", children: "End (optional)" }), _jsx("input", { className: "w-full rounded-md p-2 border bg-transparent", type: "datetime-local", value: endTime, onChange: e => setEndTime(e.target.value) })] }), _jsxs("div", { className: "col-span-1 md:col-span-2", children: [_jsx("label", { className: "text-sm mb-1 block", children: "Description" }), _jsx("textarea", { value: description, onChange: e => setDescription(e.target.value), className: "w-full rounded-md p-2 border bg-transparent h-24" })] }), _jsx(CardFooter, { className: "col-span-1 md:col-span-2 flex justify-end", children: _jsx(Button, { type: "submit", disabled: loading, children: loading ? 'Adding...' : 'Add Task' }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold", children: "Your Tasks" }) }), _jsx(CardContent, { children: tasks.length === 0 ? (_jsx("p", { className: "opacity-70", children: "No tasks yet \u2014 create one above." })) : (_jsx("ul", { className: "space-y-3", children: tasks.map(t => (_jsxs("li", { className: "p-3 rounded-lg border flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: t.title }), _jsxs("div", { className: "text-xs opacity-80", children: [new Date(t.startTime).toLocaleString(), " \u2014 ", t.endTime ? new Date(t.endTime).toLocaleString() : '—'] }), t.description && _jsx("div", { className: "mt-1 text-sm opacity-80", children: t.description })] }), _jsx("div", { className: "text-xs opacity-60", children: new Date(t.createdAt || Date.now()).toLocaleString() })] }, t._id || t.title + t.startTime))) })) })] })] }) }));
}
