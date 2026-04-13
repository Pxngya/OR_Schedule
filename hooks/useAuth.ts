"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const ENABLE_VIEWER_TV_REDIRECT = false;

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
    setLoginError('');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ action: 'login', empId: loginEmpId.trim() })
      });

      const data = await res.json();

      if (data.success) {
        const userData = { ...data.data, sessionToken: data.sessionToken };

        localStorage.setItem('or_user', JSON.stringify(userData));

        // ✅ 👇 พับ logic viewer ไว้
        if (ENABLE_VIEWER_TV_REDIRECT && userData.role === 'viewer') {
          window.location.href = '?tv=true';
          return;
        }

        // ✅ ทุก role เข้า normal flow
        setCurrentUser(userData);

      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError('ระบบขัดข้อง กรุณาลองใหม่');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("or_user");
    setCurrentUser(null);
    setLoginEmpId('');


    window.location.replace('/');

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