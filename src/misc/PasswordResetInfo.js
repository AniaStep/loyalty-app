import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config";

export const PasswordResetInfo = () => {

    const location = useLocation();
    const isClient = location.pathname.split("/")[1];
    const adminId = location.pathname.split("/")[2];
    const [adminsLogoURL, setAdminsLogoURL] = useState("");

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
        <>
            <div>{isClient === "client" ? <img src={adminsLogoURL}/> : "LoyalApp"}</div>
            <h1>Sprawdź email</h1>
        </>
    )
}
