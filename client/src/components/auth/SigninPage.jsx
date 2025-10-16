"use client";

import { LoaderIcon } from "lucide-react";
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

// Zod schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const [backendError, setBackendError] = useState("");
  const [isSubmit, setSubmit] = useState(false);

  const onSubmit = async (data) => {
    setBackendError("");
    setSubmit(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Logged in successfully", { position: "top-center" });
      reset();
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
      if (result.user) {
        toast.success(`Welcome ${result.user.displayName}`, { position: "top-center" });
      }
      navigate("/user");
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  function Spinner({ className, ...props }) {
    return (
      <LoaderIcon
        role="status"
        aria-label="Loading"
        className={cn("w-6 h-6 animate-spin", className)}
        {...props}
      />
    );
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) navigate("/user", { replace: true });
    });
    return () => unsubscribe();
  }, [navigate]);

  const bgGradient = isDark
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900"
    : "bg-gradient-to-br from-blue-50 to-indigo-100";

  const cardBg = isDark ? "bg-gray-800 shadow-lg shadow-indigo-800/50" : "bg-white shadow-md";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const descriptionColor = isDark ? "text-indigo-200" : "text-gray-600";
  const inputBg = isDark
    ? "bg-gray-700 text-white placeholder-indigo-300 border-indigo-600"
    : "bg-white text-gray-900 placeholder-gray-400 border-gray-300";

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 ${bgGradient}`}>
      <div className="w-full sm:max-w-md">
        <h1 className={`text-3xl font-bold mb-6 text-center ${textColor} drop-shadow-lg`}>
          Sign In
        </h1>

        <Card className={`w-full ${cardBg} rounded-xl`}>
          <CardHeader>
            <CardTitle className={`${textColor} font-semibold`}>Login to your account</CardTitle>
            <CardDescription className={descriptionColor}>
              Enter your email and password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel className={textColor} htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`${inputBg} ${errors.email ? "border-red-500" : ""}`}
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <FieldError
                      errors={[errors.email]}
                      className="text-red-500 text-sm mt-1"
                    />
                  )}
                </Field>

                <Field>
                  <FieldLabel className={textColor} htmlFor="password">Password</FieldLabel>
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9 0-1.132.213-2.21.6-3.2m1.2-1.2a9.958 9.958 0 015.2-1.6c5 0 9 4 9 9 0 1.132-.213 2.21-.6 3.2M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError errors={[errors.password]} className="text-red-500 text-sm mt-1" />
                  )}
                </Field>

                {backendError && (
                  <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600 border border-red-300">
                    {backendError}
                  </div>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmit}>
              {isSubmit ? <Spinner /> : "Login"}
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col items-center mt-6">
          <p className={`${descriptionColor} mb-2 font-medium`}>Or sign in with</p>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-indigo-500 text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
            onClick={handleGoogleSignIn}
          >
            <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
            <span className="text-white font-semibold">Sign in with Google</span>
          </Button>

          {/* Sign Up link */}
          <p className={`${descriptionColor} mt-4 text-sm`}>
            Not registered?{" "}
            <span
              className="text-indigo-400 font-medium hover:text-indigo-200 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
