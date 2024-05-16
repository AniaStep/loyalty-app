import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
    collection,
    getDocs,
    query,
    setDoc,
    where
} from "firebase/firestore";
import { db } from "../firebase/config";

export function AccountModal({ open, onClose }) {
    const location = useLocation();
    const adminId=location.pathname.split("/")[2];
    const clientId=location.pathname.split("/")[3];
    const [ profileData, setProfileData ] = useState({
        adminId: '',
        clientId: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        logoURL: '',
        adminName: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
    });

    // Effect to fetch client data when client ID changes
    useEffect(() => {
        const fetchClientData = async () => {
            if (clientId) {
                try {
                    const q = query(collection(db, "clients"), where("adminId", "==", adminId), where("clientId", "==", clientId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const clientData = querySnapshot.docs[0].data();
                        setProfileData({
                            adminId: clientData.adminId,
                            clientId: clientData.clientId,
                            name: clientData.name || '',
                            surname: clientData.surname || '',
                            email: clientData.email || '',
                            phone: clientData.phone || '',
                            logoURL: clientData.logoURL || '',
                            adminName: clientData.adminName || '',
                        });
                    } else {
                        console.log("No matching documents!");
                    }
                } catch (error) {
                    console.error("Error fetching document: ", error);
                }
            }
        };

        fetchClientData();
    }, [adminId, clientId]);

    // Function to handle modal close event
    const handleClose = () => onClose();

    // Function to validate form fields
    const validateFields = () => {
        const errorsCopy = { ...errors };
        let hasError = false;

        if (profileData.name.length < 2) {
            errorsCopy.name = "Imię musi mieć co najmniej 2 znaki.";
            hasError = true;
        } else {
            errorsCopy.name = '';
        }

        if (profileData.surname.length < 2) {
            errorsCopy.surname = "Nazwisko musi mieć co najmniej 2 znaki.";
            hasError = true;
        } else {
            errorsCopy.surname = '';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            errorsCopy.email = "Wprowadź poprawny adres email.";
            hasError = true;
        } else {
            errorsCopy.email = '';
        }

        if (profileData.phone.length !== 9 || isNaN(profileData.phone)) {
            errorsCopy.phone = "Numer telefonu musi zawierać 9 cyfr.";
            hasError = true;
        } else {
            errorsCopy.phone = '';
        }

        setErrors(errorsCopy);
        return !hasError;
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateFields();

        if (isValid) {
            try {
                if (clientId && adminId) {
                    const adminQuery = query(collection(db, "admins"), where("adminId", "==", adminId));
                    const adminSnapshot = await getDocs(adminQuery);

                    if (!adminSnapshot.empty) {
                        const adminData = adminSnapshot.docs[0].data();
                        const adminName = adminData.company;
                        const logoURL = adminData.logoURL;

                        const clientQuery = query(collection(db, "clients"), where("adminId", "==", adminId), where("clientId", "==", clientId));
                        const clientSnapshot = await getDocs(clientQuery);

                        if (!clientSnapshot.empty) {
                            const clientDocRef = clientSnapshot.docs[0].ref;
                            await setDoc(clientDocRef, {
                                name: profileData.name,
                                surname: profileData.surname,
                                email: profileData.email,
                                phone: profileData.phone,
                                adminName: adminName,
                                logoURL: logoURL
                            }, { merge: true });

                            console.log("Document successfully updated!");
                        } else {
                            console.log("No matching documents!");
                        }
                    } else {
                        console.log("Admin document not found!");
                    }
                } else {
                    console.log("Invalid adminId or clientId!");
                }
            } catch (error) {
                console.error("Error updating document: ", error);
            }
            onClose();
        }
    };

    return (
        <div>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={handleClose}
                slots={{ backdrop: StyledBackdrop }}
            >
                <ModalContent sx={{width: "450px", height: "auto", overflow: "auto", backgroundColor: "#e0f0ff"}}>
                    <h2>Dane osobowe</h2>
                    <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                        <TextField
                            label="Imię"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                        <TextField
                            label="Nazwisko"
                            value={profileData.surname}
                            onChange={(e) => setProfileData({ ...profileData, surname: e.target.value })}
                            error={!!errors.surname}
                            helperText={errors.surname}
                            required
                        />
                        <TextField
                            label="Email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                        <TextField
                            label="Telefon"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            required
                        />
                        <Button style={{width: "200px", marginTop: "30px"}} variant="contained" type="submit">Zapisz i
                            zamknij</Button>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}