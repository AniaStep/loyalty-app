import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { PageNotFound } from "../misc/PageNotFound";
import { PasswordResetForm } from "../misc/PasswordResetForm";
import Paper from '@mui/material/Paper';
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';

export const ClientLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isAdminValid, setIsAdminValid] = useState(true);
    const [adminsLogoURL, setAdminsLogoURL] = useState("");


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


    const signUp = async () => {
        if (!isAdminValid) {
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const docRef = await addDoc(clientCollectionRef, {
                email: email,
                adminId: adminId,
                clientId: userCredential.user.uid,
            });
            navigate(`/client/${adminId}/${docRef.id}`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    };

    const signIn = async () => {
        if (!isAdminValid) {
            return;
        }

        try {
            const clientSnapshot = await getDocs(query(clientCollectionRef, where("email", "==", email), where("adminId", "==", adminId)));
            if (clientSnapshot.empty) {
                setError("Podany email nie jest przypisany do konta klienta.");
                return;
            }

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

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            signIn();
        }
    };

    return (
        <div>
            <Paper className="login-form">
                <h1> Logowanie</h1>
                <div className="login-logo">
                    <img src={adminsLogoURL}/>
                </div>
                <TextField className="login-input"
                           placeholder="email"
                           onChange={(e) => setEmail(e.target.value)}
                           onKeyDown={handleKeyPress}/>
                <TextField className="login-input"
                           placeholder="hasło"
                           type="password"
                           onChange={(e) => setPassword(e.target.value)}
                           onKeyDown={handleKeyPress}/>
                <Button variant="contained" onClick={signIn}>Zaloguj się</Button>
                <p onClick={passwordReset} style={{cursor: "pointer", color: "blue"}}>Nie pamiętam hasła</p>
                {error && <p>{error}</p>}
                <p>Nie masz konta? Wypełnij pola i <span onClick={signUp} style={{cursor: "pointer", color: "blue"}}>zarejestruj się</span>
                </p>
            </Paper>
        </div>
    );
}
