import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const MenuSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true, unique: true },
    음식: [MenuItemSchema],
    음료: [MenuItemSchema],
    주류: [MenuItemSchema],
  },
  { collection: "menus" }
); // 컬렉션 이름을 'menus'로 변경

export default mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
