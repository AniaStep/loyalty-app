import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';


export function ModalUnstyled(props) {
    const { open, onClose } = props;
    const [newProductData, setNewProductData] = useState({});
    const [errors, setErrors] = useState({});
    const [loyaltyRules, setLoyaltyRules] = useState([]);
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];

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

    const handleFieldChange = (field, value) => {
        setNewProductData(prevState => ({
            ...prevState,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: undefined
            }));
        }
    };

    const handleSaveChanges = async () => {
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

const Backdrop = React.forwardRef((props, ref) => {
    const {open, className, ...other} = props;
    return (
        <div
            className={clsx({'base-Backdrop-open': open}, className)}
            ref={ref}
            {...other}
        />
    );
});

Backdrop.propTypes = {
    className: PropTypes.string.isRequired,
    open: PropTypes.bool,
};

const blue = {
    200: '#99CCFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0066CC',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContent = styled('div')(
    ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 24px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === 'dark' ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `,
);

const TriggerButton = styled('button')(
    ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &:active {
      background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
    }

    &:focus-visible {
      box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
      outline: none;
    }
  `,
);