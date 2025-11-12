import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import API from "../services/api";
import axios from "axios";
import { useAuth } from "../context/authContext";

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "employee" | "manager" | "admin";
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setError,
    } = useForm<RegisterFormData>({
        defaultValues: {
            role: "employee",
        },
    });

    const password = watch("password");

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = data;
            // console.log("Register Data: ", registerData);
            // Replace with your actual API call
            const result = await API.post("/auth/register", {
                name: registerData.name,
                email: registerData.email,
                password: registerData.password,
                role: registerData.role,
            });
            const response = result.data;
            login(response.user);
            if (response.user.role === "manager") {
                navigate("/manager")
            } else if (response.user.role === "admin") {
                navigate("/admin")
            } else {
                // Redirect to employee page
                navigate("/employee");

            }
        } catch (error: unknown) {

            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.message || "Something went wrong";
                setError("root", { message: serverMessage });
            } else {
                // Other errors
                setError("root", { message: "Something went wrong" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our community and start asking questions
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters",
                                        },
                                    })}
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: "Password must contain uppercase, lowercase, and number",
                                        },
                                    })}
                                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) =>
                                            value === password || "Passwords do not match",
                                    })}
                                    className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="relative">
                                    <input
                                        type="radio"
                                        value="employee"
                                        {...register("role")}
                                        className="peer sr-only"
                                    />
                                    <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all hover:border-indigo-400">
                                        <User className="h-6 w-6 text-gray-600 peer-checked:text-indigo-600" />
                                        <span className="mt-2 text-sm font-medium text-gray-700">Employee</span>
                                    </div>
                                </label>

                                <label className="relative">
                                    <input
                                        type="radio"
                                        value="manager"
                                        {...register("role")}
                                        className="peer sr-only"
                                    />
                                    <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all hover:border-indigo-400">
                                        <Shield className="h-6 w-6 text-gray-600 peer-checked:text-indigo-600" />
                                        <span className="mt-2 text-sm font-medium text-gray-700">Manager</span>
                                    </div>
                                </label>
                                <label className="relative">
                                    <input
                                        type="radio"
                                        value="admin"
                                        {...register("role")}
                                        className="peer sr-only"
                                    />
                                    <div className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all hover:border-indigo-400">
                                        <UserPlus className="h-6 w-6 text-gray-600 peer-checked:text-indigo-600" />
                                        <span className="mt-2 text-sm font-medium text-gray-700">Admin</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Root Error */}
                        {errors.root && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{errors.root.message}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-5 w-5" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/"
                                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}