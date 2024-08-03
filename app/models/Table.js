// import mongoose from "mongoose";

// // const tableSchema = new mongoose.Schema({
// //   id: { type: String, required: true },
// //   restaurantId: { type: String, required: true },
// //   name: { type: String, required: true },
// //   x: { type: Number, default: 0 },
// //   y: { type: Number, default: 0 },
// // });

// const tableSchema = new mongoose.Schema({
//   id: { type: Number, required: true, unique: true },
//   restaurantId: { type: String },
//   tableId: { type: Number, required: true },
//   x: { type: Number, default: 0 },
//   y: { type: Number, default: 0 },
//   width: { type: Number, default: 100 },
//   height: { type: Number, default: 100 },
//   rotation: { type: Number, default: 0 },
//   status: { type: String, default: "empty" },
// });

// export default mongoose.models.Table || mongoose.model("Table", tableSchema);

import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true },
    tableId: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    status: { type: String, default: "empty" },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { _id: false }
); // MongoDB가 자동으로 _id 필드를 생성하지 않도록 설정

TableSchema.index({ restaurantId: 1, tableId: 1 }, { unique: true });

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
