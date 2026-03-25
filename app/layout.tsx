import { Prompt } from "next/font/google";
import "./globals.css";

// โหลดฟอนต์และกำหนดค่าน้ำหนักให้ครบ เพื่อความสวยงาม
const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"],
});

export const metadata = {
  title: "ตารางผ่าตัด โรงพยาบาลกรุงเทพอุดร",
  description: "ระบบตารางแผนกผ่าตัด",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* ใช้ prompt.className เพื่อบังคับฟอนต์ลงใน body โดยตรงเลย! */}
      <body className={`${prompt.className} bg-or-bg text-or-text antialiased`}>
        {children}
      </body>
    </html>
  );
}