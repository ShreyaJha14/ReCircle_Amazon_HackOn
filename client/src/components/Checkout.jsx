import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ProductDetails } from "./";
import { GB_CURRENCY } from "../utils/constants";
import {
  removeFromCart,
  decrementInCart,
  incrementInCart,
} from "../redux/cartSlice";
import { updateUser } from "../redux/authSlice";
import { redeemGreenCredits } from "../utils/CallApi";
import CartHealthDashboard from "./CartHealthDashboard";

const Checkout = () => {
  const products = useSelector((state) => state.cart.products);
  const itemsNumber = useSelector((state) => state.cart.productsNumber);
  const subtotal = useSelector((state) =>
    state.cart.products.reduce(
      (subtotal, product) => subtotal + product.price * product.quantity,
      0
    )
  );
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const token = auth?.token;
  const availableCredits = user?.greenCredits ?? 0;

  const [useCredits, setUseCredits] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const dispatch = useDispatch();

  // Discount = 10% of available credits, capped at the subtotal
  const discount = useCredits ? Math.min(availableCredits * 0.1, subtotal) : 0;
  // Credits to deduct = discount / 0.1 (i.e. the credits actually used)
  const creditsToDeduct = useCredits ? Math.round(discount / 0.1) : 0;
  const finalBill = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (!user || !token) return;
    setIsProcessing(true);
    try {
      if (useCredits && creditsToDeduct > 0) {
        try {
          const data = await redeemGreenCredits(user.id, creditsToDeduct, token);
          dispatch(updateUser({ ...user, greenCredits: data.greenCredits }));
        } catch {
          // Fallback: deduct locally if API fails
          dispatch(updateUser({ ...user, greenCredits: Math.max(0, availableCredits - creditsToDeduct) }));
        }
      }
      setOrderPlaced(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazonclone-background">
      <div className="min-w-[1000px] max-w-[1500px] m-auto pt-8 pb-16 px-4">
        <div className="grid grid-cols-8 gap-10">
          {/* Products */}
          <div className="col-span-6">
            <div className="bg-white rounded">
              <div className="text-2xl xl:text-3xl m-4">Shopping Cart</div>
              {products.map((product) => {
                return (
                  <div key={product.id}>
                    <div className="grid grid-cols-12 divide-y divide-gray-400 mr-4">
                      <div className="col-span-10 grid grid-cols-8 divide-y divide-gray-400">
                        <div className="col-span-2">
                          <Link to={`/product/${product.id}`}>
                            <img
                              className="p-4 m-auto"
                              src={product.image_small}
                              alt="Checkout product"
                            />
                          </Link>
                        </div>
                        <div className="col-span-6">
                          <div className="font-medium text-black mt-2">
                            <Link to={`/product/${product.id}`}>
                              <ProductDetails product={product} ratings={false} />
                            </Link>
                          </div>
                          <div>
                            <button
                              className="text-sm xl:text-base font-semibold rounded text-blue-500 mt-2 mb-1 cursor-pointer"
                              onClick={() => dispatch(removeFromCart(product.id))}
                            >
                              Delete
                            </button>
                          </div>
                          <div className="grid grid-cols-3 w-20 text-center">
                            <div
                              className="text-xl xl:text-2xl bg-gray-400 rounded cursor-pointer"
                              onClick={() =>
                                dispatch(decrementInCart(product.id))
                              }
                            >
                              -
                            </div>
                            <div className="text-lg xl:text-xl bg-gray-200">
                              {product.quantity}
                            </div>
                            <div
                              className="text-xl xl:text-2xl bg-gray-400 rounded cursor-pointer"
                              onClick={() =>
                                dispatch(incrementInCart(product.id))
                              }
                            >
                              +
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-lg xl:text-xl mt-2 mr-4 font-semibold">
                          {GB_CURRENCY.format(product.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-lg xl:text-xl text-right mb-4 mr-4">
                Subtotal ({itemsNumber} items):{" "}
                <span className="font-semibold">
                  {GB_CURRENCY.format(subtotal)}
                </span>
              </div>
            </div>

            {/* AI Cart Health Dashboard */}
            <CartHealthDashboard />
          </div>

          {/* Checkout */}
          <div className="col-span-2 bg-white rounded p-7" style={{ height: "auto" }}>
            <div className="text-xs xl:text-sm text-green-800 mb-2">
              Your order qualifies for{" "}
              <span className="font-bold">FREE DELIVERY</span>. Delivery Details
            </div>

            <div className="text-base xl:text-lg mb-2">
              Subtotal ({itemsNumber} items):{" "}
              <span className="font-semibold">
                {GB_CURRENCY.format(subtotal)}
              </span>
            </div>

            {/* Green Credits toggle — only show if user has credits */}
            {user && availableCredits > 0 && (
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="accent-green-600"
                  />
                  <span className="text-green-700 font-semibold">
                    Use Green Credits
                  </span>
                </label>
                {useCredits && (
                  <div className="mt-1 text-xs text-gray-600">
                    {availableCredits} credits × 10% ={" "}
                    <span className="font-semibold text-green-700">
                      {GB_CURRENCY.format(discount)} off
                    </span>{" "}
                    ({creditsToDeduct} credits will be deducted)
                  </div>
                )}
              </div>
            )}

            {/* Discount line */}
            {useCredits && discount > 0 && (
              <div className="flex justify-between text-sm text-green-700 mb-1">
                <span>🌱 Green Credits Discount</span>
                <span>− {GB_CURRENCY.format(discount)}</span>
              </div>
            )}

            {/* Final bill */}
            <div className={`text-base xl:text-lg font-semibold mb-4 ${useCredits && discount > 0 ? "text-green-700" : ""}`}>
              Total: {GB_CURRENCY.format(finalBill)}
            </div>

            {orderPlaced ? (
              <div className="text-green-700 font-semibold text-sm text-center">
                ✅ Order placed!{useCredits && creditsToDeduct > 0 ? ` ${creditsToDeduct} credits deducted.` : ""}
              </div>
            ) : (
              <button
                className="btn"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;