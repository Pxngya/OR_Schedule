"use client";
import { useState, useEffect } from "react";


export default function PostponeModal({
    isOpen,
    onClose,
    caseItem,
    onSubmit
}: any) {

    const [date, setDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const formatted = today.toLocaleDateString('en-CA'); // ✅ fix timezone
            setDate(formatted);
        }
    }, [isOpen]);

    if (!isOpen || !caseItem) return null;

    const handleConfirm = () => {
        onSubmit(caseItem, date); // date = '' คือยังไม่กำหนด
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[500]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">

                <h2 className="text-xl font-black text-center mb-4">
                    เลื่อนวันผ่าตัด
                </h2>

                <div className="text-center mb-4 font-bold">
                    คุณ {caseItem.name}
                </div>

                {/* 📅 เลือกวัน */}
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-3 w-full rounded-lg mb-4"
                />

                {/* 🔘 ปุ่ม */}
                <div className="flex flex-col gap-2">

                    <button
                        onClick={handleConfirm}
                        className="bg-yellow-400 py-3 rounded-lg font-bold"
                    >
                        ยืนยันเลื่อนวัน
                    </button>

                    <button
                        onClick={() => {
                            onSubmit(caseItem, ''); // 👉 ไม่กำหนดวัน
                            onClose();
                        }}
                        className="bg-gray-200 py-3 rounded-lg font-bold"
                    >
                        ยังไม่กำหนดวัน
                    </button>

                    <button
                        onClick={onClose}
                        className="text-gray-500"
                    >
                        ยกเลิก
                    </button>

                </div>
            </div>
        </div>
    );
}