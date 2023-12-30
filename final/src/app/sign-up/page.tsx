'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { TextField, Button, Card, CardContent, Snackbar, Alert } from '@mui/material';
import Box from '@mui/material/Box';

import logIn from '@/lib/api/authentication/login';
import signUp from '@/lib/api/authentication/signup';

type AlertColor = 'success' | 'info' | 'warning' | 'error';

function Page() {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('info');
	const router = useRouter();

	const showSnackbar = (message: string, severity: AlertColor) => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
	};

	const handleSignUp = async () => {
		if (password !== confirmPassword) {
			showSnackbar('密碼不一致', 'error');
			return;
		}

		if (password.length < 8) {
			showSnackbar('密碼至少要 8 位數', 'error');
			return;
		}

		const success = await signUp(email, username, password);
		if (!success) {
			showSnackbar('使用者已存在', 'error');
			return;
		}

		const loginSuccess = await logIn(email, password);
		if (!loginSuccess) {
			return;
		}

		showSnackbar('註冊成功！ 獲得初始點數 10 點！', 'success');
		setTimeout(() => {
			router.push('/');
		}, 3000);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await handleSignUp();
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
					<div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
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
								input: { height: '20px' },
							}}
							label="電子郵件信箱"
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
								input: { height: '20px' },
							}}
							label="使用者名稱"
							variant="outlined"
							type="username"
							value={username}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setUsername(e.target.value)
							}
						/>
						<TextField
							sx={{
								marginBottom: 1.5,
								width: '100%',
								input: { height: '20px' },
							}}
							label="密碼"
							variant="outlined"
							type="password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setPassword(e.target.value)
							}
						/>
						<TextField
							sx={{
								marginBottom: 1.5,
								width: '100%',
								input: { height: '20px' },
							}}
							label="再次確認密碼"
							variant="outlined"
							type="password"
							value={confirmPassword}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setConfirmPassword(e.target.value)
							}
						/>
						<Button
							sx={{
								marginBottom: '0.5rem',
								height: '3.5rem',
								width: '100%',
								backgroundColor: '#104b76',
								color: 'white',
								input: { height: '20px' },
							}}
							type="submit"
							variant="contained"
							style={{ backgroundColor: '#104b76', color: 'white' }}
						>
							註冊
						</Button>
						<Button
							sx={{
								width: '100%',
								color: '#104b76',
								input: { height: '20px' },
							}}
							onClick={() => router.push('/sign-in')}
						>
							回到登入介面
						</Button>
					</form>
				</CardContent>
				<Snackbar
					open={snackbarOpen}
					autoHideDuration={6000}
					onClose={() => setSnackbarOpen(false)}
				>
					<Alert
						onClose={() => setSnackbarOpen(false)}
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
