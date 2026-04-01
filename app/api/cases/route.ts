import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Case from '@/models/Case';

export const dynamic = 'force-dynamic';

// ❌ ลบฟังก์ชัน sendLineMessage ออกไปแล้ว เพื่อให้ Frontend จัดการเรื่องแจ้งเตือนฝ่ายเดียว

// ================= GET =================
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const monthYear = searchParams.get('monthYear');

    let query: any = {};

    if (date && monthYear) {
      query.date = parseInt(date);
      query.monthYear = monthYear;
    }

    const cases = await Case.find(query).lean();

    return NextResponse.json({ success: true, data: cases });

  } catch (error: any) {
    console.error('GET ERROR:', error);

    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ================= POST =================
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { actionBy, ...caseData } = body;

    const newCase = await Case.create(caseData);

    // ❌ ลบคำสั่ง sendLineMessage ตรงนี้ออกแล้ว

    return NextResponse.json({ success: true, data: newCase });

  } catch (error: any) {
    console.error('POST ERROR:', error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ================= PUT =================
export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { _id, actionBy, ...updateData } = body;

    const updatedCase = await Case.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedCase) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }

    // ❌ ลบคำสั่ง sendLineMessage('[อัปเดต]...') ตรงนี้ออกแล้ว (ตัวการที่เด้งซ้อน)

    return NextResponse.json({ success: true, data: updatedCase });

  } catch (error: any) {
    console.error('PUT ERROR:', error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing ID' },
        { status: 400 }
      );
    }

    await Case.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('DELETE ERROR:', error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}