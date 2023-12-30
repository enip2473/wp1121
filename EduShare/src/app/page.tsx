'use client';

import React, { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Bar from '../components/AppBar';
import { getUserInfo, dailySign } from '../lib/api/users/apiEndpoints';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Card, Typography, CardMedia, Fab, Button } from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import type { UserInfoType } from '@/lib/types';

const cardData = [
	{
		title: '討論專區 - 互助共成長',
		description:
			'加入討論，豐富知識之旅！\n 在這裡，回答問題不僅能幫助他人，還能賺取點數。\n有疑問？使用點數提問，讓專家來助你一臂之力！',

		image: '/images/1.png',
		path: '/discussions',
	},
	{
		title: '學習資源 - 知識的寶庫',
		description:
			'探索知識的海洋！\n這裡有各式各樣的知識分享型文章~\n按類別尋找感興趣的內容，或是分享專業文章來獲得點數吧！',

		image: '/images/2.png',
		path: 'resources',
	},
	{
		title: '個人檔案 - 你的成長軌跡',
		description:
			'在這裡，你可以編輯個人資訊，\n以及追蹤自己發布和收藏的問題與文章！\n另外還可以查看你的成就，包括獲得的讚數、愛心等~\n見證自己的成長！',

		image: '/images/3.png',
		path: '/profile',
	},
];

export default function Home() {
	const { data: session } = useSession();
	const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');
	const router = useRouter();

	const openModal = (content: string) => {
		setModalContent(content);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};
	useEffect(() => {
		if (session) {
			getUserInfo(session.user.userId)
				.then((userInfo) => setUserInfo(userInfo))
				.catch(console.error);
		}
	}, [session]);

	const handleSignInClick = async () => {
		if (userInfo?.hasSigned) {
			openModal('你今天已經簽到過了哦！');
		} else {
			try {
				await dailySign(session?.user.userId);
				openModal('簽到成功！獲得點數一點！');
				getUserInfo(session?.user.userId)
					.then((userInfo) => setUserInfo(userInfo))
					.catch(console.error);
			} catch (error) {
				console.error('Error in daily sign:', error);
			}
		}
	};

	return (
		<Box
			component="main"
			sx={{
				display: 'flex',
				minHeight: '100%',
				flexDirection: 'column',
			}}
		>
			<Bar activeButton="首頁" />

			<Box
				sx={{
					marginTop: '10px',
					display: 'flex',
					flex: 1,
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						height: '80%',
						width: '100%',
						overflow: 'visible',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						padding: 10,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							width: '100%',
						}}
					>
						{cardData.map((card, index) => (
							<Card
								key={index}
								sx={{
									display: 'flex',
									flexDirection: index % 2 === 1 ? 'row' : 'row-reverse',
									alignItems: 'center',
									justifyContent: 'space-between',
									height: '70vh',
									width: '90%',
									my: 4,
									borderRadius: '20px',
									overflow: 'hidden',
									backgroundColor: '#fdfdf9',
									cursor: 'pointer',
									'&:hover': {
										boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
										transform: 'scale(1.03)',
									},
								}}
								onClick={() => router.push(card.path)}
							>
								<Box
									sx={{
										width: '50%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<CardMedia
										component="img"
										sx={{ maxWidth: '70%', maxHeight: '70%' }}
										image={card.image}
										alt={card.title}
									/>
								</Box>
								<Box
									sx={{
										width: '50%',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										p: 2,
									}}
								>
									<Typography
										gutterBottom
										variant="h5"
										component="div"
										sx={{ fontWeight: 'bold', mb: 2 }}
									>
										{card.title}
									</Typography>
									{card.description.split('\n').map((line, lineIndex) => (
										<Typography
											key={lineIndex}
											variant="body1"
											color="text.secondary"
											component="div"
										>
											{line}
										</Typography>
									))}
								</Box>
							</Card>
						))}
					</Box>
				</Box>
			</Box>
			{session && (
				<Fab
					color="secondary"
					aria-label="我要簽到"
					sx={{
						position: 'fixed',
						bottom: 20,
						right: 20,
						backgroundColor: userInfo?.hasSigned
							? '#EBEBEB !important'
							: '#BFD1ED !important',
					}}
					onClick={handleSignInClick}
				>
					<EventAvailableIcon />
				</Fab>
			)}

			<Dialog
				open={modalOpen}
				onClose={closeModal}
				PaperProps={{ sx: { borderRadius: '10px', backgroundColor: '#FEFDFA' } }}
			>
				<DialogTitle>提示</DialogTitle>
				<DialogContent>
					<DialogContentText>{modalContent}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeModal}>確定</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
