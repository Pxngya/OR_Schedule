import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  date: Number,
  monthYear: String,
  time: String,
  room: String,
  hn: String,
  name: String,
  age: String,
  operation: String,
  surgeon: String,
  team: String,
  specialEquipment: String,
  typeOfAnesth: String,
  anesthesiologist: String,
  dateOfBooking: String,
  timeReceiveSet: String,
  booker: String,
  receiver: String,
  remarks: String,
  status: { type: String, default: '' },

  // 🚀 ฟิลด์ใหม่ที่เพิ่งเพิ่มเข้ามา (สำคัญมาก!)
  patientStatus: { type: String, default: '' }, // เก็บสถานะจุดสี In OR, Recovery
  isNurseLog: { type: Boolean, default: false }, // ตัวแยกสมุดพยาบาล
  inc: { type: String, default: '' },
  call: { type: String, default: '' },
  b: { type: String, default: '' },
  bd: { type: String, default: '' },
  anesthIn: { type: String, default: '' },
  anesthOut: { type: String, default: '' },

}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);