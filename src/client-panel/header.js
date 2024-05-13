import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { ModalUnstyled as AccountModal } from "./account";
import { signOut } from "firebase/auth";
import {auth, db} from "../firebase/config";
import {useLocation, useNavigate} from "react-router-dom";
import { where, query, collection, getDocs } from 'firebase/firestore';

const pages = [];
const settings = ['Konto','Wyloguj'];


export function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openAccount, setOpenAccount] = React.useState(false);
    const [logoURL, setLogoURL] = useState(null); // Nowy stan do przechowywania URL logo
    const [adminName, setAdminName] = useState(null); // Nowy stan do przechowywania URL logo
    const navigate = useNavigate();
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];
    const clientId = location.pathname.split("/")[3];


    const logout = async () => {
        try {
            await signOut(auth);
            navigate(`/client/${adminId}`);
        } catch (err) {
            console.error(err);
        }
    };


    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = (event) => {
        if (event.currentTarget.textContent === 'Wyloguj') {
            logout(navigate);
        }
        if (event.currentTarget.textContent === 'Konto') {
            setOpenAccount(true);
        }
        setAnchorElUser(null);
    };


    useEffect(() => {
        const fetchClientData = async () => {
            try {
                if (clientId && adminId) {
                    const clientQuery = query(
                        collection(db, "clients"),
                        where("adminId", "==", adminId),
                        where("clientId", "==", clientId)
                    );
                    const clientQuerySnapshot = await getDocs(clientQuery);
                    if (!clientQuerySnapshot.empty) {
                        const clientData = clientQuerySnapshot.docs[0].data();
                        if (clientData && clientData.logoURL) {
                            setLogoURL(clientData.logoURL);
                        }
                        if (clientData && clientData.adminName) {
                            setAdminName(clientData.adminName);
                        }
                    } else {
                        console.log("No matching documents!");
                    }
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        fetchClientData();
    }, [adminId, clientId]);


    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box
                        sx={{display: {xs: 'none', md: 'flex'}, mr: 1}}
                        style={{width: "45px", height: "45px"}}>
                        {logoURL && <img src={logoURL} alt="Logo" style={{ width: "100%", height: "100%" , borderRadius: "50%"}} />}
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {adminName && adminName }
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>


                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
                         style={{width: "45px", height: "45px"}}>
                        {logoURL && <img src={logoURL} alt="Logo" style={{ width: "100%", height: "100%" , borderRadius: "50%"}} />}
                    </Box>

                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {adminName && adminName }
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar src="/broken-image.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} />
        </AppBar>
    );
}
