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
        
        // 🚀 1. เซฟลงเครื่อง (localStorage) เอาไว้ก่อน
        localStorage.setItem('or_user', JSON.stringify(userData)); 

        if (userData.role === 'viewer') {
           // 🚀 2. ถ้าเป็น Viewer สั่งให้หน้าต่างนี้โหลดไปที่หน้า TV ทันที 
           // (ห้ามเรียก setCurrentUser เด็ดขาด ไม่งั้นจะโดน useEffect เตะออกก่อน)
           window.location.href = '?tv=true';
           return; 
        } else {
           // 🚀 3. ถ้าเป็น Admin หรือ User ปกติ ค่อยบอกให้ React รู้ว่าล็อกอินแล้ว
           setCurrentUser(userData); 
        }

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