import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from '../firebase/config';
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Paper from '@mui/material/Paper';

// Component for rendering password reset form
export const PasswordResetForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isClient = location.pathname.split("/")[1];
    const adminId = location.pathname.split("/")[2];
    const [ adminsLogoURL, setAdminsLogoURL ] = useState("");
    const [ error, setError ] = useState("");

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

    // Object for mapping Firebase error codes to Polish error messages
    const errorsPL = {
        'auth/invalid-email': 'Nie wpisano emaila lub email jest niepoprawny.',
        'auth/invalid-credential': 'Nie wpisano emaila lub email jest niepoprawny.',
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;

        try {
            if (email) {
                if (isClient === "client") {
                    const clientsCollectionRef = collection(db, 'clients');
                    const clientQuery = query(clientsCollectionRef, where('email', '==', email), where('adminId', '==', adminId));
                    const clientSnapshot = await getDocs(clientQuery);

                    if (clientSnapshot.empty) {
                        setError('Podany użytkownik nie istnieje w bazie danych.');
                        return;
                    }
                } else {
                    const adminsCollectionRef = collection(db, 'admins');
                    const adminQuery = query(adminsCollectionRef, where('email', '==', email));
                    const adminSnapshot = await getDocs(adminQuery);

                    if (adminSnapshot.empty) {
                        setError('Podany użytkownik nie istnieje w bazie danych.');
                        return;
                    }
                }

                await sendPasswordResetEmail(auth, email);
                navigate(isClient === "client" ? `/client/${adminId}/password-reset-info` : "/admin/password-reset-info");
            } else {
                setError(errorsPL['auth/invalid-email']);
            }
        } catch (error) {
            console.error(error);
            setError(errorsPL[error.code] || 'Wystąpił błąd podczas wysyłania emaila resetującego hasło.');
        }
    }

    return(
        <Paper className="login-form">
            <div className="login-logo">
                {isClient === "client" ? <img src={adminsLogoURL}/> : ""}
            </div>
            <h1>Resetowanie hasła</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <TextField
                    name="email"
                    className="login-input"
                    placeholder="email"
                />
                <button className="password-reset-button">Resetuj</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </Paper>
    )
}