import React, { useEffect, useState }  from 'react';
import { useLocation } from "react-router-dom";
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
    setDoc,
    query,
    collection,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

export function ProductRecordEditionModal(props) {
    const { open, onClose, selectedProduct } = props;
    const [ updatedProductData, setUpdatedProductData ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ loyaltyRules, setLoyaltyRules ] = useState([]);
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];

    // Effect hook to update product data when selected product changes
   useEffect(() => {
        setUpdatedProductData(selectedProduct);
        resetChanges();
    }, [selectedProduct]);

    // Function to clear error messages stored in the component state
    const resetChanges = () => {
        setErrors({});
    };

    // Effect hook to fetch loyalty rules based on adminId
    useEffect(() => {
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

    // Function to handle field change
    const handleFieldChange = (field, value) => {
        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: undefined
            }));
        }
        setUpdatedProductData(prevState => ({
            ...prevState,
            [field]: value,
             }));

        const newErrors = {};

        if (!value || value.length < 2) {
            newErrors[field] = "Pole musi zawierać co najmniej 2 znaki.";
        }

        if (field === 'priceRegular') {
            if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                newErrors[field] = "Wartość musi być liczbą większą od zera.";
            } else {
                delete newErrors[field];
            }
        }

        setErrors(newErrors);
    };

    // Function to handle save changes
    const handleSaveChanges = async () => {
        // Validation
        const newErrors = {};

        if (!updatedProductData.name || updatedProductData.name.length < 2) {
            newErrors.name = "Nazwa musi zawierać co najmniej 2 znaki.";
        }
        if (!updatedProductData.priceRegular || isNaN(parseFloat(updatedProductData.priceRegular)) || parseFloat(updatedProductData.priceRegular) <= 0) {
            newErrors.priceRegular = "Wartość musi być liczbą większą od zera.";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const q = query(collection(db, "products"), where("adminId", "==", adminId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const productDocRef = querySnapshot.docs[0].ref;
            const percentage3 = loyaltyRules.length > 0 ? loyaltyRules[0].percentage3 : 0;
            await setDoc(productDocRef, {
                productId: selectedProduct.productId,
                name: updatedProductData.name,
                priceRegular: updatedProductData.priceRegular,
                priceReduced: updatedProductData.priceRegular - (updatedProductData.priceRegular * percentage3 / 100),
            }, {merge: true});
            onClose();
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
                        <h1>Edycja danych</h1>
                        <TextField
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                            label="Produkt"
                            value={updatedProductData ? updatedProductData.name : ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                        <TextField
                            required
                            error={!!errors.priceRegular}
                            helperText={errors.priceRegular}
                            label="Cena regularna"
                            value={updatedProductData && updatedProductData.priceRegular ? updatedProductData.priceRegular : ''}
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
                        <Button variant="contained" onClick={handleSaveChanges}>Aktualizuj</Button>
                        <Button variant="contained" onClick={onClose}>Anuluj</Button>

                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}