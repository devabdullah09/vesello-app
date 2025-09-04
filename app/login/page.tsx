"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInUser } from "@/lib/supabase-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await signInUser(email, password);
      router.replace("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center bg-white overflow-hidden">
      {/* Decorative Leaves */}
      <img
        src="/images/login_left.png"
        alt="Leaf left"
        className="absolute left-12 bottom-0 w-64 h-100 md:w-80 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      />
      <img
        src="/images/login_right.png"
        alt="Leaf right"
        className="absolute right-12 bottom-0 w-64 h-67 md:w-80 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      />
      <div className="z-10 w-full max-w-md">
        <Card className="shadow-xl border-none bg-white/95">
          <CardHeader>
            <CardTitle className="text-center text-[1.6rem] font-bold text-gray-900" style={{fontFamily: 'Montserrat, Arial, Helvetica, sans-serif'}}>Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs text-gray-500 hover:text-amber-500 transition-colors">Forgot ?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 focus:outline-none"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.24 19.5 12 19.5c1.658 0 3.237-.335 4.646-.94M6.228 6.228A9.956 9.956 0 0112 4.5c4.76 0 8.774 3.227 10.066 7.499a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.066-.501C19.774 7.227 15.76 4 11.999 4c-1.658 0-3.237.335-4.646.94M17.772 17.772A9.956 9.956 0 0112 19.5c-4.76 0-8.774-3.227-10.066-7.499a10.523 10.523 0 014.293-5.774" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold text-base py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 