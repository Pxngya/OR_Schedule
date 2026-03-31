import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ================= ฟังก์ชันส่ง LINE =================
async function sendLineMessage(textMessage: string) {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const groupId = process.env.LINE_GROUP_ID;

    // 1. เช็คว่าลืมใส่ ENV หรือเปล่า
    if (!token || !groupId) {
      console.error('❌ LINE Error: ลืมตั้งค่า LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_GROUP_ID ในไฟล์ .env.local');
      return false;
    }

    // 2. ยิง API ไปที่ LINE
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

    // 3. เช็คผลลัพธ์จาก LINE เผื่อมี Error
    const responseData = await response.json().catch(() => null);
    
    if (!response.ok) {
      console.error('❌ LINE API Error:', response.status, responseData);
      return false;
    }

    console.log('✅ ส่งแจ้งเตือน LINE สำเร็จ!');
    return true;

  } catch (error) {
    console.error('❌ Line Request Error:', error);
    return false;
  }
}

// ================= ตัวรับคำสั่งจากหน้าเว็บ (Frontend) =================
export async function POST(req: Request) {
  try {
    // 1. แกะกล่องข้อมูลที่หน้าเว็บส่งมาให้
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'ไม่มีข้อความส่งมา' }, { status: 400 });
    }

    // 2. สั่งให้ฟังก์ชันส่ง LINE ทำงาน
    const isSuccess = await sendLineMessage(message);

    if (isSuccess) {
      return NextResponse.json({ success: true, message: 'ส่งแจ้งเตือนเรียบร้อย' });
    } else {
      return NextResponse.json({ success: false, error: 'ส่ง LINE ไม่สำเร็จ ดู log ใน Terminal' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Webhook POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}