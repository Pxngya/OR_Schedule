import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = body.events;

    if (events && events.length > 0) {
      for (const event of events) {
        // ดักจับเวลามีคนพิมพ์ข้อความในกลุ่ม หรือดึงบอทเข้ากลุ่ม
        if (event.source && event.source.type === 'group') {
          console.log('🎉 เจอรหัสกลุ่มแล้ว (Group ID):', event.source.groupId);
        }
      }
    }
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}