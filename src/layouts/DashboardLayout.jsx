
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <main className="dashboard-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
