import React, {useEffect, useState} from "react";
import { auth } from "../firebase/config";
import { ResponsiveAppBar } from "./header";
import { Dashboard } from "./Dashboard";
import { useLocation } from "react-router-dom";
import { PageNotFound } from "../misc/PageNotFound";


export const ClientPanel = () => {
    const [clientId, setClientId] = useState(null);
    const location = useLocation();
    const id = location.pathname.split("/")[3];

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
        <div>
            {id === clientId ?
            <div>
            <ResponsiveAppBar/>
            <Dashboard/>
            </div>
                :
                <PageNotFound/>
            }
        </div>
    );
};
