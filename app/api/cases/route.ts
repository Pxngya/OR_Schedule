import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Case from '@/models/Case';

export const dynamic = 'force-dynamic';

// --- ฟังก์ชันยิงแจ้งเตือนเข้ากลุ่มไลน์ ---
async function sendLineMessage(textMessage: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID; 

  if (!token || !groupId) {
    console.log('❌ ขาด Token หรือ Group ID ใน Environment Variables');
    return; 
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: 'text', text: textMessage }]
      })
    });
    
    const result = await response.json();
    console.log('🟢 Line Notification Status:', response.status, result);
  } catch (error) {
    console.error('🔴 Line Bot Error:', error);
  }
}

export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const monthYear = searchParams.get('monthYear');

  let query: any = {};
  if (date && monthYear) {
    query.date = parseInt(date);
    query.monthYear = monthYear;
  }

  try {
    const cases = await Case.find(query);
    return NextResponse.json({ success: true, data: cases });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { actionBy, ...caseData } = body; 
    const newCase = await Case.create(caseData);
    
    // แจ้งเตือนเมื่อเพิ่มเคส
    const msg = `🟢 [เพิ่มคิวผ่าตัดใหม่]\nผู้ทำรายการ: ${actionBy || 'ไม่ระบุชื่อ'}\n\n📅 วันที่: ${newCase.date} ${newCase.monthYear}\n⏰ เวลา: ${newCase.time} น.\n🚪 ห้อง: ${newCase.room}\n👤 คนไข้: ${newCase.name}\n🔪 Operation: ${newCase.operation}`;
    await sendLineMessage(msg);

    return NextResponse.json({ success: true, data: newCase });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { _id, actionBy, ...updateData } = body;
    const updatedCase = await Case.findByIdAndUpdate(_id, updateData, { new: true });
    
    // แจ้งเตือนเมื่อแก้ไขข้อมูล
    const msg = `🟡 [อัปเดตข้อมูลคิว]\nผู้ทำรายการ: ${actionBy || 'ไม่ระบุชื่อ'}\n\n👤 คนไข้: ${updatedCase.name}\n⏰ เวลา: ${updatedCase.time} น. (ห้อง ${updatedCase.room})\n⚠️ สถานะ: ${updatedCase.status}`;
    await sendLineMessage(msg);

    return NextResponse.json({ success: true, data: updatedCase });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const actionBy = searchParams.get('actionBy');
    const patientName = searchParams.get('name');
    
    if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });
    
    await Case.findByIdAndDelete(id);

    // แจ้งเตือนเมื่อมีการลบ
    const msg = `🔴 [ลบรายการผ่าตัด]\nผู้ลบรายการ: ${actionBy || 'ไม่ระบุชื่อ'}\n\nลบข้อมูลคนไข้ชื่อ: ${patientName || 'ไม่ทราบชื่อ'}`;
    await sendLineMessage(msg);

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}