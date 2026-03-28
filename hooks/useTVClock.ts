"use client";
import { useState, useEffect } from "react";

export const useTVClock = (isTVMode: boolean) => {
  const [currentTimeText, setCurrentTimeText] = useState("");
  const [currentMinsFromMidnight, setCurrentMinsFromMidnight] = useState(0);

  useEffect(() => {
    if (!isTVMode) return;

    const updateClock = () => {
      const now = new Date();

      setCurrentTimeText(
        now.toLocaleTimeString("th-TH", { hour12: false })
      );

      setCurrentMinsFromMidnight(
        now.getHours() * 60 + now.getMinutes()
      );
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [isTVMode]);

  return {
    currentTimeText,
    currentMinsFromMidnight,
  };
};