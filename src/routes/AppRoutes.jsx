import { Routes, Route, Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Signup from "../pages/auth/Signup";
import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import "./AppRoutes.css";

function PagePlaceholder({ title, description }) {
  return (
    <section className="route-placeholder">
      <div className="route-placeholder__content">
        <p className="route-placeholder__eyebrow">Zafar Law Chamber</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link to="/" className="route-placeholder__link">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <PagePlaceholder
      title="Page Not Found"
      description="The page you are looking for does not exist."
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element= {<Home />}
        />
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/services"
          element={<Services />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        <Route
          path="/login"
          element={<Login/>}
        />
        <Route
          path="/signup"
          element={<Signup/>}
        />
      </Route>
            
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>
        
      <Route element={<ProtectedRoute allowedRole="client" />}>
        <Route
          path="/client/dashboard"
          element={<ClientDashboard />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
}

export default AppRoutes;
