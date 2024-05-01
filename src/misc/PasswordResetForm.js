import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase/config';
import "../App.css";

export const PasswordResetForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isClient = location.pathname.split("/")[1];


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
        <div className={isClient === "client" ? "Client-style" : "App"}>
            <h1>Resetowanie hasła</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input name="email"/><br/><br/>
                <button>Resetuj</button>
            </form>
        </div>
    )
}
