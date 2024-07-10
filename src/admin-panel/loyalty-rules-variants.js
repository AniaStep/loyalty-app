import React, { useState } from 'react';
import TextField from '@mui/material/TextField';


// Variant 1 component for loyalty rules
export function Variant1({ onChange, value1, points1 }) {
    // Function to handle points change
    const handlePoints1Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value1, points1: value });
        }
    };
    // Function to handle value change
    const handleValue1Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value1: value, points1 });
        }
    };
    // Function to set a correct form of word "punkt"
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
    // Function to set a correct form of word "każdy"
    const getValue1Text = (value1) => {
        if (value1 === 1) {
            return 'Za każdy';
        } else {
            return 'Za każde';
        }
    };

    return (
       <>
        <p>{getValue1Text(value1)}</p>
        <TextField
            label="Wartość zakupów"
            type="number"
            value={value1}
            inputProps={{min: 0}}
            onChange={handleValue1Change}
        />
        <p> zł, przyznaj </p>
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

// Variant 2 component for loyalty rules
export function Variant2({ onChange, value2, points2 }) {
    // Function to handle points change
    const handlePoints2Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value2, points2: value });
        }
    };
    // Function to handle value change
    const handleValue2Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value2: value, points2 });
        }
    };
    // Function to set a correct form of word "każdy"
    const getPoints2Text1 = (points2) => {
        if (points2 === 1) {
            return 'Każdy';
        } else {
            return 'Każde';
        }
    };
    // Function to set a correct form of words in phrase: "punkt może być wymieniony na zakupy o wartości"
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
                label="Wartość zakupów"
                type="number"
                value={value2}
                inputProps={{min: 0}}
                onChange={handleValue2Change}
            />
            <p> zł.</p>
        </>
    );
}

// Variant 3 component for loyalty rules
export function Variant3({ onChange, value3, percentage3 }) {
    // Function to handle value change
    const handleValue3Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value3: value, percentage3 });
        }
    };
    // Function to handle percentage (discount) change
    const handlePercentage3Change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0) {
            onChange({ value3, percentage3: value });
        }
    };

    return (
        <>
            <div style={{display: 'flex', gap: "8px"}}>
                <p>Klienci, którzy wydali w sklepie co najmniej </p>
                <TextField
                label="Wartość zakupów"
                type="number"
                value={value3}
                inputProps={{min: 0}}
                onChange={handleValue3Change}
                />
                <p> zł </p>
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