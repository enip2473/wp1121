'use client';

import React from 'react';

import Bar from '../../components/AppBar';
import { Box } from '@mui/material';

type Props = {
	children: React.ReactNode;
};

const layout = ({ children }: Props) => {
	return (
		<Box component="main" className="flex min-h-full flex-col ">
			<Bar activeButton="討論專區" />

			<Box className="mt-[100px] flex flex-1 flex-col items-center">
				<Box
					sx={{
						width: '100%',
						overflow: 'visible',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						padding: 10,
					}}
				>
					{children}
				</Box>
			</Box>
		</Box>
	);
};

export default layout;
