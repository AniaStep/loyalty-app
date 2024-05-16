import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { WelcomeInfoCard } from "./dashboard-summary"
import { Products } from "./dashboard-products"

// Defining styles for the Paper component
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

// Function creating a basic grid layout for Dashboard component
function BasicGrid() {
    const itemStyle = {
        height: "80vh",
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    }

    return (
        <div className="dashboard-container">
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', xl: 'flex' }}}>
                <Grid container spacing={2}>
                    <Grid item xl={7} md={7}>
                        <Item style={itemStyle}>
                            <WelcomeInfoCard />
                        </Item>
                    </Grid>
                    <Grid item xl={5} md={5}>
                        <Item style={itemStyle}>
                            <Products/>
                        </Item>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none', xl: 'none' }, flexDirection: "column"}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item style={itemStyle}>
                            <WelcomeInfoCard />
                        </Item>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item style={itemStyle}>
                            <Products />
                        </Item>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export function Dashboard() {
    return (
        <div> <BasicGrid/></div>
    );
}