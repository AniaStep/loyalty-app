import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {collection, getDocs, query, setDoc, where} from "firebase/firestore";
import {db} from "../firebase/config";
import { useLocation } from "react-router-dom";

export function ModalUnstyled({ open, onClose }) {
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

    const handleClose = () => onClose();

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
                <ModalContent sx={{width: "450px", height: "auto", overflow: "auto"}}>
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
    ({theme}) => css`
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