import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

export function Variant1({ onChange, value1, points1 }) {
    const handlePoints1Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value1, points1: value });
        }
    };

    const handleValue1Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value1: value, points1 });
        }
    };

    const getPoints1Text = (points1) => {
        if (points1 === 1) {
            return 'punkt';
        } else if (points1 % 10 === 2 || points1 % 10 === 3 || points1 % 10 === 4) {
            if (points1 % 100 === 12 || points1 % 100 === 13 || points1 % 100 === 14) {
                return 'punktów';
            } else {
                return 'punkty';
            }
        } else {
            return 'punktów';
        }
    };

    return (
       <>
        <p>Za każde</p>
        <TextField
            label="Watość zakupów"
            type="number"
            value={value1}
            inputProps={{min: 0}}
            onChange={handleValue1Change}
        />
        <p> PLN przyznaj </p>
    <TextField
                label="Liczba punktów"
                type="number"
                value={points1}
                onChange={handlePoints1Change}
                inputProps={{ min: 0 }}
            />
            <p>
                {getPoints1Text(points1)}.
            </p>
    </>
    );
}


export function Variant2({ onChange, value2, points2 }) {
    const handlePoints2Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value2, points2: value });
        }
    };

    const handleValue2Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value2: value, points2 });
        }
    };

    const getPoints2Text1 = (points2) => {
        if (points2 === 1) {
            return 'Każdy';
        } else {
            return 'Każde';
        }
    };
    const getPoints2Text2 = (points2) => {
        if (points2 === 1) {
            return 'punkt może być wymieniony na zakupy o wartości';
        } else if (points2 % 10 === 2 || points2 % 10 === 3 || points2 % 10 === 4) {
            if (points2 % 100 === 12 || points2 % 100 === 13 || points2 % 100 === 14) {
                return 'punktów może być wymienione na zakupy o wartości';
            } else {
                return 'punkty mogą być wymienione na zakupy o wartości';
            }
        } else {
            return 'punktów może być wymienione na zakupy o wartości';
        }

    };

    return (
        <>
            <p>{getPoints2Text1(points2)}</p>
            <TextField
                label="Liczba punktów"
                type="number"
                value={points2}
                onChange={handlePoints2Change}
                inputProps={{ min: 0 }}
            />
            <p>
                {getPoints2Text2(points2)}
            </p>
            <TextField
                label="Watość zakupów"
                type="number"
                value={value2}
                inputProps={{min: 0}}
                onChange={handleValue2Change}
            />
            <p> PLN.</p>
        </>
    );
}


export function Variant3({ onChange, value3, months3, percentage3 }) {
    const handleValue3Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value3: value, months3, percentage3 });
        }
    };

    const handleMonths3Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value3, months3: value, percentage3 });
        }
    };

    const handlePercentage3Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value3, months3, percentage3: value });
        }
    };

    const getMonths3Text = (months3) => {
        if (months3 === 1) {
            return 'miesiąc, ';
        } else if (months3 % 10 === 2 || months3 % 10 === 3 || months3 % 10 === 4) {
            if (months3 % 100 === 12 || months3 % 100 === 13 || months3 % 100 === 14) {
                return 'miesięcy, ';
            } else {
                return 'miesiące, ';
            }
        } else {
            return 'miesięcy, ';
        }
    };


    return (
        <>
            <div style={{display: 'flex', gap: "8px"}}>
                <p>Klienci, którzy wydali w sklepie co najmniej </p>
                <TextField
                label="Watość zakupów"
                type="number"
                value={value3}
                inputProps={{min: 0}}
                onChange={handleValue3Change}
                />
                <p> PLN </p>
            </div>
            <div style={{display: 'flex', gap: "8px"}}>
                <p>i są w programie co najmniej </p>
                <TextField
                    label="Liczba miesięcy"
                    type="number"
                    value={months3}
                    onChange={handleMonths3Change}
                    inputProps={{min: 0}}
                />
                <p>{getMonths3Text(months3)}</p>
            </div>

            <div style={{display: 'flex', gap: "8px"}}>
                <p>otrzymują rabat w wysokości</p>
                <TextField
                    label="Wartość"
                    type="number"
                    value={percentage3}
                    onChange={handlePercentage3Change}
                    inputProps={{min: 0}}
                />
                <p>%.</p>
            </div>
        </>
    );
}