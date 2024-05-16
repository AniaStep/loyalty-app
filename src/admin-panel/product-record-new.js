import React, { useState, useEffect } from 'react';
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

export function ProductRecordNewModal(props) {
    const { open, onClose } = props;
    const [ newProductData, setNewProductData ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ loyaltyRules, setLoyaltyRules ] = useState([]);
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];

    useEffect(() => {
        // Fetch loyalty rules from the database based on the admin ID
        const fetchLoyaltyRules = async () => {
            try {
                const q = query(collection(db, 'loyaltyRules'), where("adminId", "==", adminId));
                const querySnapshot = await getDocs(q);
                const fetchedRules = [];
                querySnapshot.forEach((doc) => {
                    fetchedRules.push(doc.data());
                });
                setLoyaltyRules(fetchedRules);
            } catch (error) {
                console.error("Error fetching loyalty rules: ", error);
            }
        };

        fetchLoyaltyRules();
    }, [adminId]);

    // Update newProductData state with the changed field and value
    const handleFieldChange = (field, value) => {
        setNewProductData(prevState => ({
            ...prevState,
            [field]: value
        }));

        // Clear the error message for the field if it exists
        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: undefined
            }));
        }
    };

    // Function to handle saving a new product data
    const handleSaveChanges = async () => {

        // Validation
        const newErrors = {};

        if (!newProductData.name || newProductData.name.length < 2) {
            newErrors.name = "Nazwa musi zawierać co najmniej 2 znaki.";
        }
        if (!newProductData.priceRegular || isNaN(parseFloat(newProductData.priceRegular)) || parseFloat(newProductData.priceRegular) <= 0) {
            newErrors.priceRegular = "Wartość musi być liczbą większą od zera.";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const percentage3 = loyaltyRules.length > 0 ? loyaltyRules[0].percentage3 : 0;
            const newId = uuidv4();

            await addDoc(collection(db, 'products'), {
                ...newProductData,
                adminId: adminId,
                priceReduced: newProductData.priceRegular - (newProductData.priceRegular * percentage3/100),
                productId: newId
            });
            onClose();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <div>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={onClose}
                slots={{ backdrop: StyledBackdrop }}
            >
                <ModalContent sx={{ width: 500, height: 'auto' }}>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '400px' },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <h1>Nowy Produkt</h1>
                        <TextField
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                            label="Produkt"
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                        <TextField
                            required
                            error={!!errors.priceRegular}
                            helperText={errors.priceRegular}
                            label="Cena regularna"
                            type="number"
                            onChange={(e) => handleFieldChange('priceRegular', e.target.value)}
                        />
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