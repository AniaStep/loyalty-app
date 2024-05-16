import React, {useEffect, useState} from "react";
import { auth } from "../firebase/config";
import { ResponsiveAppBar } from "./header";
import { Dashboard } from "./dashboard";
import { useLocation } from "react-router-dom";
import { PageRefresh } from "../misc/page-refresh";

// Main component for client panel
export const ClientPanel = () => {
    const [clientId, setClientId] = useState(null);
    const location = useLocation();
    const id = location.pathname.split("/")[3];

    // Effect hook to track authentication changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setClientId(user.uid);
                console.log(user.uid)
            } else {
                setClientId(null);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <div className="client-panel">
            {id === clientId ?
            <div>
            <ResponsiveAppBar/>
            <Dashboard/>
            </div>
                :
                <PageRefresh/>
            }
        </div>
    );
};