import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  date: { type: Number, required: true }, 
  monthYear: { type: String, required: true }, 
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
  status: { 
    type: String, 
    enum: ['ยืนยัน', 'เลื่อนวัน', 'ยกเลิก'], 
    default: 'ยืนยัน' 
  }
}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);