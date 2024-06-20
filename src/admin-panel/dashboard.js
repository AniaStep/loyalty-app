import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { ChartSection } from "./chart-section";
import { WelcomeInfoCard } from "./dashboard-summary";


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
        height: "650px",
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "black"
    }

    return (
        <div className="dashboard-container">
            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex', xl: 'flex'}}}>
                <Grid container spacing={2}>
                    <Grid item xl={4} md={4}>
                        <Item style={itemStyle}>
                            <WelcomeInfoCard/>
                        </Item>
                    </Grid>
                    <Grid item xl={8} md={8}>
                        <Item style={itemStyle}>
                            <ChartSection/>
                        </Item>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none', xl: 'none'}, flexDirection: "column"}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item style={itemStyle}>
                            <WelcomeInfoCard/>
                        </Item>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item style={itemStyle}>
                            <ChartSection/>
                        </Item>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export function Dashboard() {

    return (
        <div><BasicGrid/></div>
    );
}
