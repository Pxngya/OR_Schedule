import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Employee from '@/models/Employee';

// 🛑 คำสั่งไม้ตาย: บังคับห้าม Next.js จำข้อมูลเก่าเด็ดขาด! ดึงสดใหม่เสมอ!
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { action, id, empId, name, role } = body;

  if (action === 'login') {
    const count = await Employee.countDocuments();
    if (count === 0 && empId === 'admin') {
      const newAdmin = await Employee.create({ empId: 'admin', name: 'ผู้ดูแลระบบ', role: 'admin' });
      return NextResponse.json({ success: true, data: newAdmin });
    }
    
    const user = await Employee.findOne({ empId });
    if (user) {
      return NextResponse.json({ success: true, data: user });
    } else {
      return NextResponse.json({ success: false, message: 'รหัสพนักงานไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าใช้งาน' }, { status: 401 });
    }
  }

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