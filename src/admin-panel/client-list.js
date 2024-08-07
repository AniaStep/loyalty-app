import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { db } from '../firebase/config';
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    onSnapshot,
    updateDoc
} from "firebase/firestore";
import { useAuth } from "../firebase/auth-provider";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import { ClientRecordEditionModal } from "./client-record-edition";
import { ClientRecordNewModal } from "./client-record-new";


// Function to create row data
function createData(id, name, surname, email, dateFrom, lastShopping, totalPoints, totalValue) {
    return {
        id,
        name,
        surname,
        email,
        dateFrom,
        lastShopping,
        totalPoints,
        totalValue,
        history: [],
    };
}

// Function to format date
function formatDate(timestamp) {
    if (!timestamp) return "";
    let date;
    if (typeof timestamp === 'object') {
        const { seconds = 0, nanoseconds = 0 } = timestamp;
        date = new Date(seconds * 1000 + nanoseconds / 1000000);
    } else {
        date = new Date(timestamp);
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

// Row component
const Row = ({ row, clientHistory, openModal }) => {
    const [open, setOpen] = React.useState(false);

    const handleOpenModal = () => {
        openModal(row);
    };

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align="left">
                    <IconButton onClick={handleOpenModal}>
                        <EditIcon />
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.id}
                </TableCell>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.surname}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">{formatDate(row.dateFrom)}</TableCell>
                <TableCell align="right">{row.lastShopping ? formatDate(row.lastShopping) : "-"}</TableCell>
                <TableCell align="right">{row.totalPoints}</TableCell>
                <TableCell align="right">{row.totalValue}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Historia
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow style={{backgroundColor: "#dae9fa"}}>
                                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Data</Typography></TableCell>
                                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Wydana suma (PLN)</Typography></TableCell>
                                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Przyznane punkty</Typography></TableCell>
                                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Wykorzystane punkty</Typography></TableCell>
                                        <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>Aktualna ilość punktów</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clientHistory[row.email] && clientHistory[row.email].map((historyRow) => (
                                        <TableRow key={historyRow.id}>
                                            <TableCell component="th" scope="row">
                                                {formatDate(historyRow.date)}
                                            </TableCell>
                                            <TableCell>{historyRow.value}</TableCell>
                                            <TableCell>{historyRow.pointsGranted}</TableCell>
                                            <TableCell>{historyRow.pointsUsed}</TableCell>
                                            <TableCell>{historyRow.points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// Prop types for Row component
Row.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        surname: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        lastShopping: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        dateFrom: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
        totalPoints: PropTypes.number.isRequired,
        totalValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        history: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.number,
                points: PropTypes.number,
                date: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
                pointsGranted: PropTypes.number,
                pointsUsed: PropTypes.number,
            }),
        ),
    }).isRequired,
    clientHistory: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
};

// Main component (list of clients)
export function CollapsibleTable() {
    const user = useAuth();
    const [adminId, setAdminId] = useState(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [clientHistory, setClientHistory] = useState({});
    const [filteredRows, setFilteredRows] = React.useState([]);
    const [selectedClient, setSelectedClient] = React.useState(null);
    const [modalOpenEdit, setModalOpenEdit] = React.useState(false);
    const [modalOpenNew, setModalOpenNew] = React.useState(false);

    // Fetch data and set state
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const adminId = user.uid;
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

                    setRows(clients);
                    setAdminId(adminId);


                    const historyPromises = clients.map(async (client) => {
                        const historyQuerySnapshot = await getDocs(query(collection(db, "history"), where("email", "==", client.email), where("adminId", "==", adminId)))
                        const history = [];
                        historyQuerySnapshot.forEach((doc) => {
                            history.push(doc.data());
                        });
                        history.sort((a, b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0));
                        return { [client.email]: history };
                    });
                    const clientHistories = await Promise.all(historyPromises);
                    setClientHistory(Object.assign({}, ...clientHistories));
                }

            } catch (err) {
                console.error(err);
            }

        };
        fetchData();

        // Subscribing to changes in loyaltyRules collection
        const unsubscribe = onSnapshot(collection(db, "loyaltyRules"), async (snapshot) => {
            try {
                const loyaltyRules = snapshot.docs.map(doc => doc.data())[0];
                const adminId = user.uid;
                const clientsQuery = query(collection(db, 'clients'), where('adminId', '==', adminId));
                const querySnapshot = await getDocs(clientsQuery);
                const productsQuery = query(collection(db, 'products'), where('adminId', '==', adminId));
                const productsQuerySnapshot = await getDocs(productsQuery);

                querySnapshot.forEach(async (doc) => {
                    const clientData = doc.data();
                    const totalPoints = clientData.totalPoints;
                    const totalValue = clientData.totalValueNum;

                    try {
                        await updateDoc(doc.ref, {
                            gained: (loyaltyRules.points2 > 0) ? (totalPoints / loyaltyRules.points2 * loyaltyRules.value2) : 0,
                            discount: totalValue >= loyaltyRules.value3
                        });
                    } catch (err) {
                        console.error(err);
                    }
                });
                productsQuerySnapshot.forEach(async (doc) => {
                    const productData = doc.data();
                    console.log(loyaltyRules.percentage3)

                    try {
                        await updateDoc(doc.ref, {
                            discount: loyaltyRules.percentage3,
                            priceReduced: productData.priceRegular - (productData.priceRegular * loyaltyRules.percentage3 / 100),
                        });
                    } catch (err) {
                        console.error(err);
                    }
                });

            } catch (err) {
                console.error(err);
            }
        });

        return () => unsubscribe();

    }, [user]);

    // Filter rows based on search term
    useEffect(() => {
        if (rows && rows.length > 0) {
            const filtered = rows.filter(
                (row) =>
                    (row.surname && row.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    row.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRows(filtered);
        }
    }, [searchTerm, rows]);

    // Pagination event handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Modal handlers
    const openModal = (client) => {
        if (client) {
            setSelectedClient(client);
            setModalOpenEdit(true);
        }
    }

    const handleCloseModalEdit = () => {
        setModalOpenEdit(false);
        setSelectedClient(null);
    };

    const handleCloseModalNew = async () => {
        if (selectedClient) {
            const clientRef = doc(db, 'clients', selectedClient.id);
            const clientSnap = await getDoc(clientRef);
            const updatedClient = clientSnap.data();

            setSelectedClient(updatedClient);
        }
        setModalOpenNew(false);
        setSelectedClient(null);
    };

    const handleAddClient = () => {
        setModalOpenNew(true);
    }

    return (
        <div style={{paddingLeft: "30px", paddingRight: "30px" }}>
            <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                paddingBottom: "30px",
            }}>
                <TextField
                    label="Szukaj"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddClient}>Dodaj klienta</Button>
            </div>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow style={{ backgroundColor: '#c8d4eb' }}>
                            <TableCell/>
                            <TableCell/>
                            <TableCell><Typography variant="h7" style={{fontWeight: 'bold'}}>ID</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Imię</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Nazwisko</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Email</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Data rejestracji</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Ostatnie zakupy</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Punkty</Typography></TableCell>
                            <TableCell align="right"><Typography variant="h7" style={{fontWeight: 'bold'}}>Wartość zakupów</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <Row key={row.email} row={row} clientHistory={clientHistory} openModal={openModal}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Liczba rzędów"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} z ${count}`}
            />
            <ClientRecordEditionModal open={modalOpenEdit} onClose={handleCloseModalEdit} selectedClient={selectedClient} />
            <ClientRecordNewModal open={modalOpenNew} onClose={handleCloseModalNew} />
        </div>
    );
}