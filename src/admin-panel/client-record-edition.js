import React, { useState } from 'react';
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import {
    updateDoc,
    query,
    where,
    getDocs,
    collection,
    deleteDoc,
    addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { BasicSelectClientForm } from "./select";


export function ClientRecordEditionModal(props) {
    const { open, onClose, selectedClient } = props;
    const [ selectedOption, setSelectedOption ] = useState('');
    const [ updatedClientData, setUpdatedClientData ] = useState({});
    const [ errors, setErrors ] = React.useState({});
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];
    const currentDate = new Date().toISOString();

    // Effect hook to update client data
    React.useEffect(() => {
        setUpdatedClientData(selectedClient);
        resetChanges();
    }, [selectedClient]);

    // Function to reset form changes
    const resetChanges = () => {
        setSelectedOption('');
        setUpdatedClientData(prevState => ({
            ...prevState,
            value: '',
            pointsGranted: '',
            pointsUsed: ''
        }));
        setErrors({});
    };

    // Function to handle field change
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

        const newErrors = {};

        if (!updatedClientData.name || updatedClientData.name.length < 2) {
            newErrors.name = "Imię musi zawierać co najmniej 2 znaki.";
        }
        if (!updatedClientData.surname || updatedClientData.surname.length < 2) {
            newErrors.surname = "Nazwisko musi zawierać co najmniej 2 znaki.";
        }

        if (field === 'pointsGranted' || field === 'pointsUsed' || field === 'value') {
            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                newErrors[field] = "Wartość musi być liczbą większą od zera.";
            } else {
                delete newErrors[field];
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    };

    // Function to handle saving changes
    const handleSaveChanges = async () => {
        try {
            if (updatedClientData.email !== selectedClient.email) {
                const existingClientQuery = query(collection(db, 'clients'), where('email', '==', updatedClientData.email), where('adminId', '==', adminId));
                const existingClientSnapshot = await getDocs(existingClientQuery);

                if (!existingClientSnapshot.empty) {
                    existingClientSnapshot.forEach(doc => {

                        if (doc.id !== selectedClient.clientId) {
                            setErrors(prevErrors => ({
                                ...prevErrors,
                                email: 'Podany email już istnieje w bazie danych.'
                            }));
                            return;
                        }
                    });
                    return;
                }
            }
            const newId = uuidv4();
            const clientsQuery = query(collection(db, 'clients'), where('email', '==', selectedClient.email), where('adminId', '==', selectedClient.adminId));
            const querySnapshot = await getDocs(clientsQuery);
            const historyQuery = query(collection(db, 'history'), where('email', '==', selectedClient.email), where('adminId', '==', selectedClient.adminId));
            const historyQuerySnapshot = await getDocs(historyQuery);
            const loyaltyRulesQuery = query(collection(db, 'loyaltyRules'), where('adminId', '==', selectedClient.adminId));
            const loyaltyRulesQuerySnapshot = await getDocs(loyaltyRulesQuery);
            const loyaltyRulesData = loyaltyRulesQuerySnapshot.docs[0].data();


            querySnapshot.forEach(async (doc) => {
                try {
                    await updateDoc(doc.ref, updatedClientData);

                    if (updatedClientData.value > 0) {
                        const lastShopping = currentDate;
                        if (lastShopping) {
                            await updateDoc(doc.ref, {lastShopping: lastShopping});
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            if (selectedOption === 'Chcę dodać dodatkowe punkty' || selectedOption === 'Chcę dodać punkty za zakupy' || selectedOption === 'Chcę odjąć wykorzystane punkty') {
                let totalPointsGranted = 0;
                let totalPointsUsed = 0;
                let totalValue = 0;

                historyQuerySnapshot.forEach((doc) => {
                    const data = doc.data();
                    totalPointsGranted += data.pointsGranted || 0;
                    totalPointsUsed += data.pointsUsed || 0;
                    totalValue += parseInt(data.value) || 0;
                });
                const pointsGranted = (selectedOption === 'Chcę dodać punkty za zakupy' && loyaltyRulesData.value1 > 0 ) ? (parseInt(updatedClientData.value) / loyaltyRulesData.value1 * loyaltyRulesData.points1) : (parseInt(updatedClientData.pointsGranted) || 0);
                const pointsUsed = parseInt(updatedClientData.pointsUsed) || 0;
                const newTotalPoints = totalPointsGranted + pointsGranted - totalPointsUsed - pointsUsed;
                const value = parseInt(updatedClientData.value) || 0;
                const newTotalValue = totalValue + value;

                querySnapshot.forEach(async (doc) => {

                    try {
                        await updateDoc(doc.ref, { totalPoints: newTotalPoints });
                        await updateDoc(doc.ref, { totalValue: newTotalValue + " PLN"});
                        await updateDoc(doc.ref, { totalValueNum: newTotalValue });
                        await updateDoc(doc.ref,{ gained: (loyaltyRulesData.points2 > 0) ? (newTotalPoints / loyaltyRulesData.points2 * loyaltyRulesData.value2) : 0 })
                        await updateDoc(doc.ref,{ discount: (newTotalValue >= loyaltyRulesData.value3) ? true : false })
                    } catch (err) {
                        console.error(err);
                    }
                });

                const newHistoryRecord = {
                    id: newId,
                    date: currentDate,
                    email: selectedClient.email,
                    adminId: adminId,
                    pointsGranted: pointsGranted,
                    value: value,
                    pointsUsed: pointsUsed,
                    points: newTotalPoints,
                };

                await addDoc(collection(db, 'history'), newHistoryRecord);
            }

        } catch (err) {
            console.error(err);
        }
        onClose()
    };

    // Function to handle deleting a client
    const handleDeleteClient = async (clientId) => {
        try {
            const confirmation = window.confirm("Czy na pewno chcesz usunąć tego klienta?");

            if (confirmation) {
                const clientsQuery = query(collection(db, 'clients'), where('email', '==', selectedClient.email));
                const querySnapshot = await getDocs(clientsQuery);

                querySnapshot.forEach(async (doc) => {
                    try {
                        await deleteDoc(doc.ref);
                        onClose()
                    } catch (err) {
                        console.error(err);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Function to handle change in the select dropdown
    const handleSelectChange = (option) => {
        setSelectedOption(option);
    };

    // Function to reset the form fields and close the modal
    const resetForm = () => {
        resetChanges();
        onClose();
    };

    return (
        <div>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={resetForm}
                slots={{ backdrop: StyledBackdrop }}
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
                        <h1>Edycja danych Klienta</h1>
                        <TextField required error={!!errors.name} helperText={errors.name} label="Imię" defaultValue={selectedClient ? selectedClient.name : ''} onChange={(e) => handleFieldChange('name', e.target.value)}/>
                        <TextField required error={!!errors.surname} helperText={errors.surname} label="Nazwisko" defaultValue={selectedClient ? selectedClient.surname : ''} onChange={(e) => handleFieldChange('surname', e.target.value)}/>
                        <TextField required error={!!errors.email} helperText={errors.email} label="Email" defaultValue={selectedClient ? selectedClient.email : ''} onChange={(e) => handleFieldChange('email', e.target.value)}/>

                        <BasicSelectClientForm onChange={handleSelectChange} />
                        {selectedOption === 'Chcę dodać punkty za zakupy' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: "415px",
                            }}>
                                <TextField style={{width: "292px"}} label="Wartość wydanych zakupów" error={!!errors.value} helperText={errors.value} onChange={(e) => handleFieldChange('value', e.target.value)}/>
                                <div>PLN</div>
                            </div>
                        )}
                        {selectedOption === 'Chcę dodać dodatkowe punkty' && (
                            <TextField label="Liczba punktów do dodania" error={!!errors.pointsGranted} helperText={errors.pointsGranted} onChange={(e) => handleFieldChange('pointsGranted', e.target.value)}/>
                        )}
                        {selectedOption === 'Chcę odjąć wykorzystane punkty' && (
                            <TextField label="Liczba punktów do odjęcia" error={!!errors.pointsUsed} helperText={errors.pointsUsed} onChange={(e) => handleFieldChange('pointsUsed', e.target.value)}/>
                        )}

                    </Box>
                    <div style={{
                        display: 'flex',
                        gap: 5,
                        justifyContent: 'center',
                        marginTop: "15px",
                        marginBottom: "25px"
                    }}>

                        <Button variant="contained" onClick={handleSaveChanges}>Aktualizuj</Button>
                        <Button variant="contained" startIcon={<DeleteIcon/>} onClick={() => handleDeleteClient(selectedClient.clientId)}>Usuń klienta</Button>
                        <Button variant="contained" onClick={onClose}>Anuluj</Button>

                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}