import React, { useState } from 'react';
import { Modal, StyledBackdrop, ModalContent } from '../misc/MUI-modal-styles';
import Button from '@mui/material/Button';
import { DenseTable } from "./products-table";
import { ProductRecordNewModal } from './product-record-new';

export function ProductsModal(props) {
    const { open, onClose } = props;
    const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

    const handleNewProductModalOpen = () => {
        setIsNewProductModalOpen(true);
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
                <ModalContent sx={{ width: "70%", height: "70%", backgroundColor: "#e0f0ff", overflow: "auto"}}>
                        <h2 id="unstyled-modal-title" className="modal-title">
                            Oferta produktowa i cennik
                        </h2>
                    <div style={{marginTop: "20px"}}><DenseTable/></div>
                    <div style={{display: "flex", gap: "15px", marginTop: "10px"}}>
                        <Button variant="contained" onClick={handleNewProductModalOpen}>Dodaj nowy produkt</Button>
                        <Button onClick={onClose} variant="contained">Anuluj</Button>
                    </div>

                </ModalContent>
            </Modal>
            {isNewProductModalOpen && <ProductRecordNewModal open={isNewProductModalOpen} onClose={() => setIsNewProductModalOpen(false)} />}
        </div>
    );
}