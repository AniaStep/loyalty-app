import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from "@mui/material/TextField";
import { PasswordResetForm } from "../misc/password-reset-form";

// Component for administrator login
export const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminId, setAdminId] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Dictionary of errors in Polish
    const errorsPL = {
        'auth/invalid-email': 'Nie wpisano emaila lub email jest niepoprawny.',
        'auth/invalid-credential': 'Email lub hasło jest niepoprawne.',
    };

    // Function for signing in
        const signIn = async () => {
        try {
            const adminsCollectionRef = collection(db, 'admins');
            const adminQuery = query(adminsCollectionRef, where('email', '==', email));
            const adminSnapshot = await getDocs(adminQuery);

            if (adminSnapshot.empty) {
                setError('Podany użytkownik nie istnieje w bazie danych.');
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setAdminId(userCredential.user.uid);
            navigate(`/admin/${userCredential.user.uid}/dashboard`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    }

    // Function for resetting password
    const passwordReset = () => {
        navigate("/admin/password-reset");
        return <PasswordResetForm/>
    }

    // Enabling signing in by using Enter
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            signIn();
        }
    };

    return (
        <Paper className="login-form">
            <h1> Logowanie</h1>
            <TextField className="login-input"
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
            />
            <TextField className="login-input"
                placeholder="hasło"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
            />
            <Button variant="contained" onClick={signIn}>Zaloguj się</Button>
            <p onClick={passwordReset} style={{ cursor: "pointer", color: "blue" }}>Nie pamiętam hasła</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </Paper>
    )
}
