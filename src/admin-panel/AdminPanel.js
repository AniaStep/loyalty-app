import { useLocation } from "react-router-dom";
import { ResponsiveAppBar } from "./header";
import { Dashboard } from "./Dashboard";
import { Clients } from "./Clients";
import { Statistics } from "./Statistics";
import { PageNotFound } from "../misc/PageNotFound";
import React, {useEffect, useState} from "react";
import {auth} from "../firebase/config";

export const AdminPanel = () => {
    const location = useLocation();
    const pageId = location.pathname.split("/")[3];
    const id = location.pathname.split("/")[2];
    const [adminId, setAdminId] = useState(null);

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
        <>
            {id === adminId ?
            <div>
            <ResponsiveAppBar/>
            <div>
                {pageId === 'dashboard' && <Dashboard />}
                {pageId === 'statistics' && <Statistics />}
                {pageId === 'clients' && <Clients />}
            </div>
            </div>
                :
                <PageNotFound/>
            }
        </>
    );
};
