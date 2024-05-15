import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import { updateDoc, query, where, getDocs, collection, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { BasicSelectClientForm} from "./select";


export function ModalUnstyled(props) {
    const { open, onClose, selectedClient } = props;
    const [selectedOption, setSelectedOption] = React.useState('');
    const [updatedClientData, setUpdatedClientData] = React.useState({});
    const [originalClientData, setOriginalClientData] = React.useState({});
    const [historyRecord, setHistoryRecord] = React.useState({});
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];
    const currentDate = new Date().toISOString();
    const [lastShopping, setLastShopping] = React.useState({});
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        setUpdatedClientData(selectedClient);
        resetChanges();
    }, [selectedClient]);

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


    const handleSelectChange = (option) => {
        setSelectedOption(option);
    };

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
