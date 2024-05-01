import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { PasswordResetForm } from "../misc/PasswordResetForm";

export const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminId, setAdminId] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const errorsPL = {
        'auth/invalid-email': 'Nie wpisano emaila lub email jest niepoprawny.',
        'auth/invalid-credential': 'Email lub hasło jest niepoprawne.',
    };

        const signIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setAdminId(userCredential.user.uid);
            navigate(`/admin/${userCredential.user.uid}`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    }

    const passwordReset = () => {
        navigate("/admin/password-reset");
        return <PasswordResetForm/>
    }

    return (
        <div style={{display: "flex", flexDirection: "column", width: 300, gap: 10}}>
            <h1> Rejestracja / Logowanie Admina</h1>
            <input placeholder="email" onChange={(e) => setEmail(e.target.value)}/>
            <input placeholder="hasło" type="password" onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={signIn}>Zaloguj się</button>
            <p onClick={passwordReset} style={{ cursor: "pointer", color: "blue" }}>Nie pamiętam hasła</p>
            {error && <p>{error}</p>}
        </div>
    )
}
