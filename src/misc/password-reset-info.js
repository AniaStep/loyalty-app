import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { db } from "../firebase/config";
import Paper from '@mui/material/Paper';

// Component for rendering password reset info
export const PasswordResetInfo = () => {
    const location = useLocation();
    const isClient = location.pathname.split("/")[1];
    const adminId = location.pathname.split("/")[2];
    const [ adminsLogoURL, setAdminsLogoURL ] = useState("");

    // Effect to fetch admin data when admin ID changes
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const adminsQuery = query(collection(db, 'admins'), where('adminId', '==', adminId));
                const adminsSnapshot = await getDocs(adminsQuery);
                const adminsData = adminsSnapshot.docs.map(doc => doc.data())[0];

                if (adminsData) {
                    setAdminsLogoURL(adminsData.logoURL);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchAdminData();
    }, [adminId]);

    return(
        <Paper style={{fontSize: "38px", width: "700px", height: "60%", padding: "10px"}}>
            <div className="password-reset-logo">{isClient === "client" ? <img src={adminsLogoURL}/> : ""}</div>
            <p>Wysłaliśmy do Ciebie email.</p>
            <p>Sprawdź swoją skrzynkę pocztową.</p>
        </Paper>
    )
}