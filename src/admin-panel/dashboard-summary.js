import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import {
    query,
    where,
    getDocs,
    collection
} from 'firebase/firestore';
import { db } from '../firebase/config';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

// Sub-component of Dashboard component
export const WelcomeInfoCard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [ totalClients, setTotalClients ] = useState(0);
    const [ adminName, setAdminName ] = useState("");
    const [ averageSales, setAverageSales ] = useState(0);
    const [ clientWordForm, setClientWordForm ] = useState("osób");
    const adminId = location.pathname.split("/")[2];

    // Fetching client data from Firestore
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                // Querying admin data
                const adminsQuery = query(collection(db, 'admins'), where('adminId', '==', adminId));
                const adminsSnapshot = await getDocs(adminsQuery);
                const adminData = adminsSnapshot.docs.map(doc => doc.data())[0];

                if (adminData) {
                    setAdminName(adminData.name);
                }

                // Querying client data
                const clientsQuery = query(collection(db, 'clients'), where('adminId', '==', adminId));
                const clientsSnapshot = await getDocs(clientsQuery);
                const totalClientsCount = clientsSnapshot.size;

                let totalSales = 0;
                clientsSnapshot.forEach(clientDoc => {
                    const clientData = clientDoc.data();
                    totalSales += clientData.totalValueNum ?? 0;
                });

                const averageSalesValue = totalClientsCount > 0 ? totalSales / totalClientsCount : 0;
                setAverageSales(averageSalesValue);

                setTotalClients(totalClientsCount);

                // Setting correct form of "osoba" based on the total number of clients
                setClientWordForm(() => {
                    if (totalClientsCount === 1) {
                        return "osoba";
                    } else if (totalClientsCount % 10 === 2 || totalClientsCount % 10 === 3 || totalClientsCount % 10 === 4) {
                        return "osoby";
                    } else {
                        return "osób";
                    }
                });

            } catch (error) {
                console.error(error);
            }
        };

        fetchClientData();
    }, [adminId]);

    // Function to navigate to clients list page
    const goToClients = () => {
        navigate(`/admin/${adminId}/clients`);
    };

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: "30px", paddingRight: "30px", gap: "30px"}}>
                <div>
                    <h1>Aktualności</h1>
                    <p style={{marginTop: "50px"}}>Dzień dobry<span style={{fontWeight: "bold"}}>{adminName ? `, ${adminName}` : ''}</span>! </p>
                    <p>Poniżej znajdziesz kilka danych dotyczących rezultatów Twoich działań.</p>
                    <p>Miłego dnia!</p>
                </div>
                <Paper style={{padding: "20px"}}>
                    <QueryStatsIcon/>
                    <p> W Twoim programie uczestniczy obecnie <span style={{fontWeight: "bold"}}>{totalClients}</span> {clientWordForm}.</p>
                    <p> Średnia wartość zakupów przypadająca na jednego klienta to: <span style={{fontWeight: "bold"}}>{averageSales.toFixed(1)} zł.</span></p>

                </Paper>
            </div>
            <Button variant="contained" onClick={goToClients}> Lista klientów </Button>
        </>
    );
};