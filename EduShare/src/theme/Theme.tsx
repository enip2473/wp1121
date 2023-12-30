'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#104b76',
		},
		secondary: {
			main: '#BFD1ED',
		},
		background: {
			default: '#FCFAF5',
		},
		text: {
			primary: '#24282D',
			secondary: 'rgba(0, 0, 0, 0.54)',
			disabled: 'rgba(0, 0, 0, 0.38)',
		},
	},
	typography: {
		fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
	},
	// components: {
	// 	MuiButton: {
	// 		styleOverrides: {
	// 			root: {
	// 				backgroundColor: '#BFD1ED',
	// 			},
	// 		},
	// 	},
	// },
});
