import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { ChartsOverviewDemo } from "./charts";
import { WelcomeInfoCard } from "./dashboard-summary";
import { useNavigate, useLocation } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function BasicGrid() {

    const itemStyle = {
        height: "80vh",
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    }

    return (
        <>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', xl: 'flex' }}}>
                <Grid container spacing={2}>
                    <Grid item xl={4} md={4}>
                        <Item style={itemStyle}>
                            <WelcomeInfoCard />
                        </Item>
                    </Grid>
                    <Grid item xl={8} md={8}>
                        <Item style={itemStyle}>
                            <ChartSection />
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
                            <ChartSection />
                        </Item>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}


const ChartSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const goToStatistics = () => {
        const adminId = location.pathname.split("/")[2];
        navigate(`/admin/${adminId}/statistics`);
    };

    return (
        <>
            <h1>Liczba transakcji</h1>
            <div><ChartsOverviewDemo/></div>
            <Button variant="contained" onClick={goToStatistics}> Więcej statystyk </Button>
        </>
    )
}


export function Dashboard() {

    return (
        <div> <BasicGrid/></div>
    );
}