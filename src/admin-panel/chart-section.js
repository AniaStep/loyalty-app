import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import { DashboardChart } from "./charts";

// Sub-component of Dashboard component
export const ChartSection = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Function to navigate to statistics page
    const goToStatistics = () => {
        const adminId = location.pathname.split("/")[2];
        navigate(`/admin/${adminId}/statistics`);
    };

    return (
        <>
            <h1>Liczba transakcji</h1>
            <div><DashboardChart/></div>
            <Button variant="contained" onClick={goToStatistics}> Więcej statystyk </Button>
        </>
    )
}