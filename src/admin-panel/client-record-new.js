import React, { useEffect, useState } from "react";
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from "react-router-dom";


export function ClientRecordNewModal(props) {
    const { open, onClose, selectedClient } = props;
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];
    const [updatedClientData, setUpdatedClientData] = useState({});
    const [errors, setErrors] = useState({});

    // Function handling field changes
    const handleFieldChange = (field, value) => {

        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: undefined
            }));
        }

        setUpdatedClientData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    // Function handling saving changes
    const handleSaveChanges = async () => {
        const adminId = location.pathname.split("/")[2];
        const currentDate = new Date().toISOString();

        // Validation
        const newErrors = {};

        if (!updatedClientData.name || updatedClientData.name.length < 2) {
            newErrors.name = "Imię musi zawierać co najmniej 2 znaki.";
        }
        if (!updatedClientData.surname || updatedClientData.surname.length < 2) {
            newErrors.surname = "Nazwisko musi zawierać co najmniej 2 znaki.";
        }
        if (!updatedClientData.email.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}\b/)) {
            newErrors.email = "Email musi być poprawny (np. example@example.com).";
        } else {
            try {
                const emailExistsQuery = query(collection(db, 'clients'), where('email', '==', updatedClientData.email), where('adminId', '==', adminId));
                const emailExistsSnapshot = await getDocs(emailExistsQuery);
                if (!emailExistsSnapshot.empty) {
                    newErrors.email = "Podany adres e-mail już istnieje.";
                }
            } catch (error) {
                console.error("Error checking email existence: ", error);
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Adding a new client
        const newClientData = {
            name: updatedClientData.name,
            surname: updatedClientData.surname,
            email: updatedClientData.email,
            adminId: adminId,
            clientId: "n/a",
            clientRef: 'n/a',
            discount: false,
            gained: 0,
            dateFrom: selectedClient ? selectedClient.dateFrom : currentDate,
            totalPoints: 0,
            totalValue: `${0} PLN`
        };

        try {
            const newClientRef = await addDoc(collection(db, 'clients'), newClientData);
            const newClientId = newClientRef.id;

            fetchData();
            onClose()
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    // Function fetching data
    const fetchData = async () => {
        try {
            if (adminId) {
                const querySnapshot = await getDocs(collection(db, "clients"));
                const clients = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.adminId === adminId) {
                        clients.push({ ...data });
                    }
                });

                const sortedClients = clients.sort((a, b) => (a.surname > b.surname) ? 1 : ((b.surname > a.surname) ? -1 : 0));

                sortedClients.forEach((client, index) => {
                    client.id = index + 1;
                });
            }

        } catch (err) {
            console.error(err);
        }
    };

    // Effect fetching data on adminId change
    useEffect(() => {
        fetchData();
    }, [adminId]);


    return (
        <div>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={onClose}
                slots={{ backdrop: StyledBackdrop }}
                selectedClient={selectedClient}
            >
                <ModalContent sx={{width: 500, height: 'auto'}}>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': {m: 1, width: '400px'},
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <h1>Nowy Klient</h1>
                        <TextField required error={!!errors.name} helperText={errors.name} label="Imię" onChange={(e) => handleFieldChange('name', e.target.value)}/>
                        <TextField required error={!!errors.surname} helperText={errors.surname} label="Nazwisko" onChange={(e) => handleFieldChange('surname', e.target.value)}/>
                        <TextField required error={!!errors.email} helperText={errors.email} label="Email" onChange={(e) => handleFieldChange('email', e.target.value)}/>

                    </Box>
                    <div style={{
                        display: 'flex',
                        gap: 5,
                        justifyContent: 'center',
                        marginTop: "15px",
                        marginBottom: "25px"
                    }}>
                        <Button variant="contained" onClick={handleSaveChanges}>Dodaj</Button>
                        <Button variant="contained" onClick={onClose}>Anuluj</Button>

                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}