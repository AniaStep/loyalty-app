import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Button from '@mui/material/Button';
import {
    query,
    where,
    getDocs,
    collection,
    setDoc,
    onSnapshot,
    updateDoc
} from 'firebase/firestore';
import { useLocation } from "react-router-dom";
import { Variant1, Variant2, Variant3 } from "./loyalty-rules-variants";

export function LoyaltyRulesModal(props) {
    const { open, onClose } = props;
    const location = useLocation();
    const [adminId, setAdminId] = useState('');
    const [ profileData, setProfileData ] = useState({
        value1: '',
        value2: '',
        value3: '',
        points1: '',
        points2: '',
        percentage3: '',
    });

    // Effect hook to update adminId
    useEffect(() => {
        const id = location.pathname.split("/")[2];
        setAdminId(id);
    }, [location.pathname]);

    // Effect hook to fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (adminId) {
                    const q = query(collection(db, "loyaltyRules"), where("adminId", "==", adminId));
                    const querySnapshot = await getDocs(q);
                    const adminData = querySnapshot.docs.map((doc) => doc.data());
                    if (adminData.length > 0) {
                        const data = adminData[0];
                        console.log("Admin data:", data);
                        setProfileData({
                            value1: data.value1 || '',
                            points1: data.points1 || '',
                            value2: data.value2 || '',
                            points2: data.points2 || '',
                            value3: data.value3 || '',
                            percentage3: data.percentage3 || '',
                        });

                    } else {
                        console.log("No such document!");
                    }
                } else {
                    console.log("User not found!");
                }
            } catch (error) {
                console.error("Error getting document:", error);
            }
        };

        fetchData();

    }, [adminId]);

    // Effect hook to subscribe to changes in loyaltyRules collection
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "loyaltyRules"), async (snapshot) => {
            try {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "modified" && change.doc.exists) {
                        const { percentage3 } = change.doc.data();

                        const productsQuery = query(collection(db, 'products'), where('adminId', '==', adminId));
                        const productsQuerySnapshot = await getDocs(productsQuery);

                        productsQuerySnapshot.forEach(async (doc) => {
                            const productData = doc.data();
                            try {
                                await updateDoc(doc.ref, {
                                    discount: percentage3,
                                    priceReduced: productData.priceRegular - (productData.priceRegular * percentage3 / 100),
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        });
                    }
                });
            } catch (err) {
                console.error(err);
            }
        });

        return () => unsubscribe();
    }, [adminId]);

    // Function to handle save action
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            if (!adminId) {
                console.error("Brak adminId!");
                return;
            }

            const q = query(collection(db, "loyaltyRules"), where("adminId", "==", adminId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const adminDocRef = querySnapshot.docs[0].ref;
                await setDoc(adminDocRef, {
                    value1: profileData.value1,
                    points1: profileData.points1,
                    value2: profileData.value2,
                    points2: profileData.points2,
                    value3: profileData.value3,
                    percentage3: profileData.percentage3,
                }, { merge: true });
                console.log("Doc updated successfully");
            } else {
                console.log("No docs found");
            }
        } catch (error) {
            console.error(error);
        }
        onClose();
    };

    // Effect hook to fetch data when adminId changes
    useEffect(() => {
        const fetchData = async () => {
        };
        fetchData();
    }, [adminId]);

    // Function to handle changes in variant data
    const handleVariantChange = (variantData) => {
        setProfileData({ ...profileData, ...variantData });
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
                <ModalContent sx={{width: "70%", height: "70%", backgroundColor: "#e0f0ff"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "30px", overflow: "auto", alignItems: "flex-start"}}>
                        <h2>Konfiguracja programu</h2>
                        <h3>I. Przyznaj punkty za zakupy</h3>
                        <div style={{display: "flex", gap: "6px"}}>
                            <>
                                <Variant1
                                    onChange={handleVariantChange}
                                    value1={profileData.value1}
                                    points1={profileData.points1}
                                />
                            </>
                        </div>
                        <h3>II. Zaoferuj klientom wymianę punktów na ponowne zakupy</h3>
                        <div style={{display: "flex", gap: "6px"}}>
                            <>
                                <Variant2
                                    onChange={handleVariantChange}
                                    value2={profileData.value2}
                                    points2={profileData.points2}
                                />
                            </>
                        </div>
                        <h3>III. Nagradzaj lojalnych klientów</h3>
                        <div style={{display: "flex", flexDirection: "column", gap: "23px", marginBottom: "40px"}}>
                            <>
                                <Variant3
                                    onChange={handleVariantChange}
                                    value3={profileData.value3}
                                    months3={profileData.months3}
                                    percentage3={profileData.percentage3}
                                />
                            </>
                        </div>
                        <Button onClick={handleSave} variant="contained">Zapisz i zamknij</Button>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}