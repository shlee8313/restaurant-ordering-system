import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "preparing", "served", "completed"],
    default: "pending",
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");
