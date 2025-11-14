"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ThemeContext } from "@/context/ThemeContext";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { LoaderIcon, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import googleLogo from "../../assets/download.png";
const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["EXECUTIVE", "SECRETARY"]),
});
export default function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const [backendError, setBackendError] = useState(null);
    const [isSubmit, setSubmit] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: "", password: "", role: "EXECUTIVE" },
    });
    const Spinner = () => _jsx(LoaderIcon, { className: "w-6 h-6 animate-spin text-white" });
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user)
                navigate("/user", { replace: true });
        });
        return () => unsubscribe();
    }, [navigate]);
    // Example inside your Register component
    const onSubmit = async (data) => {
        setBackendError(null); // Clear previous errors
        setSubmit(true); // Start loading spinner or disable button
        try {
            // 📨 1. Send registration data to your backend API
            const response = await fetch("https://time-management-software.onrender.com/api/executive/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });
            // 🧾 2. Convert the response to JSON
            const result = await response.json();
            // ⚠️ 3. Check if the request failed (e.g., user already exists)
            if (!response.ok) {
                throw new Error(result.msg || "Registration failed");
            }
            // 🔐 4. Save the JWT token in localStorage (optional but useful for login state)
            localStorage.setItem("token", result.token);
            // ✅ 5. Show success notification
            toast.success("Account created successfully 🎉", { position: "top-center" });
            // 🧭 6. Reset the form and navigate to user dashboard
            reset();
            navigate("/executive");
        }
        catch (err) {
            // ❌ 7. Handle any network or backend errors
            const errorMessage = err.message || "Something went wrong!";
            setBackendError(errorMessage);
            toast.error(errorMessage, { position: "bottom-center" });
        }
        // 🔄 8. End loading state
        setSubmit(false);
    };
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            toast.success(`Welcome ${result.user.displayName}`, { position: "top-center" });
            // navigate("/");
        }
        catch (error) {
            toast.error(error.message, { position: "bottom-center" });
        }
    };
    return (_jsx("div", { className: `flex min-h-screen items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`, children: _jsxs("div", { className: "w-full max-w-md relative", children: [_jsx("button", { onClick: toggleTheme, className: "absolute top-2 right-2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition", children: isDark ? _jsx(Sun, { className: "w-5 h-5" }) : _jsx(Moon, { className: "w-5 h-5" }) }), _jsxs(Card, { className: `rounded-2xl p-6 ${isDark ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"}`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${isDark ? "text-white" : "text-gray-900"} text-2xl`, children: "Create Account" }), _jsx(CardDescription, { className: `${isDark ? "text-gray-300" : "text-gray-600"}`, children: "Join your team and manage your time efficiently" })] }), _jsx(CardContent, { children: _jsx("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: _jsxs(FieldGroup, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { className: isDark ? "text-white" : "", htmlFor: "name", children: "Full Name *" }), _jsx(Input, { id: "name", placeholder: "Enter your full name", ...register("name"), className: `${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}` })] }), _jsxs(Field, { children: [_jsx(FieldLabel, { className: isDark ? "text-white" : "", htmlFor: "email", children: "Email *" }), _jsx(Input, { id: "email", type: "email", placeholder: "you@example.com", ...register("email"), className: `${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}` })] }), _jsxs(Field, { children: [_jsx(FieldLabel, { className: isDark ? "text-white" : "", htmlFor: "password", children: "Password *" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", ...register("password"), className: `${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""} pr-10` }), _jsx("button", { type: "button", className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white", onClick: () => setShowPassword(!showPassword), children: showPassword ? "🙈" : "👁️" })] })] }), backendError && (_jsx("div", { className: "rounded-lg bg-red-500/20 p-2 text-red-500 text-sm mt-2 text-center", children: backendError }))] }) }) }), _jsxs(CardFooter, { className: "flex justify-between mt-2", children: [_jsx(Button, { type: "button", onClick: () => reset(), className: isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "", children: "Reset" }), _jsx(Button, { type: "submit", onClick: handleSubmit(onSubmit), disabled: isSubmit, className: isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "", children: isSubmit ? _jsx(Spinner, {}) : "Sign Up" })] }), _jsxs("div", { className: "mt-6 text-center", children: [_jsxs("div", { className: "flex items-center justify-center mb-3", children: [_jsx("div", { className: "flex-grow border-t border-gray-600/30" }), _jsx("span", { className: "mx-2 text-gray-300 text-sm", children: "Or continue with" }), _jsx("div", { className: "flex-grow border-t border-gray-600/30" })] }), _jsxs(Button, { onClick: handleGoogleSignIn, className: `flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-800 hover:bg-gray-50"}`, children: [_jsx("img", { src: googleLogo, alt: "Google", className: "w-5 h-5" }), "Sign up with Google"] })] })] })] }) }));
}
