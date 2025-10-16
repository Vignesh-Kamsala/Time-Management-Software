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
import { cn } from "@/lib/utils";
import { ThemeContext } from "@/context/ThemeContext";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { LoaderIcon } from "lucide-react";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// ----------------- Zod Schema -----------------
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["EXECUTIVE", "SECRETARY"]),
});

export default function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [backendError, setBackendError] = useState(null);
  const [isSubmit, setSubmit] = useState(false);

  const bgGradient = isDark
    ? "bg-gray-800/90"
    : "bg-gradient-to-br from-blue-50 to-indigo-100";

  const cardBg = isDark ? "bg-gray-700" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const descriptionColor = isDark ? "text-gray-300" : "text-gray-600";
  const inputBg = isDark ? "bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-600" : "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", role: "EXECUTIVE" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

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

  // Redirect if user already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/user", { replace: true });
    });
    return () => unsubscribe();
  }, [navigate]);

  // Email/password signup
  const onSubmit = async (data) => {
    setBackendError(null);
    setSubmit(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(db, "Users", user.uid),
          { email: user.email, firstName: data.name, role: data.role }
        );
      }
      toast.success("Account created successfully", { position: "top-center" });
      reset();
      navigate("/user");
    } catch (err) {
      setBackendError(err.message);
      toast.error(err.message, { position: "bottom-center" });
    }
    setSubmit(false);
  };

  // Google signup
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user)
      toast.success(`Welcome ${user.displayName}`, { position: "top-center" });
      navigate("/user");
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 ${bgGradient}`}>
      <div className="w-full sm:max-w-md">
        <h1 className={`text-3xl font-bold mb-6 text-center ${textColor}`}>
          Sign Up
        </h1>

        <Card className={`w-full ${cardBg}`}>
          <CardHeader>
            <CardTitle className={textColor}>Create your account</CardTitle>
            <CardDescription className={descriptionColor}>
              Enter your details below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                {/* Name */}
                <Field>
                  <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={`${errors.name ? "border-red-600" : ""} ${inputBg}`}
                  />
                  {errors.name && (
                    <FieldError errors={[errors.name]} className="text-red-600 text-sm mt-1" />
                  )}
                </Field>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`${errors.email ? "border-red-600" : ""} ${inputBg}`}
                  />
                  {errors.email && (
                    <FieldError errors={[errors.email]} className="text-red-600 text-sm mt-1" />
                  )}
                </Field>

                {/* Password */}
           <Field>
  <FieldLabel className={textColor} htmlFor="password">Password</FieldLabel>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"} // toggle type
      placeholder="Enter your password"
      className={`${inputBg} ${errors.password ? "border-red-500" : ""} pr-10`} // space for the icon
      {...register("password", { required: "Password is required" })}
    />
    <button
      type="button"
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
  {errors.password && <FieldError errors={[errors.password]} className="text-red-500 text-sm mt-1" />}
</Field>


                {/* Backend error */}
                {backendError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 mt-2">
                    {backendError}
                  </div>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className={isDark ? "border-gray-500 text-gray-100 hover:bg-gray-600" : ""}
            >
              Reset
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmit}
              className={isDark ? "bg-gray-600 hover:bg-gray-500 text-gray-100" : ""}
            >
              {isSubmit ? <Spinner /> : "Sign Up"}
            </Button>
          </CardFooter>
        </Card>

        {/* Google Signup */}
        <div className="flex flex-col items-center mt-4">
          <p className={`${descriptionColor} mb-2`}>Or sign up with</p>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full justify-center"
            onClick={handleGoogleSignIn}
          >
            <img
              src="/google-logo.png" // put google-logo.png in public folder
              alt="Google"
              className="w-5 h-5"
            />
            Sign up with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
