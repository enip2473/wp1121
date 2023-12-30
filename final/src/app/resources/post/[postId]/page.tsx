'use client';

import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import SwipeableViews from 'react-swipeable-views';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

import getTimeDifference from '../../../../components/getTimeDifference';
import {
	getPostDetail,
	addCommentToPost,
	addReplyToComment,
	interactWithPost,
	interactiWithPostComment,
} from '../../../../lib/api/resources/apiEndpoints';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { List, ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import { Button, TextField } from '@mui/material';
import {
	useTheme,
	Card,
	CardContent,
	Typography,
	Avatar,
	Chip,
	Stack,
	Box,
	Divider,
	IconButton,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MobileStepper from '@mui/material/MobileStepper';

import type { PostCardDetailType } from '@/lib/types';

function Page() {
	const theme = useTheme();
	const { postId } = useParams<{ postId: string }>();
	const [post, setPost] = useState<PostCardDetailType | null>(null);

	const [newComment, setNewComment] = useState('');
	const [newReply, setNewReply] = useState<{ [commentId: number]: string }>({});
	const [formattedTime, setFormattedTime] = useState('');
	const { data: session } = useSession();
	const [activeStep, setActiveStep] = useState(0);
	const [maxSteps, setMaxSteps] = useState(0);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');

	const openModal = (content: string) => {
		setModalContent(content);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleStepChange = (step: number) => {
		setActiveStep(step);
	};
	const handleCommentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setNewComment(event.target.value);
		const postData = await getPostDetail(Number(postId));
		setPost(postData);
	};
	const fetchPostDetail = async () => {
		if (postId) {
			try {
				const postData = await getPostDetail(Number(postId));
				setPost(postData);
				setFormattedTime(getTimeDifference(postData.createdAt));
				setMaxSteps(postData.postImages.length);
			} catch (error) {
				console.error('Error fetching post detail:', error);
			}
		}
	};
	const handleReplyChange = async (
		commentId: number,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setNewReply({ ...newReply, [commentId]: event.target.value });
		const postData = await getPostDetail(Number(postId));
		setPost(postData);
	};
	useEffect(() => {
		fetchPostDetail();
	}, [postId]); // eslint-disable-line react-hooks/exhaustive-deps
	if (!post) {
		return <div>Loading...</div>;
	}
	const handleUpvote = async () => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}
		const actionType = post.hasUpvote ? 'remove_upvote' : 'add_upvote';
		try {
			await interactWithPost(session.user.userId, Number(postId), actionType);
			fetchPostDetail();
		} catch (error) {
			console.error('按讚出錯', error);
		}
	};

	const handleDownvote = async () => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}
		const actionType = post.hasDownvote ? 'remove_downvote' : 'add_downvote';
		try {
			await interactWithPost(session.user.userId, Number(postId), actionType);
			fetchPostDetail();
		} catch (error) {
			console.error('按倒讚出錯', error);
		}
	};

	const handleFavorite = async () => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}
		const actionType = post.hasFavorite ? 'remove_favorite' : 'add_favorite';
		try {
			await interactWithPost(session.user.userId, Number(postId), actionType);
			fetchPostDetail();
		} catch (error) {
			console.error('收藏出錯', error);
		}
	};

	const handleSubmitComment = async () => {
		if (!session) {
			openModal('登入後才可留言哦');
			return;
		}
		if (!newComment.trim()) {
			openModal('評論不能為空');
			return;
		}

		try {
			await addCommentToPost(Number(postId), session.user.userId, newComment);
			openModal('評論成功添加！');
			setNewComment('');
			await fetchPostDetail();
		} catch (error) {
			console.error('添加評論失敗', error);
		}
	};

	const handleSubmitReply = async (commentId: number) => {
		if (!session) {
			openModal('登入後才可回覆哦');
			return;
		}
		const replyText = newReply[commentId];
		if (!replyText.trim()) {
			openModal('回覆不能為空');
			return;
		}

		try {
			await addReplyToComment(commentId, session.user.userId, replyText);
			openModal('回覆成功添加！');
			setNewReply({ ...newReply, [commentId]: '' });
			await fetchPostDetail();
		} catch (error) {
			console.error('添加回覆失敗', error);
		}
	};
	const handleCommentUpvote = async (commentId: number) => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}

		const hasUpvoted = post.comments.some((comment) => {
			if (comment.commentId === commentId && comment.hasUpvote) return true;
			const isReply = comment.replies.some((reply) => {
				if (reply.commentId === commentId && reply.hasUpvote) return true;
			});
			return isReply;
		});

		const actionType = hasUpvoted ? 'remove_upvote' : 'add_upvote';

		try {
			await interactiWithPostComment(session.user.userId, commentId, actionType);
			await fetchPostDetail();
		} catch (error) {
			console.error('按讚出错', error);
		}
	};

	const handleCommentDownvote = async (commentId: number) => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}

		const hasDownvoted = post.comments.some((comment) => {
			if (comment.commentId === commentId && comment.hasDownvote) return true;
			const isReply = comment.replies.some((reply) => {
				if (reply.commentId === commentId && reply.hasDownvote) return true;
			});
			return isReply;
		});

		const actionType = hasDownvoted ? 'remove_downvote' : 'add_downvote';

		try {
			await interactiWithPostComment(session.user.userId, commentId, actionType);
			await fetchPostDetail();
		} catch (error) {
			console.error('按倒讚出错', error);
		}
	};

	return (
		<div
			style={{
				position: 'relative',
				display: 'flex',
				justifyContent: 'center',
				width: '80%',
			}}
		>
			<a
				href="/resources"
				style={{
					position: 'absolute',
					top: '-30px',
					left: '-30px',
					margin: '10px',
					zIndex: 1000,
					textDecoration: 'none',
					color: 'inherit',
					fontSize: '40px',
				}}
			>
				<ArrowBackIcon style={{ fontSize: 'inherit' }} />
			</a>
			<Card
				sx={{
					width: '80%',
					height: 'auto',
					m: 2,
					display: 'flex',
					flexDirection: 'column',
					borderRadius: '20px',
					backgroundColor: '#FEFDFA',
					position: 'relative',
				}}
			>
				<CardContent sx={{ flex: '1 0 auto', paddingBottom: '0px' }}>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{ flexWrap: 'wrap', overflow: 'hidden' }}
					>
						<Avatar
							alt={post.posterName}
							src={post.profilePicture ? post.profilePicture : ''}
						/>
						<Typography variant="subtitle1" component="div">
							{post.posterName}
						</Typography>
						<Typography variant="body2" sx={{ marginLeft: 1 }}>
							{formattedTime}
						</Typography>
					</Stack>
					<Typography
						variant="h4"
						component="div"
						sx={{ marginTop: '10px', marginLeft: '5px', marginBottom: '10px' }}
					>
						{post.postTitle}
					</Typography>

					{maxSteps > 0 && (
						<Box>
							<SwipeableViews
								axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
								index={activeStep}
								onChangeIndex={handleStepChange}
								enableMouseEvents
							>
								{post.postImages.map((path, index) => (
									<div key={index} className="flex justify-center">
										{activeStep == index ? (
											<Box
												component="img"
												sx={{
													height: 303,
													width: 540,
													minHeight: 303,
													minWidth: 540,
													objectFit: 'cover',
													objectPosition: 'center',
													maxHeight: 303,
													maxWidth: 540,
												}}
												src={path}
												alt={'image '}
											/>
										) : null}
									</div>
								))}
							</SwipeableViews>
							<MobileStepper
								steps={maxSteps}
								position="static"
								activeStep={activeStep}
								sx={{
									bgcolor: '#FFFFFF',
									height: '25%',
								}}
								nextButton={
									<Button
										size="small"
										onClick={handleNext}
										disabled={activeStep === maxSteps - 1}
									>
										Next
										{theme.direction === 'rtl' ? (
											<KeyboardArrowLeft />
										) : (
											<KeyboardArrowRight />
										)}
									</Button>
								}
								backButton={
									<Button
										size="small"
										onClick={handleBack}
										disabled={activeStep === 0}
									>
										{theme.direction === 'rtl' ? (
											<KeyboardArrowRight />
										) : (
											<KeyboardArrowLeft />
										)}
										Back
									</Button>
								}
							/>
						</Box>
					)}
					<Typography
						variant="body1"
						color="text.main"
						component="div"
						sx={{
							lineHeight: '30px',
							fontSize: '22px',
							marginLeft: '10px',
							whiteSpace: 'pre-line',
							wordWrap: 'break-word',
						}}
					>
						{post.postContext}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							gap: 0.5,
							overflow: 'hidden',
							flexWrap: 'wrap',
							paddingLeft: '0px',
							marginLeft: '10px',
							marginTop: '10px',
						}}
					>
						{post.tags.map((tag) => (
							<Chip key={tag} label={tag} size="medium" data-tag={tag} />
						))}
					</Box>
					<Stack direction="row" spacing={1} alignItems="center">
						<IconButton
							onClick={handleUpvote}
							color={post.hasUpvote ? 'secondary' : 'default'}
						>
							<ThumbUpAltIcon />
						</IconButton>
						<Typography variant="body2">{post.upvotes}</Typography>
						<IconButton
							onClick={handleDownvote}
							color={post.hasDownvote ? 'secondary' : 'default'}
						>
							<ThumbDownAltIcon />
						</IconButton>
						<Typography variant="body2">{post.downvotes}</Typography>
						<IconButton color={post.hasComment ? 'secondary' : 'default'}>
							<CommentIcon />
						</IconButton>
						<Typography variant="body2">{post.commentsCount}</Typography>
						<IconButton
							onClick={handleFavorite}
							color={post.hasFavorite ? 'secondary' : 'default'}
						>
							<BookmarkIcon />
						</IconButton>
						<Typography variant="body2">{post.favorites}</Typography>
					</Stack>
				</CardContent>

				<CardContent sx={{ paddingTop: '5px' }}>
					<List sx={{ borderRadius: '30px' }}>
						{post.comments.map((comment, index) => (
							<React.Fragment key={comment.commentId}>
								{index >= 0 && <Divider />}
								<ListItem alignItems="flex-start">
									<ListItemAvatar>
										<Avatar
											alt={comment.commenterName}
											src={
												comment.commenterProfilePicture
													? comment.commenterProfilePicture
													: ''
											}
										/>
									</ListItemAvatar>
									<ListItemText
										primary={comment.commenterName}
										primaryTypographyProps={{ variant: 'body1' }}
										secondaryTypographyProps={{
											component: 'span',
											variant: 'body2',
											color: 'text.secondary',
											sx: { wordBreak: 'break-word', whiteSpace: 'pre-line' },
										}}
										secondary={comment.text}
									/>

									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										sx={{ marginLeft: 'auto', minWidth: '100px' }}
									>
										<IconButton
											onClick={() => handleCommentUpvote(comment.commentId)}
											color={comment.hasUpvote ? 'secondary' : 'default'}
										>
											<ThumbUpAltIcon />
										</IconButton>
										<Typography variant="body2">{comment.upvotes}</Typography>
										<IconButton
											onClick={() => handleCommentDownvote(comment.commentId)}
											color={comment.hasDownvote ? 'secondary' : 'default'}
										>
											<ThumbDownAltIcon />
										</IconButton>
										<Typography variant="body2">{comment.downvotes}</Typography>
									</Stack>
								</ListItem>

								{comment.replies &&
									comment.replies.map((reply, replyIndex) => (
										<React.Fragment key={reply.commentId}>
											{replyIndex >= 0 && (
												<Divider variant="inset" component="li" />
											)}
											<ListItem alignItems="flex-start" sx={{ pl: 8 }}>
												<ListItemAvatar>
													<Avatar
														alt={reply.commenterName}
														src={
															reply.commenterProfilePicture
																? reply.commenterProfilePicture
																: ''
														}
													/>
												</ListItemAvatar>
												<ListItemText
													primary={reply.commenterName}
													primaryTypographyProps={{ variant: 'body1' }}
													secondary={
														<Typography
															component="span"
															variant="body2"
															color="text.secondary"
															sx={{
																whiteSpace: 'pre-line',
																wordBreak: 'break-word',
															}}
														>
															{reply.text}
														</Typography>
													}
												/>

												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
													sx={{ marginLeft: 'auto', minWidth: '100px' }}
												>
													<IconButton
														onClick={() =>
															handleCommentUpvote(reply.commentId)
														}
														color={
															reply.hasUpvote
																? 'secondary'
																: 'default'
														}
													>
														<ThumbUpAltIcon />
													</IconButton>
													<Typography variant="body2">
														{reply.upvotes}
													</Typography>
													<IconButton
														onClick={() =>
															handleCommentDownvote(reply.commentId)
														}
														color={
															reply.hasDownvote
																? 'secondary'
																: 'default'
														}
													>
														<ThumbDownAltIcon />
													</IconButton>
													<Typography variant="body2">
														{reply.downvotes}
													</Typography>
												</Stack>
											</ListItem>
										</React.Fragment>
									))}
								{
									<ListItem>
										<ListItemText>
											<Stack
												direction="row"
												spacing={1}
												alignItems="center"
												sx={{ pl: 6 }}
											>
												<TextField
													fullWidth
													variant="outlined"
													label="Add a reply"
													multiline
													value={newReply[comment.commentId] || ''}
													onChange={(e) =>
														handleReplyChange(
															comment.commentId,
															e as ChangeEvent<HTMLInputElement>,
														)
													}
													color="secondary"
													sx={{
														'& .MuiOutlinedInput-root': {
															borderRadius: '20px',
														},
													}}
												/>

												<Button
													variant="contained"
													onClick={() =>
														handleSubmitReply(comment.commentId)
													}
													sx={{
														mt: 2,
														bgcolor: `${theme.palette.secondary.main} !important`,
														height: '40px',
														borderRadius: '20px',
														color: 'white',
													}}
													color="secondary"
												>
													留言
												</Button>
											</Stack>
										</ListItemText>
									</ListItem>
								}
							</React.Fragment>
						))}
						<Divider />

						{
							<ListItem>
								<ListItemText>
									<Stack direction="row" spacing={1} alignItems="center">
										<TextField
											multiline
											fullWidth
											variant="outlined"
											label="Add a comment"
											value={newComment}
											onChange={handleCommentChange}
											color="secondary"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: '20px',
													'& fieldset': {
														borderRadius: '20px',
													},
												},
											}}
										/>

										<Button
											variant="contained"
											onClick={handleSubmitComment}
											sx={{
												mt: 2,
												bgcolor: `${theme.palette.secondary.main} !important`,
												height: '40px',
												borderRadius: '20px',
												color: 'white',
											}}
											color="secondary"
										>
											留言
										</Button>
									</Stack>
								</ListItemText>
							</ListItem>
						}
					</List>
				</CardContent>
			</Card>
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
