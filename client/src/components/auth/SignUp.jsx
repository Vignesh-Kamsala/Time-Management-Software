// "use client";

// import React, { useContext, useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { toast } from "react-hot-toast";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   Field,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import { ThemeContext } from "@/context/ThemeContext";

// import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from "../firebase";
// import { LoaderIcon, Sun, Moon } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import googleLogo from "../../assets/download.png";

// const signUpSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   email: z.string().min(1, "Email is required").email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   role: z.enum(["EXECUTIVE", "SECRETARY"]),
// });

// export default function SignUpForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const { isDark, toggleTheme } = useContext(ThemeContext);
//   const [backendError, setBackendError] = useState(null);
//   const [isSubmit, setSubmit] = useState(false);

//   const { register, handleSubmit, reset, formState: { errors } } = useForm({
//     resolver: zodResolver(signUpSchema),
//     defaultValues: { name: "", email: "", password: "", role: "EXECUTIVE" },
//   });

//   const Spinner = () => <LoaderIcon className="w-6 h-6 animate-spin text-white" />;

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) navigate("/user", { replace: true });
//     });
//     return () => unsubscribe();
//   }, [navigate]);



// // Example inside your Register component
// // --- Replace your existing onSubmit with this version that picks the endpoint by role ---

// const onSubmit = async (data) => {
//   setBackendError(null);
//   setSubmit(true);

//   try {
//     // pick endpoint by role
//     const endpoint =
//       data.role === "EXECUTIVE"
//         ? "http://localhost:5000/api/executive/register"
//         : "http://localhost:5000/api/secretary/register";

//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         role: data.role, // optional: send role to backend as well
//       }),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result.msg || "Registration failed");
//     }

//     localStorage.setItem("token", result.token);
//     toast.success("Account created successfully 🎉", { position: "top-center" });

//     reset();

//     // navigate to role-specific dashboard
//     if (data.role === "EXECUTIVE") {
//       navigate("/executive");
//     } else {
//       navigate("/secretary");
//     }
//   } catch (err) {
//     const errorMessage = err.message || "Something went wrong!";
//     setBackendError(errorMessage);
//     toast.error(errorMessage, { position: "bottom-center" });
//   } finally {
//     setSubmit(false);
//   }
// };


//   const handleGoogleSignIn = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       const result = await signInWithPopup(auth, provider);
//       toast.success(`Welcome ${result.user.displayName}`, { position: "top-center" });
//       // navigate("/");
//     } catch (error) {
//       toast.error(error.message, { position: "bottom-center" });
//     }
//   };

//   return (
//     <div className={`flex min-h-screen items-center justify-center p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
//       <div className="w-full max-w-md relative">
//         {/* Theme toggle */}
//         <button
//           onClick={toggleTheme}
//           className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
//         >
//           {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//         </button>

//         <Card className={`rounded-2xl p-6 ${isDark ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"}`}>
//           <CardHeader>
//             <CardTitle className={`${isDark ? "text-white" : "text-gray-900"} text-2xl`}>
//               Create Account
//             </CardTitle>
//             <CardDescription className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
//               Join your team and manage your time efficiently
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <FieldGroup>
//                 <Field>
//                   <FieldLabel className={isDark ? "text-white" : ""} htmlFor="name">
//                     Full Name *
//                   </FieldLabel>
//                   <Input
//                     id="name"
//                     placeholder="Enter your full name"
//                     {...register("name")}
//                     className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}`}
//                   />
//                 </Field>

//                 <Field>
//                   <FieldLabel className={isDark ? "text-white" : ""} htmlFor="email">
//                     Email *
//                   </FieldLabel>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     {...register("email")}
//                     className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}`}
//                   />
//                 </Field>

//                 <Field>
//                   <FieldLabel className={isDark ? "text-white" : ""} htmlFor="password">
//                     Password *
//                   </FieldLabel>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Enter your password"
//                       {...register("password")}
//                       className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""} pr-10`}
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? "🙈" : "👁️"}
//                     </button>
//                   </div>
//                 </Field>

//                 {backendError && (
//                   <div className="rounded-lg bg-red-500/20 p-2 text-red-500 text-sm mt-2 text-center">
//                     {backendError}
//                   </div>
//                 )}
//               </FieldGroup>
//               <Field>
//   <FieldLabel className={isDark ? "text-white" : ""} htmlFor="role">
//     Role *
//   </FieldLabel>
//   <select
//     id="role"
//     {...register("role")}
//     className={`w-full px-3 py-2 rounded-md border focus:outline-none ${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : ""}`}
//     defaultValue="EXECUTIVE"
//   >
//     <option value="EXECUTIVE">Executive</option>
//     <option value="SECRETARY">Secretary</option>
//   </select>
//   {errors.role && (
//     <FieldError>{errors.role.message}</FieldError>
//   )}
// </Field>
//             </form>
//           </CardContent>

