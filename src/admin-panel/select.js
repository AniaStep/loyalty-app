import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export function BasicSelectClientForm({ onChange }) {
    const [text, setText] = useState('');

    //Function to handle option selection
    const handleChange = (event) => {
        const selectedOption = event.target.value;
        setText(selectedOption);
        onChange(selectedOption);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Aktualizacja punktów</InputLabel>
                <Select style={{width: "400px"}}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={text}
                    label="Aktualizacja punktów"
                    onChange={handleChange}
                >   <MenuItem value={'Bez zmian'}>Bez zmian</MenuItem>
                    <MenuItem value={'Chcę dodać punkty za zakupy'}>Chcę dodać punkty za zakupy</MenuItem>
                    <MenuItem value={'Chcę dodać dodatkowe punkty'}>Chcę dodać dodatkowe punkty</MenuItem>
                    <MenuItem value={'Chcę odjąć wykorzystane punkty'}>Chcę odjąć wykorzystane punkty</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}