import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";
import { signup, login } from "../utils/CallApi";

const AuthModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "signup"
        ? await signup({ name, email, password })
        : await login({ email, password });

      dispatch(setAuth({ user: data.user, token: data.token }));
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#131921] px-8 pt-8 pb-6 text-center text-white">
          <img src="../images/amazon.png" alt="Amazon" className="h-8 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-8 py-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="First and last name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E47911] focus:ring-1 focus:ring-[#E47911]"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E47911] focus:ring-1 focus:ring-[#E47911]"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E47911] focus:ring-1 focus:ring-[#E47911]"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold py-2.5 rounded text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By continuing, you agree to Amazon&apos;s{" "}
            <span className="text-[#007185]">Conditions of Use</span> and{" "}
            <span className="text-[#007185]">Privacy Notice</span>.
          </p>
        </form>

        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 text-center">
          {mode === "login" ? (
            <p className="text-sm text-gray-600">
              New to Amazon?{" "}
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-[#007185] font-semibold hover:text-[#E47911] hover:underline"
              >
                Create your Amazon account
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-[#007185] font-semibold hover:text-[#E47911] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
