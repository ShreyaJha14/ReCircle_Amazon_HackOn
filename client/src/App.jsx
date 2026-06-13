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
  PreventionPage,
  SustainabilityPage,
  ReturnedProductsPage,
} from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ReCircleLayout />}>
          <Route path="/recircle" element={<ReCirclePage />} />
          <Route path="/recircle/returns-today" element={<ReturnedProductsPage />} />
          <Route path="/ai-grading" element={<AIGradingPage />} />
          <Route path="/routing" element={<RoutingPage />} />
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/prevention" element={<PreventionPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
        </Route>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
