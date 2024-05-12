import * as React from 'react';
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
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import {useLocation, useNavigate} from "react-router-dom";
import { ModalUnstyled as ModalUnstyledLoyaltyRules } from "./loyalty-rules";
import { ModalUnstyled as ModalUnstyledAdminSettings } from "./admin-settings";
import { ModalUnstyled as ModalUnstyledProducts } from "./products";
import SettingsIcon from '@mui/icons-material/Settings';

const pages = ['Pulpit', 'Klienci', 'Statystyki'];
const settings = ['Mój profil', 'Konfiguracja', 'Oferta produktowa', 'Wyloguj'];

const logout = async (navigate) => {
    try {
        navigate("/admin");
    } catch (err) {
        console.error(err);
    }
};

export function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const navigate = useNavigate();
    const [openLoyaltyRules, setOpenLoyaltyRules] = React.useState(false);
    const [openProfile, setOpenProfile] = React.useState(false);
    const [openProducts, setOpenProducts] = React.useState(false);
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];

    const handleOpenNavMenu = (event) => {

        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (event) => {
        if (event.currentTarget.textContent === 'Pulpit') {
            navigate(`/admin/${adminId}/dashboard`);
        }
        if (event.currentTarget.textContent === 'Statystyki') {
            navigate(`/admin/${adminId}/statistics`);
        }
        if (event.currentTarget.textContent === 'Klienci') {
            navigate(`/admin/${adminId}/clients`);
        }
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = (event) => {
        if (event.currentTarget.textContent === 'Wyloguj') {
            logout(navigate);
        }
        if (event.currentTarget.textContent === 'Mój profil') {
            setOpenProfile(true);
        }
        if (event.currentTarget.textContent === 'Konfiguracja') {
            setOpenLoyaltyRules(true);
        }
        if (event.currentTarget.textContent === 'Oferta produktowa') {
            setOpenProducts(true);
        }
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <FilterVintageIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        // href="#app-bar-with-responsive-menu"
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
                        LOGO
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
                    <FilterVintageIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        // href="#app-bar-with-responsive-menu"
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
                        LOGO
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

                    <Box sx={{ flexGrow: 0, display: "flex" }}>
                        <Tooltip title="Ustawienia">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {/*<Avatar src="/broken-image.jpg" />*/}
                                <SettingsIcon style={{fontSize: "30px", color: "white"}}/>
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

            <ModalUnstyledLoyaltyRules open={openLoyaltyRules} onClose={() => setOpenLoyaltyRules(false)} />
            <ModalUnstyledAdminSettings open={openProfile} onClose={() => setOpenProfile(false)} />
            <ModalUnstyledProducts open={openProducts} onClose={() => setOpenProducts(false)} />

        </AppBar>
    );
}
