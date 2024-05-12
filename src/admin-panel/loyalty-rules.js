import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import Button from '@mui/material/Button';
import { query, where, getDocs, collection, setDoc } from 'firebase/firestore';
import { useLocation } from "react-router-dom";
import { Variant1, Variant2, Variant3 } from "./loyalty-rules-variants";

export function ModalUnstyled(props) {
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

    useEffect(() => {
        const id = location.pathname.split("/")[2];
        setAdminId(id);
    }, [location.pathname]);


    const { open, onClose } = props;

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

    useEffect(() => {
        const fetchData = async () => {
        };
        fetchData();
    }, [adminId]);

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
                <ModalContent sx={{width: "70%", height: "70%"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "30px", overflow: "auto"}}>
                    <h2>Konfiguracja programu</h2>
                    <h3>I. Punkty za zakupy</h3>
                    <div style={{display: "flex", gap: "6px"}}>
                        <><Variant1
                            onChange={handleVariantChange}
                            value1={profileData.value1}
                            points1={profileData.points1}
                        />
                        </>
                    </div>
                    <h3>II. Zasady wykorzystania punktów</h3>
                    <div style={{display: "flex", gap: "6px"}}>
                        <>  <Variant2
                            onChange={handleVariantChange}
                            value2={profileData.value2}
                            points2={profileData.points2}
                        /></>
                    </div>
                    <h3>III. Dodatkowe profity</h3>
                    <div style={{display: "flex", flexDirection: "column", gap: "23px"}}>
                        <>   <Variant3
                            onChange={handleVariantChange}
                            value3={profileData.value3}
                            months3={profileData.months3}
                            percentage3={profileData.percentage3}
                        /></>
                    </div>
                    <Button onClick={handleSave} variant="contained">Zapisz i zamknij</Button>
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