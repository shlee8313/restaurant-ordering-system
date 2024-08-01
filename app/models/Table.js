import mongoose from "mongoose";

// const tableSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   restaurantId: { type: String, required: true },
//   name: { type: String, required: true },
//   x: { type: Number, default: 0 },
//   y: { type: Number, default: 0 },
// });

const tableSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  restaurantId: { type: String },
  tableId: { type: Number, required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  rotation: { type: Number, default: 0 },
  status: { type: String, default: "empty" },
});

export default mongoose.models.Table || mongoose.model("Table", tableSchema);
