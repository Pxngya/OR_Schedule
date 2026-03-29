import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, default: 'ไม่ระบุชื่อ' }, // ปรับไม่ให้มันตึงเกินไป
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user'
  }
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);