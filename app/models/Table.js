import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  id: { type: String, required: true },
  restaurantId: { type: String, required: true },
  name: { type: String, required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
});

export default mongoose.models.Table || mongoose.model("Table", tableSchema);
