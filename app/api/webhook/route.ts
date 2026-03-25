import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ฟังก์ชันรับข้อมูลจาก LINE (LINE จะบังคับส่งแบบ POST)
export async function POST(req: Request) {
  try {
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      if (body.events && body.events.length > 0) {
        for (const event of body.events) {
          if (event.source && event.source.type === 'group') {
            console.log('🎉 เจอรหัสกลุ่มแล้ว (Group ID):', event.source.groupId);
          }
        }
      }
    }
    // LINE ต้องการแค่คำตอบรับว่า 200 OK ห้ามตอบอย่างอื่นเด็ดขาด
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    // ถึงโค้ดจะพัง ก็ต้องบอก LINE ว่า 200 OK ไม่งั้นไลน์จะขึ้น Error 405/500
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}

// เผื่อไว้ทดสอบว่าลิงก์ทำงานไหม (เปิดผ่านเบราว์เซอร์ได้)
export async function GET() {
  return NextResponse.json({ message: 'สายลับ Webhook พร้อมทำงาน!' }, { status: 200 });
}