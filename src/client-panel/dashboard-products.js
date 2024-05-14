import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, priceRegular, priceReduced) {
    return { name, priceRegular, priceReduced};
}


export function BasicTable({ rows, clientsDiscount }) {

    return (
        <TableContainer component={Paper} style={{width: "400px"}}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Produkt</TableCell>
                        <TableCell align="right">Cena regularna</TableCell>
                        <TableCell align="right">{clientsDiscount ? 'Cena dla Ciebie' : 'Cena po rabacie'}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right" style={{ textDecoration: clientsDiscount ? "line-through" : "none" }}>{row.priceRegular}</TableCell>
                            <TableCell align="right" style={{ color: clientsDiscount ? "green" : "black" }}>{row.priceReduced}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export const Products = () => {
    const location = useLocation();
    const adminId = location.pathname.split('/')[2];
    const clientId = location.pathname.split('/')[3];
    const [clientsDiscount, setClientsDiscount] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const clientsQuery = query(collection(db, 'clients'), where('adminId', '==', adminId), where('clientId', '==', clientId));
                const clientsSnapshot = await getDocs(clientsQuery);
                const clientsData = clientsSnapshot.docs.map(doc => doc.data())[0];

                if (clientsData) {
                    setClientsDiscount(clientsData.discount);
                }

                const productsQuery = query(collection(db, 'products'), where('adminId', '==', adminId));
                const productsSnapshot = await getDocs(productsQuery);
                const productsData = productsSnapshot.docs.map(doc => doc.data());

                if (productsData) {
                    setProducts(productsData);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchClientData();
    }, [adminId]);


    const rows = products.map(product => createData(product.name, `${product.priceRegular} PLN`, `${product.priceReduced} PLN`));


    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1>Oferta</h1>

            <BasicTable rows={rows} />

        </div>
    );
};
