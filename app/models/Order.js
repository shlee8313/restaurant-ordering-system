import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true },
    tableId: { type: String, required: true },
    items: [
      {
        // 수정: menuItem을 참조하도록 변경
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "preparing", "completed", "canceled"],
      default: "pending",
    },
    // 추가: 총 주문 금액 필드
    totalAmount: { type: Number, required: true },
    // 추가: 주문 메모 필드
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
