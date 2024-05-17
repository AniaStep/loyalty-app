import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    collection,
    getDocs,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import TableCell from '@mui/material/TableCell';

// Function to create row data
function createData(name, priceRegular, priceReduced) {
    return { name, priceRegular, priceReduced};
}

export function BasicTable({ rows, clientsDiscount, discount }) {

    // Checking if data is still loading
    if (clientsDiscount === undefined || discount === undefined) {
        return <div>Ładowanie...</div>;
    }

    return (
        <TableContainer component={Paper} style={{width: "500px", overflow: "auto"}}>
            <Table sx={{ minWidth: 500 }} aria-label="simple table">
                <TableHead>
                    <TableRow style={{backgroundColor: "#c8d4eb"}}>
                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Produkt</Typography></TableCell>
                        <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Cena regularna</Typography></TableCell>
                        <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>{ discount > 0 && clientsDiscount === false ? 'Cena po rabacie' : 'Cena dla Ciebie'}</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right" style={{ textDecoration: clientsDiscount && discount > 0 ? "line-through" : "none" }}>{row.priceRegular}</TableCell>
                            <TableCell align="right" style={{ color: clientsDiscount && discount > 0 ? "#009900" : "black" }}>{row.priceReduced}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// Functional component for displaying products
export const Products = () => {
    const location = useLocation();
    const adminId = location.pathname.split('/')[2];
    const clientId = location.pathname.split('/')[3];
    const [ clientsDiscount, setClientsDiscount ] = useState(false);
    const [ discount, setDiscount ] = useState(0);
    const [ products, setProducts ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);

    // Effect to fetch client data
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const clientsQuery = query(collection(db, 'clients'), where('adminId', '==', adminId), where('clientId', '==', clientId));
                const clientsSnapshot = await getDocs(clientsQuery);
                const clientsData = clientsSnapshot.docs.map(doc => doc.data())[0];

                if (clientsData) {
                    setClientsDiscount(clientsData.discount);
                }

                // Subscribing to changes in clients collection
                const clientsUnsubscribe = onSnapshot(clientsQuery, (snapshot) => {
                    const clientsData = snapshot.docs.map(doc => doc.data());
                });

                const productsQuery = query(collection(db, 'products'), where('adminId', '==', adminId));
                // Subscribing to changes in products collection
                const productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
                    const productsData = snapshot.docs.map(doc => doc.data());
                    const sortedProductsData = productsData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                    setProducts(sortedProductsData);

                    // Finding product with discount and setting discount
                    const productWithDiscount = productsData.find(product => product.discount > 0);
                    if (productWithDiscount) {
                        setDiscount(productWithDiscount.discount);
                    } else {
                        setDiscount(0);
                    }
                    setIsLoading(false);
                });

                return () => {
                    clientsUnsubscribe();
                    productsUnsubscribe();
                };

            } catch (error) {
                console.error(error);
            }
        };

        fetchClientData();
    }, [adminId]);

    if (isLoading) {
        return <div>Ładowanie...</div>;
    }

    // Mapping products to rows for table
    const rows = products.map(product => createData(product.name, `${product.priceRegular} PLN`, `${product.priceReduced} PLN`));

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>Oferta</h1>
            <BasicTable rows={rows} clientsDiscount={clientsDiscount} discount={discount}/>
        </div>
    );
};