//           <CardFooter className="flex justify-between mt-2">
//             <Button type="button" onClick={() => reset()} className={isDark ? "bg-gray-700 text-white hover:bg-gray-600" : ""}>
//               Reset
//             </Button>
//             <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmit} className={isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white" : ""}>
//               {isSubmit ? <Spinner /> : "Sign Up"}
//             </Button>
//           </CardFooter>

//           <div className="mt-6 text-center">
//             <div className="flex items-center justify-center mb-3">
//               <div className="flex-grow border-t border-gray-600/30"></div>
//               <span className="mx-2 text-gray-300 text-sm">Or continue with</span>
//               <div className="flex-grow border-t border-gray-600/30"></div>
//             </div>
//             <Button
//               onClick={handleGoogleSignIn}
//               className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium ${
//                 isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-800 hover:bg-gray-50"
//               }`}
//             >
//               <img src={googleLogo} alt="Google" className="w-5 h-5" />
//               Sign up with Google
//             </Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
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

// NOTE: logic unchanged — only UI/styling adjusted for a colorful, modern look

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

  // Example inside your Register component
  const onSubmit = async (data) => {
  setBackendError(null);  // Clear previous errors
  setSubmit(true);        // Start loading spinner or disable button

  try {
    // 📨 1. Send registration data to your backend API
    const response = await fetch("http://localhost:5000/api/executive/register", {
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
  } catch (err) {
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
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-6 overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50'}`}>

      {/* Decorative floating shapes */}
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-24 opacity-40 transform rotate-12 blur-3xl w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 to-yellow-300" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-28 opacity-30 transform -rotate-12 blur-2xl w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left panel - colorful welcome */}
        <div className="hidden md:flex flex-col justify-center gap-6 pl-8">
          <div className="max-w-lg">
            <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500">TeamFlow</span>
            </h1>
            <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Create your account and start managing tasks, meetings and time like a pro. Beautiful UI, simple workflow.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 text-white">✓</div>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fast onboarding for executives</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white">✓</div>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Secure authentication with Firebase</span>
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc" alt="illustration" className="rounded-2xl shadow-xl w-full object-cover max-h-80" />
          </div>
        </div>

        {/* Right panel - form card */}
        <div className="flex justify-center px-4 md:px-0">
          <Card className={`w-full max-w-md rounded-3xl p-6 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-2xl" : "bg-white/80 backdrop-blur-md shadow-2xl border border-white/30"}`}>

            {/* top-right theme toggle */}
            <div className="absolute top-4 right-4">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>

            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl`}>Create Account</CardTitle>
              <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Join your team and manage your time efficiently</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel className={isDark ? "text-white" : "text-gray-700"} htmlFor="name">Full Name *</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...register("name")}
                      className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : "bg-white text-gray-900"} pr-10 rounded-lg shadow-sm border-gray-200`}
                    />
                    {errors.name && <FieldError className="text-red-500">{errors.name.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className={isDark ? "text-white" : "text-gray-700"} htmlFor="email">Email *</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : "bg-white text-gray-900"} pr-10 rounded-lg shadow-sm border-gray-200`}
                    />
                    {errors.email && <FieldError className="text-red-500">{errors.email.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className={isDark ? "text-white" : "text-gray-700"} htmlFor="password">Password *</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        className={`${isDark ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500" : "bg-white text-gray-900"} pr-10 rounded-lg shadow-sm border-gray-200`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && <FieldError className="text-red-500">{errors.password.message}</FieldError>}
                  </Field>

                  {backendError && (
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-600 text-sm mt-2 text-center">{backendError}</div>
                  )}

                </FieldGroup>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="button" onClick={() => reset()} className="w-full sm:w-1/2 bg-white/80 text-gray-800 hover:bg-white">Reset</Button>
                  <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmit} className="w-full sm:w-1/2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white">
                    {isSubmit ? <Spinner /> : "Sign Up"}
                  </Button>
                </div>

                <div className="mt-2 text-center text-sm text-gray-400">By signing up you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy</span>.</div>

              </form>

              <div className="mt-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex-grow border-t border-gray-200/40"></div>
                  <span className="mx-2 text-sm text-gray-400">Or continue with</span>
                  <div className="flex-grow border-t border-gray-200/40"></div>
                </div>

             
              </div>

            </CardContent>

            <CardFooter className="mt-4 text-xs text-center text-gray-400">
              Already have an account? <button onClick={() => navigate('/signin')} className="ml-1 font-medium text-indigo-500 underline">Sign in</button>
            </CardFooter>

          </Card>
        </div>

      </div>
    </div>
  );
}
