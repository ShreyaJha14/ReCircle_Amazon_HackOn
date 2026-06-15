import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  HomePage,
  NavBar,
  Checkout,
  SearchResults,
  ProductPage,
  ReCircleLayout,
} from "./components";
import {
  ReCirclePage,
  AIGradingPage,
  RoutingPage,
  PassportPage,
  PassportCreatePage,
  PassportPreviewPage,
  PreventionPage,
  SustainabilityPage,
  ResellProductsPage,
  SellPage,
  BuyPage,
} from "./pages";
import MyImpactPage from "./pages/MyImpactPage";
import DonatePage from "./pages/DonatePage";

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ReCircleLayout />}>
          <Route path="/recircle" element={<ReCirclePage />} />
          <Route path="/recircle/resale" element={<ResellProductsPage />} />
          <Route path="/recircle/sell" element={<SellPage />} />
          <Route path="/recircle/buy" element={<BuyPage />} />
          <Route path="/ai-grading" element={<AIGradingPage />} />
          <Route path="/routing" element={<RoutingPage />} />
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/passport/create" element={<PassportCreatePage />} />
          <Route path="/passport/preview/:passportId" element={<PassportPreviewPage />} />
          <Route path="/prevention" element={<PreventionPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/my-impact" element={<MyImpactPage />} />
          <Route path="/donate" element={<DonatePage />} />
        </Route>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
