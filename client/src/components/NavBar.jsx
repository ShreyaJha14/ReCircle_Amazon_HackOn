import { useState } from "react";
import { ShoppingCartIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Search } from "./";
import AuthModal from "./AuthModal";

const NavBar = () => {
  const cart     = useSelector((state) => state.cart.productsNumber);
  const auth     = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const user    = auth?.user;
  const credits = user?.greenCredits ?? 0;

  return (
    <header className="min-w-[1000px]">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <div className="flex bg-amazonclone text-white h-[60px]">
        {/* Left */}
        <div className="flex items-center m-4">
          <Link to="/">
            <img className="h-[35px] w-[100px] m-2" src="../images/amazon.png" alt="Amazon logo" />
          </Link>
          <div className="pr-4 pl-4">
            <div className="text-xs xl:text-sm">Deliver to</div>
            <div className="text-sm xl:text-base font-bold">India</div>
          </div>
        </div>

        {/* Middle */}
        <div className="flex grow relative items-center">
          <Search />
        </div>

        {/* Right */}
        <div className="flex items-center m-4 gap-1">
          {/* Auth area */}
          {user ? (
            <div className="relative pr-4 pl-4">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="text-left hover:text-orange-400 focus:outline-none"
              >
                <div className="text-xs xl:text-sm">Hello, {user.name.split(" ")[0]}</div>
                <div className="text-sm xl:text-base font-bold">Account ▾</div>
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-white text-gray-800 shadow-xl rounded-lg z-50 w-52 py-2"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <Link
                    to="/my-impact"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    🌱 My Impact
                  </Link>
                  <Link
                    to="/donate"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    💚 Donate
                  </Link>
                  <Link
                    to="/sustainability"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    ♻️ Sustainability Hub
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => { dispatch(logout()); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="pr-4 pl-4 hover:text-orange-400 text-left focus:outline-none"
            >
              <div className="text-xs xl:text-sm">Hello, sign in</div>
              <div className="text-sm xl:text-base font-bold">Accounts & Lists</div>
            </button>
          )}

          {/* Green credits badge (when logged in) */}
          {user && (
            <Link to="/my-impact" className="pr-2 pl-2 flex flex-col items-center hover:text-orange-400">
              <span className="text-[10px] text-green-400">🌱 Credits</span>
              <span className="text-sm font-black text-green-400">{credits}</span>
            </Link>
          )}

          <Link to="/recircle">
            <div className="pr-4 pl-4 hover:text-orange-400 cursor-pointer">
              <div className="text-xs xl:text-sm flex items-center gap-1">
                <ArrowPathIcon className="h-3 w-3 xl:h-4 xl:w-4 text-green-400" />
                New
              </div>
              <div className="text-sm xl:text-base text-green-400 font-bold">ReCircle</div>
            </div>
          </Link>

          <Link to="/checkout">
            <div className="flex pr-3 pl-3">
              <ShoppingCartIcon className="h-[48px]" />
              <div className="relative">
                <div className="absolute right-[9px] font-bold m-2 text-orange-400">{cart}</div>
              </div>
              <div className="mt-7 text-xs xl:text-sm font-bold">Cart</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex bg-amazonclone-light_blue text-white space-x-3 text-xs xl:text-sm p-2 pl-6">
        <div>Today's Deals</div>
        <div>Customer Service</div>
        <div>Registry</div>
        <div>Gift Cards</div>
        <div>Sell</div>
        <Link to="/recircle">
          <div className="font-bold text-green-400">ReCircle</div>
        </Link>
        <Link to="/donate">
          <div className="font-bold text-green-400">💚 Donate</div>
        </Link>
        {user && (
          <Link to="/my-impact">
            <div className="font-bold text-green-400">🌱 {credits} Green Credits</div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default NavBar;