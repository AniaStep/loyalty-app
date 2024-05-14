import React, {useEffect, useState} from "react";
import { auth } from "../firebase/config";
import { ResponsiveAppBar } from "./header";
import {Dashboard} from "./Dashboard";

export const ClientPanel = () => {
    const [clientId, setClientId] = useState(null);


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
        <>
            <ResponsiveAppBar/>
            <Dashboard/>
        </>
    );
};
