const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, ref: "restaurants", required: true },
    tableId: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, default: 0 }, // price를 필수가 아니게 하고 기본값을 0으로 설정
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: "orders" } // Explicitly set the collection name }
);

module.exports = mongoose.model("Order", OrderSchema);
