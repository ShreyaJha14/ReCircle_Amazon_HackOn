// UPDATED: src/utils/CallApi.js
// Drop this into your frontend to connect to the ReCircle backend.

import axios from "axios";
import { BASE_URL } from "./constants";

const config = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// ── Generic helpers ───────────────────────────────────────────────────────────
export const callAPI = async (resource) => {
  const { data } = await axios.get(`${BASE_URL}/${resource}`, config);
  return data;
};

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) =>
  axios.get(`${BASE_URL}/products`, { ...config, params }).then((r) => r.data);

export const getProduct = (id) =>
  axios.get(`${BASE_URL}/products/${id}`, config).then((r) => r.data);

export const searchProducts = (q) =>
  axios.get(`${BASE_URL}/products/search`, { ...config, params: { q } }).then((r) => r.data);

// ── AI Grading ────────────────────────────────────────────────────────────────
// Usage: pass a FormData with photo, productName, category
export const gradeItem = (formData) =>
  axios
    .post(`${BASE_URL}/grading/grade`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const getGradedItem = (itemId) =>
  axios.get(`${BASE_URL}/grading/items/${itemId}`, config).then((r) => r.data);

export const listRecentItems = (limit = 20) =>
  axios.get(`${BASE_URL}/grading/items`, { ...config, params: { limit } }).then((r) => r.data);

// ── Smart Routing ─────────────────────────────────────────────────────────────
export const routeItem = (payload) =>
  axios.post(`${BASE_URL}/routing/decide`, payload, config).then((r) => r.data);

export const getRoutingMetrics = () =>
  axios.get(`${BASE_URL}/routing/metrics`, config).then((r) => r.data);

// ── Product Passport ──────────────────────────────────────────────────────────
export const createPassport = (payload) =>
  axios.post(`${BASE_URL}/passport/create`, payload, config).then((r) => r.data);

export const getPassport = (passportId) =>
  axios.get(`${BASE_URL}/passport/${passportId}`, config).then((r) => r.data);

// ── Return Prevention ─────────────────────────────────────────────────────────
export const predictReturnRisk = (payload) =>
  axios.post(`${BASE_URL}/prevention/predict`, payload, config).then((r) => r.data);

export const askAssistant = (message, conversationHistory = [], itemContext = null) =>
  axios
    .post(`${BASE_URL}/prevention/assistant`, { message, conversationHistory, itemContext }, config)
    .then((r) => r.data);

export const suggestPrice = (payload) =>
  axios.post(`${BASE_URL}/prevention/price`, payload, config).then((r) => r.data);

export const getPreventionMetrics = () =>
  axios.get(`${BASE_URL}/prevention/metrics`, config).then((r) => r.data);

// ── Sustainability ────────────────────────────────────────────────────────────
export const getSustainabilityDashboard = () =>
  axios.get(`${BASE_URL}/sustainability/dashboard`, config).then((r) => r.data);

// ── Marketplace Listings ──────────────────────────────────────────────────────
export const getListings = (params = {}) =>
  axios.get(`${BASE_URL}/listings`, { ...config, params }).then((r) => r.data);

export const createListing = (payload) =>
  axios.post(`${BASE_URL}/listings`, payload, config).then((r) => r.data);

export const getNearbyMatches = (params = {}) =>
  axios.get(`${BASE_URL}/listings/nearby`, { ...config, params }).then((r) => r.data);
