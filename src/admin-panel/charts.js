import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LineChart } from '@mui/x-charts/LineChart';
import { db } from '../firebase/config';
import {
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

export function DashboardChart() {
    const location = useLocation();
    const adminId = location.pathname.split("/")[2];
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [chartData, setChartData] = useState([]);

    // useEffect hook to fetch transaction data from the Firestore database based on the admin ID, selected month, and selected year
    useEffect(() => {
        const fetchData = async () => {
            try {

                const q = query(collection(db, 'history'), where("adminId", "==", adminId));
                const querySnapshot = await getDocs(q);

                const data = [];
                querySnapshot.forEach((doc) => {
                    const { date } = doc.data();
                    data.push({
                        date: new Date(date).toLocaleDateString(),
                    });
                });

                const transactionsCountMap = data.reduce((acc, curr) => {
                    acc[curr.date] = (acc[curr.date] || 0) + 1;
                    return acc;
                }, {});

                const chartData = generateChartData(transactionsCountMap, selectedMonth, selectedYear);
                setChartData(chartData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [adminId, selectedMonth, selectedYear]);


    // Function to generate chart data based on transactions count map, selected month, and selected year
    const generateChartData = (transactionsCountMap, selectedMonth, selectedYear) => {
        const chartData = [];
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(selectedYear, selectedMonth, i).toLocaleDateString();
            const transactions = transactionsCountMap[date] || 0;
            chartData.push({ date: i, transactions });
        }
        return chartData;
    };

    return (
        <>
            <div className="dashboard-chart">
                <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i} value={i}>{new Date(0, i).toLocaleDateString('default', { month: 'long' })}</MenuItem>
                    ))}
                </Select>
                <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => (
                        <MenuItem key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</MenuItem>
                    ))}
                </Select>
            </div>
            <LineChart
                series={[{ data: chartData.map(item => item.transactions), label: "Liczba transakcji"}]}
                height={290}
                xAxis={[{ data: chartData.map(item => item.date), scaleType: 'band' }]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
        </>
    );
}