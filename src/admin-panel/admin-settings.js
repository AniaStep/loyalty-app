import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { styled } from '@mui/system';
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from "@mui/material/TextField";
import { db } from '../firebase/config';
import { useAuth } from "../firebase/auth-provider";
import {
    updateDoc,
    query,
    where,
    getDocs,
    collection,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import {
    ref,
    getStorage,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";


// Styled component for visually hidden input
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

// Main Modal component
export function AdminSettingsModal(props) {
    const [file, setFile] = useState(null);
    const storage = getStorage();
    const { open, onClose } = props;
    const [ profileData, setProfileData ] = useState({
        company: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        logoURL: '',
    });
    const [adminId, setAdminId] = useState('');
    const [errors, setErrors] = useState({});
    const [logoURL, setLogoURL] = useState(null);
    const user = useAuth();
    const location = useLocation();

    // Effect to set admin ID based on URL path
    useEffect(() => {
        const id = location.pathname.split("/")[2];
        setAdminId(id);
    }, [location.pathname]);

    // Effect to fetch admin data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (adminId) {
                    const adminQuery = query(collection(db, "admins"), where("adminId", "==", adminId));
                    const unsubscribe = onSnapshot(adminQuery, (adminSnapshot) => {
                        adminSnapshot.forEach(async (adminDoc) => {
                            const adminData = adminDoc.data();

                            // Updating client documents with admin data
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

                            // Setting profile data state
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

    // Logo file change handler
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    // Logo file remove handler
    const handleFileRemove = async () => {
        setFile(null);
        try {
            const q = query(collection(db, "admins"), where("adminId", "==", adminId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const adminDocRef = querySnapshot.docs[0].ref;
                await updateDoc(adminDocRef, { logoURL: '' });
                console.log("Logo URL removed successfully!");
            } else {
                console.log("No matching documents!");
            }
        } catch (error) {
            console.error("Error removing logo URL:", error);
        }
    };

    // Logo file upload handler
    const handleUpload = async () => {
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

            setLogoURL(logoURL);

            // Updating admin document with logo URL
            if (adminId) {
                const q = query(collection(db, "admins"), where("adminId", "==", adminId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const adminDocRef = querySnapshot.docs[0].ref;
                    await updateDoc(adminDocRef, { logoURL });
                    console.log("Logo URL updated successfully!");
                } else {
                    console.log("No matching documents!");
                }
            } else {
                console.log("Invalid adminId!");
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
        }
    };

    // Input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Validation
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

    // Form submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Building link to share
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
                        logoURL: profileData.logoURL,
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
            console.error(error);
        }
        // Closing modal
        onClose()
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
                    alignItems: "center",
                    backgroundColor: "#e0f0ff"
                }}>
                    <form className="admin-settings-form">
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

                        <div className="form-buttons">
                            <Button variant="contained" onClick={handleSubmit}>Aktualizuj</Button>
                            <Button variant="contained" onClick={onClose}>Anuluj</Button>
                        </div>
                    </form>

                    <Paper className="admin-settings-custom">
                        <h3 className="admin-settings-subtitle">Strona logowania klientów</h3>
                        <p>To jest link do strony logowania dla Twoich klientów:</p>
                        <a href={window.location.href.replace("/admin/", "/client/").replace("/dashboard", "")}>
                        {window.location.href.replace("/admin/", "/client/").replace("/dashboard", "")}
                        </a>
                        <p>Udostępnij go swoim klientom, aby umożliwić im rejestrację w programie oraz logowanie do panelu klienta.</p>
                        <h3 className="admin-settings-subtitle">Logo</h3>
                        <p>Możesz również dodać swoje logo do strony rejestracji/logowania do panelu klienta, jak również do samego panelu.</p>
                        <div className="logo-section">
                            <div className="logo-container">
                            {profileData.logoURL ? <img src={profileData.logoURL} alt="Logo" className="logo"/> : "<Logo>"}
                            </div>
                            <div className="logo-buttons">
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{display: 'none'}}
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload">
                                    <Button
                                        component="span"
                                        variant="contained">
                                        <UploadFileIcon/>
                                    </Button>
                                </label>
                                <Button
                                    variant="contained"
                                    onClick={handleUpload}
                                    disabled={!file}>
                                    <PublishIcon/>
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleFileRemove}>
                                    <DeleteIcon/>
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </ModalContent>
            </Modal>
        </div>
    );
}