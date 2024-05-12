import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { useAuth } from "../firebase/AuthProvider";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableCell from '@mui/material/TableCell';
import { ModalUnstyled as ModalUnstyledProductEdit } from './product-record-edition';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';


function createData(name, priceRegular, priceReduced) {
    return { name, priceRegular, priceReduced };
}

const rows = [
];

export function DenseTable() {

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const user = useAuth();

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const fetchedProducts = [];
            querySnapshot.forEach((doc) => {
                fetchedProducts.push(doc.data());
            });
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setOpenEditModal(true);
    };

    const handleDeleteClick = async (productName) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const docToDelete = querySnapshot.docs.find(doc => doc.data().name === productName);

            if (docToDelete) {
                await deleteDoc(doc(db, 'products', docToDelete.id));

                setProducts(prevProducts => prevProducts.filter(product => product.name !== productName));
            } else {
                console.error("Product not found.");
            }
        } catch (error) {
            console.error("Error deleting product: ", error);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Produkt</TableCell>
                        <TableCell align="right">Cena regularna (PLN)</TableCell>
                        <TableCell align="right">Cena promocyjna (PLN)</TableCell>
                        <TableCell align="right">Edytuj</TableCell>
                        <TableCell align="right">Usuń</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow
                            key={product.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {product.name}
                            </TableCell>
                            <TableCell align="right">{product.priceRegular}</TableCell>
                            <TableCell align="right">{product.priceReduced}</TableCell>
                            <TableCell align="right"><EditIcon onClick={() => handleEditClick(product)} /></TableCell>
                            <TableCell align="right">{<DeleteIcon onClick={() => handleDeleteClick(product.name)}/>}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ModalUnstyledProductEdit open={openEditModal} onClose={() => setOpenEditModal(false)} selectedProduct={selectedProduct} />

        </TableContainer>
    );
}