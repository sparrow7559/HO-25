import mongoose from "mongoose";

const allowedParticipantSchema = new mongoose.Schema({
  TeamID: { type: String, required: true, trim: true }, 
  Name: { type: String, required: true, trim: true }, 
  DelegateID: { type: String, required: true, trim: true }, 
  RegistrationNo: { type: String, required: true, trim: true }, 
  CollegeName: { type: String, required: true, trim: true }, 
  PhoneNumber: { type: String, required: true, trim: true }, 
  EmailID: { type: String, required: true, trim: true }, 
  CategoryName: { type: String, trim: true }, 
  EventName: { type: String, trim: true },
});

export default mongoose.model("AllowedParticipant", allowedParticipantSchema);