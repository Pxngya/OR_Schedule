import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, default: 'ไม่ระบุชื่อ' }, // ปรับไม่ให้มันตึงเกินไป
  
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user'
  },
  
  // 🚀 เพิ่มฟิลด์ sessionToken สำหรับเก็บรหัสล็อกอิน เพื่อเช็คการล็อกอินซ้อน (1 ไอดี 1 เครื่อง)
  sessionToken: { type: String, default: '' }
  
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);