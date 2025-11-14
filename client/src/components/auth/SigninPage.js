"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoaderIcon, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ThemeContext } from "../../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';
import googleLogo from "../../assets/download.png";
// Zod schema
const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const [isSubmit, setSubmit] = useState(false);
    const [backendError, setBackendError] = useState("");
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });
    const onSubmit = async (data) => {
        setSubmit(true);
        setBackendError("");
        try {
            const response = await fetch("https://time-management-software.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log(result.user.role);
            const role = result?.user?.role;
            if (!response.ok) {
                setBackendError(result.msg || "Invalid credentials");
            }
            else {
                // Save JWT token in localStorage
                localStorage.setItem("token", result.token);
                if (result?.user?.email)
                    localStorage.setItem("userEmail", result.user.email);
                if (result?.user?.id || result?.user?._id) {
                    localStorage.setItem("userId", result.user.id || result.user._id);
                }
                if (role)
                    localStorage.setItem("role", role);
                toast.success("Welcome back 🎉", { position: "top-center" });
                if (role == "executive")
                    navigate("/executive");
                else
                    navigate("/secretary");
            }
        }
        catch (error) {
            setBackendError("Server error. Try again later.");
            console.error(error);
        }
        setSubmit(false);
    };
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Open Google popup
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;
            // Check user in MongoDB
            const response = await fetch("https://time-management-software.onrender.com/api/auth/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.msg || "User not found. Please contact admin or sign up.", {
                    position: "bottom-center",
                });
                return;
            }
            // Save token and basic info (same as normal login)
            localStorage.setItem("token", data.token);
            // localStorage.setItem("userEmail", data.user.email);
            // localStorage.setItem("userId", data.user._id);
            toast.success(`Welcome back ${data.user.name || ""} 🎉`, {
                position: "top-center",
            });
            // Navigate based on role
            if (data.user.role === "executive")
                navigate("/executive");
            else if (data.user.role === "secretary")
                navigate("/secretary");
            if (data.user.role)
                localStorage.setItem("role", data.user.role);
        }
        catch (error) {
            console.error("Google sign-in error:", error);
            toast.error("Google sign-in failed. Try again.", { position: "bottom-center" });
        }
    };
    // useEffect(() => {
    //   const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    //     if (currentUser) navigate("/signin", { replace: true });
    //   });
    //   return () => unsubscribe();
    // }, [navigate]);
    const bgGradient = isDark
        ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81]"
        : "bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200";
    const cardBg = isDark
        ? "bg-[#1e293b]/80 backdrop-blur-md shadow-lg shadow-indigo-800/40"
        : "bg-white shadow-lg";
    const textColor = isDark ? "text-gray-100" : "text-gray-900";
    const descriptionColor = isDark ? "text-indigo-300" : "text-gray-600";
    const inputBg = isDark
        ? "bg-[#334155] text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        : "bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400";
    const Spinner = () => _jsx(LoaderIcon, { className: "w-6 h-6 animate-spin text-white" });
    return (_jsxs("div", { className: `relative flex min-h-screen items-center justify-center p-6 ${bgGradient}`, children: [_jsx("button", { onClick: toggleTheme, className: "absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition z-10", children: isDark ? _jsx(Sun, { className: "w-5 h-5" }) : _jsx(Moon, { className: "w-5 h-5" }) }), _jsxs("div", { className: "w-full max-w-md", children: [_jsx("h1", { className: `text-4xl font-extrabold mb-6 text-center ${textColor} tracking-tight`, children: "Welcome Back \uD83D\uDC4B" }), _jsxs(Card, { className: `w-full ${cardBg} rounded-2xl p-2`, children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: `${textColor} text-2xl font-semibold`, children: "Sign in to your account" }), _jsx(CardDescription, { className: `${descriptionColor} text-sm`, children: "Enter your credentials below" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs(FieldGroup, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { className: `${textColor} font-medium`, htmlFor: "email", children: "Email Address" }), _jsx(Input, { id: "email", placeholder: "you@example.com", className: `${inputBg} ${errors.email ? "border-red-500" : ""}`, ...register("email", { required: "Email is required" }) }), errors.email && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.email.message }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { className: `${textColor} font-medium`, htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", className: `${inputBg} ${errors.password ? "border-red-500" : ""} pr-10`, ...register("password", { required: "Password is required" }) }), _jsx("button", { type: "button", className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300", onClick: () => setShowPassword(!showPassword), children: showPassword ? "🙈" : "👁️" })] }), errors.password && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: errors.password.message }))] })] }), backendError && (_jsx("div", { className: "rounded-lg bg-red-100/10 text-red-400 p-3 text-sm mt-2 text-center", children: backendError })), _jsx(Button, { type: "submit", className: "w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200", disabled: isSubmit, children: isSubmit ? _jsx(Spinner, {}) : "Login" })] }) }), _jsxs(CardFooter, { className: "flex flex-col gap-3 mt-4", children: [_jsx("div", { className: "text-center", children: _jsx("p", { className: `${descriptionColor} text-sm`, children: "or" }) }), _jsxs(Button, { onClick: handleGoogleSignIn, className: "flex items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#357AE8] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200", children: [_jsx("img", { src: googleLogo, alt: "Google", className: "w-10 h-7 bg-white rounded-full p-1" }), _jsx("span", { children: "Sign in with Google" })] })] })] })] })] }));
}
