import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  size: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Document", documentSchema);
