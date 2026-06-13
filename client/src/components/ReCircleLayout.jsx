import { Outlet } from "react-router-dom";
import ReCircleNavBar from "./ReCircleNavBar";

const ReCircleLayout = () => {
  return (
    <div>
      <ReCircleNavBar />
      <Outlet />
    </div>
  );
};

export default ReCircleLayout;
