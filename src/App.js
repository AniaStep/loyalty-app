import React from "react";
import "./app.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./firebase/auth-provider";
import { LandingPage } from "./landing-page/landing-page";
import { AdminLogin } from "./admin-panel/admin-login";
import { AdminPanel } from "./admin-panel/admin-panel";
import { ClientLogin } from "./client-panel/client-login";
import { ClientPanel } from "./client-panel/client-panel";
import { PageNotFound } from "./misc/page-not-found";
import { PasswordResetForm } from "./misc/password-reset-form";
import { PasswordResetInfo} from "./misc/password-reset-info";

function App() {
  const user = useAuth();
  console.log(user);

  return (
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/:adminId" element={<AdminPanel />} />
            <Route path="/admin/:adminId/dashboard" element={<AdminPanel />} />
            <Route path="/admin/:adminId/clients" element={<AdminPanel />} />
            <Route path="/admin/:adminId/statistics" element={<AdminPanel />} />
            <Route path="/client/:adminId/" element={<ClientLogin />} />
            <Route path="/client/:adminId/:clientId" element={<ClientPanel />} />
            <Route path="/admin/password-reset" element={<PasswordResetForm />} />
            <Route path="/client/:adminId/password-reset" element={<PasswordResetForm />} />
            <Route path="/admin/password-reset-info" element={<PasswordResetInfo />} />
            <Route path="/client/:adminId/password-reset-info" element={<PasswordResetInfo />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
