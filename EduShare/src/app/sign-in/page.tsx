'use client';

import React, { useState } from 'react';
import type { SyntheticEvent } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { TextField, Button, Card, CardContent, Snackbar, Alert } from '@mui/material';
import Box from '@mui/material/Box';

import logIn from '@/lib/api/authentication/login';

type AlertColor = 'success' | 'info' | 'warning' | 'error';

function Page() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('info');
	const router = useRouter();
	const commonTextClass = 'text-base';

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const loginSuccess = await logIn(email, password);
		if (!loginSuccess) {
			showSnackbar('帳號或密碼錯誤', 'error');
			return;
		}

		showSnackbar('登入成功！', 'success');
		setTimeout(() => {
			router.push('/');
		}, 3000);
		router.push('/');
	};

	const showSnackbar = (message: string, severity: AlertColor) => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setOpenSnackbar(true);
	};

	const handleCloseSnackbar = (
		event: Event | SyntheticEvent<Element, Event>,
		reason?: string,
	) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenSnackbar(false);
	};
	return (
		<Box
			sx={{
				display: 'flex',
				height: '100vh',
				width: '100vw',
				justifyContent: 'center',
				backgroundColor: '#FCFAF5',
			}}
		>
			<Card
				sx={{
					display: 'flex',
					width: '33%',
					flexDirection: 'column',
					borderRadius: 0,
					border: 0,
					backgroundColor: '#FCFAF5',
				}}
				elevation={0}
			>
				<CardContent>
					<div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
						<Image src="/images/logo.png" alt="Logo" width={80} height={80} />
					</div>
					<p
						style={{
							fontWeight: 'bold',
							color: '#104b76',
							fontSize: '30px',
							textAlign: 'center',
							marginBottom: '10px',
							marginTop: '10px',
						}}
					>
						學習互助平台
					</p>
					<form onSubmit={handleSubmit}>
						<TextField
							sx={{
								marginBottom: 1.5,
								width: '100%',
							}}
							label="帳號"
							variant="outlined"
							type="email"
							value={email}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setEmail(e.target.value)
							}
						/>
						<TextField
							sx={{
								marginBottom: 1.5,
								width: '100%',
							}}
							label="密碼"
							variant="outlined"
							type="password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setPassword(e.target.value)
							}
						/>
						<Button
							type="submit"
							sx={{
								marginBottom: '1rem',
								height: '3.5rem',
								width: '100%',
								backgroundColor: '#104b76',
								color: 'white',
							}}
							variant="contained"
							style={{ backgroundColor: '#104b76', color: 'white' }}
						>
							登入
						</Button>
					</form>
					<div className={`flex flex-row items-center justify-center`}>
						<span className={`${commonTextClass}`}>還沒註冊嗎？</span>
						<Button
							sx={{ color: '#104b76', m: 0.5, minWidth: 0, p: 0 }}
							onClick={() => router.push('/sign-up')}
						>
							註冊
						</Button>
					</div>
				</CardContent>

				<Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
					<Alert
						onClose={handleCloseSnackbar}
						severity={snackbarSeverity}
						sx={{ width: '100%' }}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</Card>
		</Box>
	);
}

export default Page;
