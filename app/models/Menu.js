import mongoose from "mongoose";

// MenuItemSchema with custom id field
const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom ID field
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
});

// MenuSchema with dynamic categories
const MenuSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true, unique: true },
    categories: [
      {
        name: { type: String, required: true },
        items: [MenuItemSchema],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
