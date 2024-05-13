import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextField from "@mui/material/TextField";
import { db } from '../firebase/config';
import { useAuth } from "../firebase/AuthProvider";
import { updateDoc, query, where, getDocs, collection, setDoc, onSnapshot} from 'firebase/firestore';
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export function InputFileUpload({ adminId, onUploadSuccess }) {
    const [file, setFile] = useState(null);

    const storage = getStorage();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };


    const handleUpload = async () => {
        console.log(adminId)

        try {
            if (!file) {
                console.error("No file selected!");
                return;
            }

            const filePath = `logos/${adminId}/${file.name}`;
            const fileRef = ref(storage, filePath);

            await uploadBytes(fileRef, file);

            const logoURL = await getDownloadURL(fileRef);
            console.log("Logo uploaded successfully!");
            onUploadSuccess(logoURL);
        } catch (error) {
            console.error("Error uploading logo:", error);
        }
    };

    return (
        <>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
                <Button
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                >
                    Pobierz
                </Button>
            </label>
            <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file}
            >
                Wyślij
            </Button>
        </>
    );
}

InputFileUpload.propTypes = {
    adminId: PropTypes.string.isRequired,
    onUploadSuccess: PropTypes.func.isRequired,
};

export function ModalUnstyled(props) {

    const { open, onClose } = props;
    const [ profileData, setProfileData ] = useState({
        company: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
    });
    const location = useLocation();
    const [adminId, setAdminId] = useState('');
    const [errors, setErrors] = useState({});
    const [logoURL, setLogoURL] = useState(null);

    const user = useAuth();

    useEffect(() => {
        const id = location.pathname.split("/")[2];
        setAdminId(id);
    }, [location.pathname]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                if (adminId) {
                    const adminQuery = query(collection(db, "admins"), where("adminId", "==", adminId));
                    const unsubscribe = onSnapshot(adminQuery, (adminSnapshot) => {
                        adminSnapshot.forEach(async (adminDoc) => {
                            const adminData = adminDoc.data();

                            const clientQuery = query(collection(db, "clients"), where("adminId", "==", adminId));
                            const clientSnapshot = await getDocs(clientQuery);
                            clientSnapshot.forEach(async (clientDoc) => {
                                const clientDocRef = clientDoc.ref;
                                await updateDoc(clientDocRef, {
                                    logoURL: adminData.logoURL || '',
                                    adminName: adminData.company || '',
                                });
                                console.log("Client document updated successfully!");
                            });

                            setProfileData({
                                company: adminData.company || '',
                                name: adminData.name || '',
                                surname: adminData.surname || '',
                                email: adminData.email || '',
                                phone: adminData.phone || '',
                                logoURL: adminData.logoURL || '',
                            });
                        });
                    });

                    return () => unsubscribe();
                } else {
                    console.log("User not found!");
                }
            } catch (error) {
                console.error("Error getting document:", error);
            }
        };

        fetchData();
    }, [adminId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        const newErrors = {};
        if (name === 'company' && (value.length < 1)) {
            newErrors.company = "Pole nie może być puste.";
        }

        if (name === 'name' && (value.length < 2)) {
            newErrors.name = "Imię musi zawierać co najmniej 2 znaki.";
        }
        if (name === 'surname' && (value.length < 2)) {
            newErrors.surname = "Nazwisko musi zawierać co najmniej 2 znaki.";
        }

        if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
            newErrors.email = "Wprowadź poprawny adres email.";
        }

        if (name === 'phone' && !/^\d{9}$/.test(value)) {
            newErrors.phone = "Numer telefonu musi zawierać 9 cyfr.";
        }

        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentUrl = window.location.href;
        const linkToShare = currentUrl.replace("/admin/", "/client/");
        console.log("Link to share:", linkToShare);
        try {
            if (adminId) {
                const q = query(collection(db, "admins"), where("adminId", "==", adminId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const adminDocRef = querySnapshot.docs[0].ref;
                    await setDoc(adminDocRef, {
                        company: profileData.company,
                        name: profileData.name,
                        surname: profileData.surname,
                        email: profileData.email,
                        phone: profileData.phone,
                        clientLogin: linkToShare
                    }, { merge: true });
                    console.log("Document successfully updated!");
                } else {
                    console.log("No matching documents!");
                }
            } else {
                console.log("Invalid adminId!");
            }
        } catch (error) {
            console.error("Error updating document: ", error);
        }
        onClose()
    };

    useEffect(() => {
        const fetchData = async () => {
        };
        fetchData();
    }, [adminId]);


    const handleUploadSuccess = async (url) => {
        setLogoURL(url);
        try {
            if (adminId) {
                const q = query(collection(db, "admins"), where("adminId", "==", adminId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const adminDocRef = querySnapshot.docs[0].ref;
                    await updateDoc(adminDocRef, { logoURL: url });
                    console.log("Logo URL updated successfully!");
                } else {
                    console.log("No matching documents!");
                }
            } else {
                console.log("Invalid adminId!");
            }
        } catch (error) {
            console.error("Error updating logo URL: ", error);
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
                <ModalContent sx={{
                    width: "500px",
                    height: "70%",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <form style={{display: "flex", flexDirection: "column", gap: "15px", width: "400px"}}>
                        <h2>Dane administratora </h2>
                        <TextField name="company" label="Nazwa firmy" defaultValue={profileData.company}
                                   onChange={handleChange} required error={!!errors.company}
                                   helperText={errors.company}/>
                        <TextField name="name" label="Imię administratora" defaultValue={profileData.name}
                                   onChange={handleChange} required error={!!errors.name} helperText={errors.name}/>
                        <TextField name="surname" label="Nazwisko administratora" defaultValue={profileData.surname}
                                   onChange={handleChange} required error={!!errors.surname}
                                   helperText={errors.surname}/>
                        <TextField name="email" label="Email" defaultValue={profileData.email} onChange={handleChange}
                                   required error={!!errors.email} helperText={errors.email}/>
                        <TextField name="phone" label="Telefon" defaultValue={profileData.phone} onChange={handleChange}
                                   error={!!errors.phone} helperText={errors.phone}/>

                    </form>


                    <h3>To jest Twój unikalny link do strony logowania dla Twoich klientów: </h3>
                    <a href={window.location.href.replace("/admin/", "/client/")}>
                        {window.location.href.replace("/admin/", "/client/")}
                    </a>

                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>

                        <h3>Dodaj logo firmy do strony logowania Twoich klientów.</h3>

                        <div style={{width: "200px", height: "200px", border: "1px solid gray"}}>
                            {profileData.logoURL && <img src={profileData.logoURL} alt="Logo"
                                             style={{maxWidth: "100%", maxHeight: "100px", marginTop: "20px"}}/>}
                        </div>
                        <div><InputFileUpload adminId={adminId} onUploadSuccess={handleUploadSuccess}/>
                        </div>

                    </div>

                    <div style={{}}>
                        <Button variant="contained" onClick={handleSubmit}>Aktualizuj</Button>
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