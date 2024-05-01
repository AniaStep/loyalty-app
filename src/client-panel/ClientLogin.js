import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { PageNotFound } from "../misc/PageNotFound";
import { PasswordResetForm } from "../misc/PasswordResetForm";

export const ClientLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isAdminValid, setIsAdminValid] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const adminCollectionRef = collection(db, 'admins');
    const clientCollectionRef = collection(db, 'clients');
    const adminId = location.pathname.split("/")[2];

    const errorsPL = {
        'auth/invalid-email': 'Nie wpisano emaila lub email jest niepoprawny.',
        'auth/invalid-credential': 'Email lub hasło jest niepoprawne.',
        'auth/email-already-in-use': 'Podany email istnieje już w systemie. Jeśli nie pamiętasz hasła, zresetuj je.',
        'auth/weak-password': 'Upewnij się, że hasło ma co najmniej 6 znaków.',
    };

    useEffect(() => {
        const checkAdminValidity = async () => {
            try {
                const adminSnapshot = await getDocs(query(adminCollectionRef, where("adminId", "==", adminId)));
                if (adminSnapshot.empty) {
                    setIsAdminValid(false);
                }
            } catch (err) {
                console.error("Error checking admin validity:", err);
                setIsAdminValid(false);
            }
        };

        checkAdminValidity();
    }, [adminCollectionRef, adminId]);

    const SignUp = async () => {
        if (!isAdminValid) {
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const docRef = await addDoc(clientCollectionRef, {
                email: email,
                adminId: adminId,
                clientId: userCredential.user.uid, // Use userCredential to access the user's UID
            });
            navigate(`/client/${adminId}/${docRef.id}`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    };

    const SignIn = async () => {
        if (!isAdminValid) {
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            navigate(`/client/${adminId}/${userCredential.user.uid}`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    };


    if (!isAdminValid) {
        return <PageNotFound />;
    }

    const passwordReset = () => {
        navigate(`/client/${adminId}/password-reset`);
        return <PasswordResetForm/>
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", width: 300, gap: 10 }}>
            <h1> Rejestracja / Logowanie Klienta</h1>
            <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="hasło" type="password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={SignUp}>Zarejestruj się</button>
            <button onClick={SignIn}>Zaloguj się</button>
            <p onClick={passwordReset} style={{ cursor: "pointer", color: "pink" }}>Nie pamiętam hasła</p>
            {error && <p>{error}</p>}
        </div>
    );
}
