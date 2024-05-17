import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ResponsiveAppBar } from "./header";
import { Dashboard } from "./dashboard";
import { Clients } from "./clients";
import { Statistics } from "./statistics";
import { PageRefresh } from "../misc/page-refresh";
import { auth } from "../firebase/config";

// Main component for admin panel
export const AdminPanel = () => {
    const location = useLocation();
    const pageId = location.pathname.split("/")[3];
    const id = location.pathname.split("/")[2];
    const [adminId, setAdminId] = useState(null);

    // Effect hook to track authentication changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setAdminId(user.uid);
                console.log(user.uid)
            } else {
                setAdminId(null);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <div className="admin-panel">
            {id === adminId ?
            <div>
            <ResponsiveAppBar/>
            <div>
                {pageId === 'dashboard' && <Dashboard />}
                {pageId === '' && <Dashboard />}
                {pageId === 'statistics' && <Statistics />}
                {pageId === 'clients' && <Clients />}
            </div>
            </div>
                :
                <PageRefresh/>
            }
        </div>
    );
};