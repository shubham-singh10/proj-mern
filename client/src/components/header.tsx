import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Plus, Home, LogIn, UserPlus, Menu, X, LogOut, Shield } from "lucide-react";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        setMobileMenuOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <header className="bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white font-bold text-xl hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="hidden sm:inline">QA Community</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/")
                                ? "bg-white/20 text-white"
                                : "text-white/80 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <Home size={18} />
                            <span>Questions</span>
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/ask"
                                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-md"
                                >
                                    <Plus size={18} />
                                    <span>Ask Question</span>
                                </Link>

                                {userRole === "manager" && (
                                    <Link
                                        to="/manager"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/manager")
                                            ? "bg-white/20 text-white"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <Shield size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/login")
                                        ? "bg-white/20 text-white"
                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    <LogIn size={18} />
                                    <span>Login</span>
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-md"
                                >
                                    <UserPlus size={18} />
                                    <span>Register</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/20">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <Home size={20} />
                                <span>Questions</span>
                            </Link>

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        to="/ask"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-all"
                                    >
                                        <Plus size={20} />
                                        <span>Ask Question</span>
                                    </Link>

                                    {userRole === "manager" && (
                                        <Link
                                            to="/manager"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/manager")
                                                ? "bg-white/20 text-white"
                                                : "text-white/80 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <Shield size={20} />
                                            <span>Dashboard</span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 text-white/80 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-left"
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/login")
                                            ? "bg-white/20 text-white"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <LogIn size={20} />
                                        <span>Login</span>
                                    </Link>

                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-all"
                                    >
                                        <UserPlus size={20} />
                                        <span>Register</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}