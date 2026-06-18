import { createTheme } from '@mui/material/styles';

export const theme = createTheme ({
    palette: {
        primary:{ main: '#673ab7' },
        secondary: { main: '#ff4081' },
        background: { default: '#f0ebf8', paper: '#ffffff' },
    },
    direction: 'rtl',
    typography: { fontFamily: 'Roboto, sans-serif' },
})