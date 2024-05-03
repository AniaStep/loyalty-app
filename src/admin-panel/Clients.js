import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from '../firebase/config';


export const Clients = () => {
    const [adminId, setAdminId] = useState(null);
    const [clientList, setClientList] = useState([]);
    const location = useLocation();
    const pageId = location.pathname.split("/")[3];


    const deleteClient = async (clientId) => {
        try {
            await deleteDoc(doc(db, "clients", clientId));
            setClientList(clientList.filter(client => client.id !== clientId));
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
                    if (data.adminId === adminId) {
                        clients.push({ id: doc.id, ...data });
                    }
                });
                setClientList(clients);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [adminId]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setAdminId(user.uid);
                console.log(user.uid)
            } else {
                setAdminId(null);
            }
        });
        return unsubscribe;
    }, []);

    return (<div>
        <h1>Klienci</h1>
        {clientList.map(client => (
            <div key={client.id} style={{ display: "flex", gap: 10, height: 20, alignItems: "center" }}>
                <button onClick={() => deleteClient(client.id)}> Delete</button>
                <p>{client.email}</p>
            </div>
        ))}
    </div>
    );
};
