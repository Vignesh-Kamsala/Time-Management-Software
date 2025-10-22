"use client";

import { LoaderIcon, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ThemeContext } from "../../context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data) => {
    setSubmit(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Welcome back 🎉", { position: "top-center" });
      navigate("/user");
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
    setSubmit(false);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Welcome ${result.user.displayName}`, { position: "top-center" });
      navigate("/user");
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) navigate("/user", { replace: true });
    });
    return () => unsubscribe();
  }, [navigate]);

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

  const Spinner = () => <LoaderIcon className="w-6 h-6 animate-spin text-white" />;

  return (
    <div className={`relative flex min-h-screen items-center justify-center p-6 ${bgGradient}`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition z-10"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <h1 className={`text-4xl font-extrabold mb-6 text-center ${textColor} tracking-tight`}>
          Welcome Back 👋
        </h1>

        <Card className={`w-full ${cardBg} rounded-2xl p-2`}>
          <CardHeader className="text-center">
            <CardTitle className={`${textColor} text-2xl font-semibold`}>
              Sign in to your account
            </CardTitle>
            <CardDescription className={`${descriptionColor} text-sm`}>
              Enter your credentials below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className={`${textColor} font-medium`} htmlFor="email">
                    Email Address
                  </FieldLabel>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    className={`${inputBg} ${errors.email ? "border-red-500" : ""}`}
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel className={`${textColor} font-medium`} htmlFor="password">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`${inputBg} ${errors.password ? "border-red-500" : ""} pr-10`}
                      {...register("password", { required: "Password is required" })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                  )}
                </Field>
              </FieldGroup>

              {backendError && (
                <div className="rounded-lg bg-red-100/10 text-red-400 p-3 text-sm mt-2 text-center">
                  {backendError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
                disabled={isSubmit}
              >
                {isSubmit ? <Spinner /> : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 mt-4">
            <div className="text-center">
              <p className={`${descriptionColor} text-sm`}>or</p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#357AE8] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
            >
              <img src={googleLogo} alt="Google" className="w-10 h-7 bg-white rounded-full p-1" />
              <span>Sign in with Google</span>
            </Button>

            <p className={`${descriptionColor} text-center text-sm mt-4`}>
              Don’t have an account?{" "}
              <span
                className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
