import React, {useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { ResponsiveAppBar } from "./header";

export const ClientPanel = () => {
    const [clientId, setClientId] = useState(null);
    const [clientList, setClientList] = useState([]);
    const location = useLocation();

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
            <ResponsiveAppBar/>


            {clientList.map((client) => (
                <div key={client.id}>
                    <h1>To jest panel klienta: {client.email}</h1>
                </div>
            ))}
        </div>
    );
};
