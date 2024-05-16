import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const PageRefresh= () => {
    const [redirecting, setRedirecting] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const isClient = location.pathname.split("/")[1];
    const adminId = location.pathname.split("/")[2];

    // Effect to set redirection status after a delay
    useEffect(() => {
        const timeout = setTimeout(() => {
            setRedirecting(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", width:"100%", height: "100%"}}>
            {redirecting ? (
                <h1>Odświeżam stronę...</h1>
            ) : (
                isClient === "client" ?
                    navigate(`/client/${adminId}`) :
                    isClient === "admin" ?
                        navigate(`/admin/`) :
                        <h1>Upewnij się, że adres strony jest poprawny.</h1>
            )}
        </div>
    );
};