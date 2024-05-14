import React, {useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import {auth, db} from '../firebase/config';
import {collection, getDocs, query, where} from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export const PasswordResetForm = () => {
    const navigate = useNavigate();
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        try {
            if (email) {
                await sendPasswordResetEmail(auth, email);
                navigate(isClient === "client" ? `/client/${location.pathname.split("/")[2]}/password-reset-info` : "/admin/password-reset-info");
            } else {
                alert('Nie podano adresu email.');
            }
        } catch (error) {
            console.error(error);
            alert('Wystąpił błąd podczas wysyłania emaila resetującego hasło.');
        }
    }

    return(
        <Paper className="login-form">
            <div className="login-logo">
                {isClient === "client" ? <img src={adminsLogoURL}/> : "LoyalApp"}
            </div>
            <h1>Resetowanie hasła</h1>
            <TextField
                name="email"
                className="login-input"
                placeholder="email"
            />
            <Button onClick={(e) => handleSubmit(e)} variant="contained" >Resetuj</Button>
        </Paper>
    )
}
