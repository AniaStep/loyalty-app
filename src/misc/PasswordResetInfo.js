import React from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

export const PasswordResetInfo = () => {

    const location = useLocation();
    const isClient = location.pathname.split("/")[1];
    return(
        <div className={isClient === "client" ? "Client-style" : "App"}>
            <h1>Sprawdź email</h1>
        </div>
    )
}
