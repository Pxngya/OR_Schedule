"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmpId, setLoginEmpId] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // โหลด session จาก localStorage
  useEffect(() => {
    const sessionUser = localStorage.getItem("or_user");
    if (sessionUser) setCurrentUser(JSON.parse(sessionUser));
    setIsCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const data = await apiFetch("/api/employees", {
        method: "POST",
        body: JSON.stringify({
          action: "login",
          empId: loginEmpId.trim(),
        }),
      });

      if (data.success) {
        localStorage.setItem("or_user", JSON.stringify(data.data));
        setCurrentUser(data.data);
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError("ระบบขัดข้อง กรุณาลองใหม่");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("or_user");
    setCurrentUser(null);
  };

  return {
    currentUser,
    setCurrentUser,
    loginEmpId,
    setLoginEmpId,
    loginError,
    isCheckingSession,
    handleLogin,
    handleLogout,
  };
}