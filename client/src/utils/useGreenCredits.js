// src/utils/useGreenCredits.js
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/authSlice";
import { addGreenCredits } from "./CallApi";

const CREDIT_AMOUNTS = {
  buy_resell: 100,
  sell_item:  100,
  donate:     100,
  recycle:     40,
};

export function useGreenCredits() {
  const dispatch = useDispatch();
  const auth     = useSelector((s) => s.auth);
  const user     = auth?.user;
  const token    = auth?.token;

  // meta: { productName, category, size, photoUrl, price }
  const awardCredits = async (activityType, reason, meta = {}) => {
    if (!user || !token) return 0;
    const amount = CREDIT_AMOUNTS[activityType] ?? 50;
    try {
      const data = await addGreenCredits(user.id, amount, reason || activityType, token, activityType, meta);
      dispatch(updateUser({ ...user, greenCredits: data.greenCredits }));
      return amount;
    } catch (err) {
      console.warn("Could not award credits:", err?.response?.data?.error || err.message);
      return 0;
    }
  };

  return { awardCredits, CREDIT_AMOUNTS, user };
}