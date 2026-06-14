// src/utils/useGreenCredits.js
// Hook to award green credits and show a toast notification

import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/authSlice";
import { addGreenCredits } from "./CallApi";

const CREDIT_AMOUNTS = {
  buy_resell:  100,  // buying from ReCircle P2P marketplace
  sell_item:   100,  // listing / selling a pre-owned item
  donate:      75,   // donating a returned item
  recycle:     40,   // recycling
};

export function useGreenCredits() {
  const dispatch = useDispatch();
  const auth     = useSelector((s) => s.auth);
  const user     = auth?.user;
  const token    = auth?.token;

  const awardCredits = async (activityType, reason) => {
    if (!user || !token) return 0;

    const amount = CREDIT_AMOUNTS[activityType] ?? 50;

    try {
      const data = await addGreenCredits(user.id, amount, reason || activityType, token);
      dispatch(updateUser({ ...user, greenCredits: data.greenCredits }));
      return amount;
    } catch (err) {
      console.warn("Could not award credits:", err?.response?.data?.error || err.message);
      return 0;
    }
  };

  return { awardCredits, CREDIT_AMOUNTS, user };
}
