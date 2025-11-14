"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function UsersList() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // single user
    const [loading, setLoading] = useState(true);
    const fetchUser = async () => {
        auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser)
                return;
            try {
                console.log(currentUser);
                setUser(currentUser);
            }
            catch (err) {
                toast.error("Error fetching user");
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        });
    };
    useEffect(() => {
        fetchUser();
    }, []);
    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (!user)
                navigate("/signin", { replace: true });
            return;
        });
    }, [navigate]);
    const handleLogout = async () => {
        await auth.signOut();
        window.location.href = "/signin";
    };
    return (_jsxs("div", { className: "flex min-h-screen items-center justify-center p-4 bg-gray-100", children: [_jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("h1", { className: "text-3xl font-bold mb-6 text-center", children: "User Details" }), loading ? (_jsx("p", { className: "text-center text-gray-600", children: "Loading user..." })) : user ? (_jsxs(Card, { className: "mb-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: user.displayName }) }), _jsxs(CardContent, { children: [_jsxs("p", { children: ["Email: ", user.email] }), user.role && _jsxs("p", { children: ["Role: ", user.role] })] })] })) : (_jsx("p", { className: "text-center text-red-500", children: "No user found" }))] }), _jsx("button", { onClick: handleLogout, children: "LogOut" })] }));
}
