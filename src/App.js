import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./firebase/AuthProvider";
import { LandingPage } from "./landing-page/LandingPage";
import { AdminLogin } from "./admin-panel/AdminLogin";
import { AdminPanel } from "./admin-panel/AdminPanel";
import { ClientLogin } from "./client-panel/ClientLogin";
import { ClientPanel } from "./client-panel/ClientPanel";
import { PageNotFound } from "./misc/PageNotFound";
import { PasswordResetForm } from "./misc/PasswordResetForm";
import { PasswordResetInfo} from "./misc/PasswordResetInfo";

function App() {
  const user = useAuth();
  console.log(user);
  return (
      <Router>
        <div className="App">
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
