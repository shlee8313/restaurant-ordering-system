import mongoose from "mongoose";

// MenuItemSchema with custom id field
const MenuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Custom ID field
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    restaurantId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
