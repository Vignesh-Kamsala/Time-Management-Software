"use client";

import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";

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

  const Spinner = () => <LoaderIcon className="w-6 h-6 animate-spin text-white" />;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/user", { replace: true });
    });
    return () => unsubscribe();
  }, [navigate]);

  const onSubmit = async (data) => {
    setBackendError(null);
    setSubmit(true);

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Account created successfully 🎉", { position: "top-center" });
      reset();
      navigate("/user");
    } catch (err) {
      setBackendError(err.message);
      toast.error(err.message, { position: "bottom-center" });
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

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full max-w-md relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Card className={`rounded-2xl p-6 ${isDark ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"}`}>
          <CardHeader>
            <CardTitle className={`${isDark ? "text-white" : "text-gray-900"} text-2xl`}>
              Create Account
            </CardTitle>
            <CardDescription className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Join your team and manage your time efficiently
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className={isDark ? "text-white" : ""} htmlFor="name">
                    Full Name *
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}`}
                  />
                </Field>

                <Field>
                  <FieldLabel className={isDark ? "text-white" : ""} htmlFor="email">
                    Email *
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}`}
                  />
                </Field>

                <Field>
                  <FieldLabel className={isDark ? "text-white" : ""} htmlFor="password">
                    Password *
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""} pr-10`}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </Field>

                {backendError && (
                  <div className="rounded-lg bg-red-500/20 p-2 text-red-500 text-sm mt-2 text-center">
                    {backendError}
                  </div>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between mt-2">
            <Button type="button" onClick={() => reset()} className={isDark ? "bg-gray-700 text-white hover:bg-gray-600" : ""}>
              Reset
            </Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmit} className={isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : ""}>
              {isSubmit ? <Spinner /> : "Sign Up"}
            </Button>
          </CardFooter>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="flex-grow border-t border-gray-600/30"></div>
              <span className="mx-2 text-gray-300 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-600/30"></div>
            </div>
            <Button
              onClick={handleGoogleSignIn}
              className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium ${
                isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              <img src={googleLogo} alt="Google" className="w-5 h-5" />
              Sign up with Google
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
