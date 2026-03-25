import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (body.events && body.events.length > 0) {
        for (const event of body.events) {
          // ถ้ามีคนพิมพ์ข้อความในกลุ่ม
          if (event.source && event.source.type === 'group' && event.type === 'message') {
            const groupId = event.source.groupId;
            const replyToken = event.replyToken;

            // สั่งให้บอทตอบกลับในกลุ่มทันทีว่ารหัสอะไร!
            if (token && replyToken) {
               await fetch('https://api.line.me/v2/bot/message/reply', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    replyToken: replyToken,
                    messages: [{ type: 'text', text: `🔑 รหัสกลุ่มของคุณคือ:\n${groupId}` }]
                  })
               });
            }
          }
        }
      }
    }
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'สายลับ Webhook พร้อมทำงาน!' }, { status: 200 });
}