'use client';

import React, { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { ExpandableSection } from '../../components/ExpandableSection';
import PostCard from '../../components/PostCard';
import QuestionCard from '../../components/QuestionCard';
import {
	getUserPosts,
	getUserFavoritePosts,
	getUserQuestions,
	getUserFavoriteQuestions,
	updateUserInfo,
	getUserInfo,
} from '../../lib/api/users/apiEndpoints';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Button } from '@mui/material';
import {
	Fab,
	Card,
	Typography,
	TextField,
	Dialog,
	useTheme,
	Avatar,
	Stack,
	Box,
	DialogActions,
	DialogContent,
	DialogTitle,
	DialogContentText,
} from '@mui/material';
import type { AxiosError } from 'axios';

import type { PostCardType, QuestionCardType, NewUserInfoType, UserInfoType } from '@/lib/types';
import { UploadButton } from '@/utils/uploadthing';

function Page() {
	const theme = useTheme();
	const { data: session, status } = useSession();
	const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);

	const [openDialog, setOpenDialog] = useState(false);
	const [newName, setNewName] = useState('');
	const [newProfilePicture, setNewProfilePicture] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
	const [userPosts, setUserPosts] = useState<PostCardType[]>([]);
	const [userFavoritePosts, setUserFavoritePosts] = useState<PostCardType[]>([]);
	const userId = session?.user?.userId;

	const [userQuestions, setUserQuestions] = useState<QuestionCardType[]>([]);

	const [userFavoriteQuestions, setUserFavoriteQuestions] = useState<QuestionCardType[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');

	const openModal = (content: string) => {
		setModalContent(content);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};
	const handleOpenDialog = () => {
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
	};

	const fetchData = async () => {
		try {
			const [posts, favoritePosts, questions, favoriteQuestions, userInfoData] =
				await Promise.all([
					getUserPosts(userId),
					getUserFavoritePosts(userId),
					getUserQuestions(userId),
					getUserFavoriteQuestions(userId),
					getUserInfo(userId),
				]);
			setUserInfo(userInfoData);
			setUserPosts(posts);
			setUserFavoritePosts(favoritePosts);
			setUserQuestions(questions);
			setUserFavoriteQuestions(favoriteQuestions);
			setNewName(userInfoData?.name);
			setNewProfilePicture(userInfoData?.profilePicture || '');
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	useEffect(() => {
		fetchData();
	}, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSave = async () => {
		if (!userInfo) return;
		if (!newName.trim() || !currentPassword.trim()) {
			openModal('名字和當前密碼不能為空！');
			return;
		}
		if (newPassword && newPassword !== newPasswordConfirm) {
			openModal('新密碼和確認密碼不匹配！');
			return;
		}

		const newUserInfo: NewUserInfoType = {
			userId: userInfo.userId,
			newName,
			newProfilePicture,
			currentPassword,
			newPassword,
		};

		try {
			await updateUserInfo(newUserInfo);
			handleCloseDialog();
			await fetchData();
		} catch (error) {
			const axiosError = error as AxiosError;
			if (axiosError.response?.status === 400) {
				openModal('密碼錯誤！');
			} else {
				openModal('更新個人資訊失敗！');
			}
		}
	};
	const createStatCard = (
		label: string,
		IconComponent: React.ElementType,
		iconColor: string,
		quantity: number,
	) => (
		<Card
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				width: '33%',
				height: '100%',
				boxShadow: 'none',
				backgroundColor: 'transparent',
			}}
		>
			<Typography variant="caption" component="div" sx={{ textAlign: 'center' }}>
				{label}
			</Typography>
			<Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
				{quantity}
				<IconComponent
					sx={{
						color: iconColor,
						verticalAlign: 'middle',
						marginLeft: '8px',
						marginBottom: '6px',
					}}
				/>{' '}
			</Typography>
		</Card>
	);
	if (status === 'loading') return <div>Loading...</div>;
	if (status === 'unauthenticated') redirect('/');
	return (
		<div
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width: '100%',
			}}
		>
			<Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 5, mb: 5 }}>
				使用者資訊
			</Typography>
			{userInfo && (
				<Card
					sx={{
						width: '60%',
						height: '140px',
						m: 4,
						display: 'flex',
						borderRadius: '10px',
						backgroundColor: '#FEFDFA',
						position: 'relative',
						margin: 'auto',
						flexDirection: 'row',
					}}
				>
					<Card
						sx={{
							width: '40%',
							height: '100%',
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: '10px',
							backgroundColor: 'transparent',
							boxShadow: 'none',
						}}
					>
						<Avatar
							alt={userInfo.name}
							src={userInfo.profilePicture || ''}
							sx={{ width: 75, height: 75, marginLeft: '20px' }}
						/>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								marginLeft: '15px',
							}}
						>
							<Typography variant="h5" component="div">
								{userInfo.name}
							</Typography>
							<Typography variant="body1" component="div">
								{userInfo.email}
							</Typography>
						</Box>
					</Card>

					<Box
						sx={{
							width: '60%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
						}}
					>
						<Stack direction="row" alignItems="center">
							{createStatCard(
								'問題獲得愛心',
								FavoriteIcon,
								'#EDC0C0',
								userInfo.hearts,
							)}
							{createStatCard('文章獲得讚', ThumbUpIcon, '#BFD1ED', userInfo.upvotes)}
							{createStatCard(
								'文章/問題獲得倒讚',
								ThumbDownIcon,
								'#EDD9C0',
								userInfo.downvotes,
							)}
						</Stack>
						<Stack direction="row" alignItems="center" mt={1}>
							{createStatCard(
								'文章/問題收藏數',
								BookmarkIcon,
								'#D2C0ED',
								userInfo.favorites,
							)}
							{createStatCard(
								'認證最佳回答',
								CheckCircleIcon,
								'#C0EDD4',
								userInfo.checkmarks,
							)}
							{createStatCard('總點數', StarIcon, '#EDE7C0', userInfo.points)}
						</Stack>
					</Box>
				</Card>
			)}

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				PaperProps={{ sx: { borderRadius: '10px', backgroundColor: '#FEFDFA' } }}
			>
				<DialogTitle sx={{ textAlign: 'center' }}>編輯個人資料</DialogTitle>
				<DialogContent>
					<Stack spacing={3} className="mt-[10px]">
						<TextField
							autoFocus
							margin="dense"
							label="新名字"
							type="text"
							fullWidth
							variant="outlined"
							value={newName}
							color="secondary"
							onChange={(e) => setNewName(e.target.value)}
						/>
						<TextField
							margin="dense"
							label="新頭像 URL (選填)"
							type="text"
							fullWidth
							variant="outlined"
							value={newProfilePicture}
							color="secondary"
							onChange={(e) => setNewProfilePicture(e.target.value)}
						/>
						<Box className="flex justify-center">
							{newProfilePicture && (
								<Image
									src={newProfilePicture}
									alt="Profile picture"
									width={100}
									height={100}
								/>
							)}
						</Box>
						<UploadButton
							className="* mt-2 ut-button:rounded-lg ut-button:bg-[#BFD1ED] ut-button:after:bg-[#BFD1ED] ut-button:focus-within:ring-[#BFD1ED]
						ut-button:focus-within:ring-offset-2 ut-button:ut-uploading:bg-[#BFD1ED] ut-button:ut-uploading:focus-within:ring-[#BFD1ED] "
							endpoint="profileUploader"
							onClientUploadComplete={(res) => {
								setNewProfilePicture(res[0].url);
							}}
							onUploadError={(error: Error) => {
								openModal(`ERROR! ${error.message}`);
							}}
						/>
						<TextField
							margin="dense"
							label="當前密碼"
							type="password"
							fullWidth
							variant="outlined"
							value={currentPassword}
							color="secondary"
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
						<TextField
							margin="dense"
							label="新密碼 (選填)"
							type="password"
							fullWidth
							variant="outlined"
							value={newPassword}
							color="secondary"
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<TextField
							margin="dense"
							label="再次確認新密碼 (選填)"
							type="password"
							fullWidth
							variant="outlined"
							color="secondary"
							value={newPasswordConfirm}
							onChange={(e) => setNewPasswordConfirm(e.target.value)}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseDialog}
						variant="contained"
						color="secondary"
						sx={{
							mt: 2,
							ml: 1,
							mb: 1,
							bgcolor: `${theme.palette.secondary.main} !important`,
							height: '40px',
							borderRadius: '20px',
							color: 'white',
						}}
					>
						取消
					</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						color="secondary"
						sx={{
							mt: 2,
							ml: 1,
							mb: 1,
							bgcolor: `${theme.palette.secondary.main} !important`,
							height: '40px',
							borderRadius: '20px',
							color: 'white',
						}}
					>
						儲存
					</Button>
				</DialogActions>
			</Dialog>
			<ExpandableSection
				title="發佈的問題"
				items={userQuestions}
				renderQuestionItem={(question) => (
					<QuestionCard key={question.questionId} {...question} />
				)}
			/>
			<ExpandableSection
				title="發佈的文章"
				items={userPosts}
				renderPostItem={(post) => <PostCard key={post.postId} {...post} />}
			/>

			<ExpandableSection
				title="收藏的問題"
				items={userFavoriteQuestions}
				renderQuestionItem={(question) => (
					<QuestionCard key={question.questionId} {...question} />
				)}
			/>

			<ExpandableSection
				title="收藏的文章"
				items={userFavoritePosts}
				renderPostItem={(post) => <PostCard key={post.postId} {...post} />}
			/>

			<Fab
				color="secondary"
				aria-label="我要發文"
				sx={{
					position: 'fixed',
					bottom: 20,
					right: 20,
					backgroundColor: '#BFD1ED !important',
				}}
				onClick={handleOpenDialog}
			>
				<CreateIcon />
			</Fab>
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
		</div>
	);
}

export default Page;
