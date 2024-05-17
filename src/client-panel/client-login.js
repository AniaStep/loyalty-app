import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
    addDoc,
    collection,
    getDocs,
    query, setDoc,
    where
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { PageNotFound } from "../misc/page-not-found";
import { PasswordResetForm } from "../misc/password-reset-form";
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";


// Component for client login
export const ClientLogin = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState(null);
    const [ isAdminValid, setIsAdminValid ] = useState(true);
    const [ adminsLogoURL, setAdminsLogoURL ] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const adminCollectionRef = collection(db, 'admins');
    const clientCollectionRef = collection(db, 'clients');
    const adminId = location.pathname.split("/")[2];

    // Dictionary of errors in Polish
    const errorsPL = {
        'auth/invalid-email': 'Nie wpisano emaila lub email jest niepoprawny.',
        'auth/invalid-credential': 'Email lub hasło jest niepoprawne.',
        'auth/email-already-in-use': 'Podany email istnieje już w systemie. Jeśli nie pamiętasz hasła, zresetuj je.',
        'auth/weak-password': 'Upewnij się, że hasło ma co najmniej 6 znaków.',
    };

    // Effect to check if admin exists in admins collection
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

    //Effect to fetch admins logoURL from admins collection
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

    // Function to sign up a new client
    const signUp = async () => {
        const currentDate = new Date().toISOString();

        if (!isAdminValid) {
            return;
        }
        try {
            const clientsQuery = query(collection(db, 'clients'), where('email', '==', email));
            const clientsSnapshot = await getDocs(clientsQuery);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (!clientsSnapshot.empty) {
                const clientDocRef = clientsSnapshot.docs[0].ref;
                await setDoc(clientDocRef, {
                    email: email,
                    adminId: adminId,
                    clientId: userCredential.user.uid,
                    dateFrom: currentDate,
                }, {merge: true});

            }
            else {
                const docRef = await addDoc(collection(db, 'clients'), {
                    email: email,
                    adminId: adminId,
                    clientId: userCredential.user.uid,
                    dateFrom: currentDate,
                    adminName: "",
                    discount: false,
                    gained: 0,
                    totalPoints: 0,
                    totalValue: "-",
                    totalValueNum: 0,
                });
            }

            navigate(`/client/${adminId}/${userCredential.user.uid}`);
        } catch (err) {
            setError(errorsPL[err.code] || 'Wystąpił błąd podczas logowania.');
            console.error(err);
        }
    };


    // Function to sign in a client
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

    // Function to handle password reset
    const passwordReset = () => {
        navigate(`/client/${adminId}/password-reset`);
        return <PasswordResetForm/>
    }

    // Enabling signing in by using Enter
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
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p>Nie masz konta? Wypełnij powyższe pola i <span onClick={signUp} style={{cursor: "pointer", color: "blue"}}>zarejestruj się</span>
                </p>
            </Paper>
        </div>
    );
}