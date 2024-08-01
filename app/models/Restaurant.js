import mongoose from "mongoose";
import bcrypt from "bcrypt";

const restaurantSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    restaurantId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    businessNumber: { type: String, required: true },
    operatingHours: { type: String, required: true },
    tables: { type: Number, required: true },
    // 추가: orders 필드로 Order 모델과의 관계 설정
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    // 추가: 메뉴 아이템 필드
    // menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
  },
  { timestamps: true }
);

restaurantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

restaurantSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
