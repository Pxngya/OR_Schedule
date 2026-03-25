import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // รับเรื่องไว้เฉยๆ ไม่ต้องส่งข้อความตอบกลับแล้ว
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}