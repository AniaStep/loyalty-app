import React, {useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore"

export const ClientPanel = () => {
    const [clientId, setClientId] = useState(null);
    const [clientList, setClientList] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];

    const logout = async () => {
        try {
            await signOut(auth);
            navigate(`/client/${adminId}`);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "clients"));
                const clients = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.clientId === clientId) {
                        clients.push({ id: doc.id, ...data });
                    }
                });
                setClientList(clients);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [clientId]);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setClientId(user.uid);
                console.log(user.uid)
            } else {
                setClientId(null);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <div>
            {clientList.map((client) => (
                <div key={client.id}>
                    <h1>To jest panel klienta: {client.email}</h1>
                </div>
            ))}
            <button onClick={logout}>Sign Out</button>
        </div>
    );
};
