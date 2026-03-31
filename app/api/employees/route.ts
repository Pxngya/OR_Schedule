import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Employee from '@/models/Employee';
import crypto from 'crypto'; // 🚀 เพิ่มโมดูลสร้างรหัสสุ่ม

// 🛑 คำสั่งไม้ตาย: บังคับห้าม Next.js จำข้อมูลเก่าเด็ดขาด! ดึงสดใหม่เสมอ!
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { action, id, empId, name, role, sessionToken } = body;

  // ==========================================
  // 1. ระบบล็อกอิน (สร้าง Token ใหม่ทุกครั้งที่ล็อกอิน)
  // ==========================================
  if (action === 'login') {
    const count = await Employee.countDocuments();
    const newToken = crypto.randomUUID(); // 🚀 สร้างรหัสเซสชันใหม่

    // กรณีไม่มีพนักงานเลยและล็อกอินด้วย admin
    if (count === 0 && empId === 'admin') {
      const newAdmin = await Employee.create({ empId: 'admin', name: 'ผู้ดูแลระบบ', role: 'admin', sessionToken: newToken });
      return NextResponse.json({ success: true, data: newAdmin, sessionToken: newToken });
    }
    
    const user = await Employee.findOne({ empId });
    if (user) {
      // 🚀 เจอผู้ใช้ ให้เซฟ Token ใหม่ลงฐานข้อมูล (เตะเครื่องเก่าออกทางอ้อม)
      const updatedUser = await Employee.findOneAndUpdate(
        { empId },
        { sessionToken: newToken },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedUser, sessionToken: newToken });
    } else {
      return NextResponse.json({ success: false, message: 'รหัสพนักงานไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าใช้งาน' }, { status: 401 });
    }
  }

  // ==========================================
  // 2. 🚀 ระบบเช็คเซสชัน (หน้าเว็บจะแอบยิงมาถามเงียบๆ)
  // ==========================================
  if (action === 'check_session') {
    const user = await Employee.findOne({ empId });
    // ถ้ารหัสเซสชันที่หน้าเว็บส่งมา ตรงกับในฐานข้อมูล แปลว่ายังเป็นเครื่องล่าสุด
    if (user && user.sessionToken === sessionToken) {
      return NextResponse.json({ success: true, valid: true });
    } else {
      // ถ้าไม่ตรง แปลว่ามีคนไปล็อกอินเครื่องอื่นแล้ว!
      return NextResponse.json({ success: true, valid: false });
    }
  }

  // ==========================================
  // 3. ระบบจัดการพนักงานปกติ (เพิ่ม/แก้ไข)
  // ==========================================
  if (action === 'add') {
    try {
      const newUser = await Employee.create({ empId, name: name || 'ไม่ระบุชื่อ', role: role || 'user' });
      return NextResponse.json({ success: true, data: newUser });
    } catch (error) {
      return NextResponse.json({ success: false, message: 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }
  }

  if (action === 'edit') {
    try {
      const updatedUser = await Employee.findByIdAndUpdate(
        id, 
        { empId, name: name || 'ไม่ระบุชื่อ', role: role || 'user' },
        { new: true } // ให้ส่งข้อมูลใหม่ล่าสุดกลับมา
      );
      if (updatedUser) {
        return NextResponse.json({ success: true, data: updatedUser });
      } else {
        return NextResponse.json({ success: false, message: 'ไม่พบพนักงานนี้ในระบบ' }, { status: 404 });
      }
    } catch (error) {
      return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด หรือคุณกำลังตั้งรหัสพนักงานซ้ำกับคนอื่น' }, { status: 400 });
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
}

export async function GET() {
  await connectToDatabase();
  const users = await Employee.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: users });
}

export async function DELETE(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const deleteId = url.searchParams.get('id');
  await Employee.findByIdAndDelete(deleteId);
  return NextResponse.json({ success: true });
}