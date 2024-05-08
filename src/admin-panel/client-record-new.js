import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import {collection, addDoc, getDocs, query, where} from 'firebase/firestore';
import { db } from '../firebase/config';
import {useLocation} from "react-router-dom";
import {useEffect} from "react";

export function ModalUnstyled(props) {
    const { open, onClose, selectedClient } = props;
    const [selectedOption, setSelectedOption] = React.useState('');
    const [updatedClientData, setUpdatedClientData] = React.useState({});
    const location = useLocation();
    const [errors, setErrors] = React.useState({});
    const adminId = location.pathname.split("/")[2];

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

    const handleSaveChanges = async () => {
        const adminId = location.pathname.split("/")[2];
        const currentDate = new Date().toISOString();

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


        const newClientData = {
            name: updatedClientData.name,
            surname: updatedClientData.surname,
            email: updatedClientData.email,
            adminId: adminId,
            clientId: "n/a",
            clientRef: 'n/a',
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

    useEffect(() => {
        fetchData();
    }, [adminId]);


    const handleSelectChange = (option) => {
        setSelectedOption(option);
    };

    return (
        <div>
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={onClose}
                slots={{ backdrop: StyledBackdrop }}
                selectedClient={selectedClient} // Dodaj tę linię
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
