import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: Number }, // Optional for restaurants without tables
  orderNumber: { type: Number }, // For restaurants without tables
  items: [OrderItemSchema],
  queuePosition: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "preparing", "served", "completed"],
    default: "pending",
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const restaurant = await mongoose
      .model("Restaurant")
      .findOne({ restaurantId: this.restaurantId });

    if (restaurant.hasTables) {
      const lastOrder = await this.constructor
        .findOne({
          restaurantId: this.restaurantId,
          status: { $in: ["pending", "preparing"] },
        })
        .sort("-queuePosition");
      this.queuePosition = lastOrder ? lastOrder.queuePosition + 1 : 1;
    } else {
      const lastOrder = await this.constructor
        .findOne({ restaurantId: this.restaurantId })
        .sort("-orderNumber");
      this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
    }
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");
