import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';

// import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import Provider from '@/app/context/client-provider';
import { theme } from '@/theme/Theme';
import { authOptions } from '@/utils/authOptions';

import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: '學習互助平台',
	description: '問問題、分享知識的社群平台',
	icons: {
		icon: '/favicon.ico',
	},
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(authOptions);

	return (
		<html lang="en">
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Provider session={session}>
					<body style={{ minHeight: '100vh', backgroundColor: '#FCFAF5' }}>
						{children}
					</body>
				</Provider>
			</ThemeProvider>
		</html>
	);
}
