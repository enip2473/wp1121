'use client';

import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import SwipeableViews from 'react-swipeable-views';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

import getTimeDifference from '../../../../components/getTimeDifference';
import {
	getQuestionDetail,
	addCommentToQuestion,
	addReplyToComment,
	interactWithQuestion,
	interactiWithQuestionComment,
	updateQuestionStatus,
} from '../../../../lib/api/discussions/apiEndpoints';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import {
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
	Dialog,
	DialogContent,
	DialogActions,
	DialogTitle,
	DialogContentText,
} from '@mui/material';
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
import MobileStepper from '@mui/material/MobileStepper';

import type { QuestionCardDetailType } from '@/lib/types';

function Page() {
	const theme = useTheme();

	const { data: session } = useSession();

	const [question, setQuestion] = useState<QuestionCardDetailType | null>(null);
	const { questionId } = useParams<{ questionId: string }>();
	const [newComment, setNewComment] = useState('');
	const [newReply, setNewReply] = useState<{ [commentId: number]: string }>({});
	const [formattedTime, setFormattedTime] = useState('');
	const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
	const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
	const [selectedCommenterId, setSelectedCommenterId] = useState<number | null>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [maxSteps, setMaxSteps] = useState(0);
	const [isSolved, setIsSolved] = useState(false);
	const [openSolvedDialog, setOpenSolvedDialog] = useState(false);
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
	const fetchQuestionDetail = async () => {
		if (questionId) {
			try {
				const questionData = await getQuestionDetail(Number(questionId));
				setQuestion(questionData);
				setIsSolved(questionData.isSolved);
				setFormattedTime(getTimeDifference(questionData.createdAt));
				setMaxSteps(questionData.questionImages.length);
			} catch (error) {
				console.error('Error fetching question detail:', error);
			}
		}
	};
	const handleCommentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setNewComment(event.target.value);
		const questionData = await getQuestionDetail(Number(questionId));
		setQuestion(questionData);
	};
	const markAsBestAnswer = async (commentId: number) => {
		try {
			await updateQuestionStatus(Number(questionId), undefined, commentId);
			openModal('留言已標記為最佳解答');
			setOpenConfirmDialog(false);
			fetchQuestionDetail();
		} catch (error) {
			console.error('Error marking best answer:', error);
		}
	};

	const handleReplyChange = async (
		commentId: number,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setNewReply({ ...newReply, [commentId]: event.target.value });
		const questionData = await getQuestionDetail(Number(questionId));
		setQuestion(questionData);
	};
	useEffect(() => {
		fetchQuestionDetail();
	}, [questionId]); // eslint-disable-line react-hooks/exhaustive-deps
	if (!question) {
		return <div>Loading...</div>;
	}

	const handleUpvote = async () => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}
		const actionType = question.hasUpvote ? 'remove_upvote' : 'add_upvote';
		try {
			await interactWithQuestion(session.user.userId, Number(questionId), actionType);
			fetchQuestionDetail();
		} catch (error) {
			console.error('按讚出錯', error);
		}
	};

	const handleFavorite = async () => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}
		const actionType = question.hasFavorite ? 'remove_favorite' : 'add_favorite';
		try {
			await interactWithQuestion(session.user.userId, Number(questionId), actionType);
			fetchQuestionDetail();
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
			await addCommentToQuestion(Number(questionId), session.user.userId, newComment);
			openModal('評論成功添加！');
			setNewComment('');
			await fetchQuestionDetail();
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
			await fetchQuestionDetail();
		} catch (error) {
			console.error('添加回覆失敗', error);
		}
	};
	const handleCommentUpvote = async (commentId: number) => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}

		const actionType = question.comments.find((c) => c.commentId === commentId)?.hasUpvote
			? 'remove_upvote'
			: 'add_upvote';

		try {
			await interactiWithQuestionComment(session.user.userId, commentId, actionType);
			await fetchQuestionDetail();
		} catch (error) {
			console.error('按讚出错', error);
		}
	};

	const handleCommentDownvote = async (commentId: number) => {
		if (!session) {
			openModal('登入後才可使用此功能');
			return;
		}

		const actionType = question.comments.find((c) => c.commentId === commentId)?.hasDownvote
			? 'remove_downvote'
			: 'add_downvote';

		try {
			await interactiWithQuestionComment(session.user.userId, commentId, actionType);
			await fetchQuestionDetail();
		} catch (error) {
			console.error('按倒讚出错', error);
		}
	};
	const handleMarkAsSolved = async () => {
		try {
			await updateQuestionStatus(question.questionId, true);
			setIsSolved(true);
			setOpenSolvedDialog(false);
		} catch (error) {
			console.error('Error marking question as solved:', error);
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
				href="/discussions"
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
				{session?.user.userId === question.questionerId && (
					<IconButton
						sx={{ position: 'absolute', top: 8, right: 8 }}
						onClick={() => setOpenSolvedDialog(true)}
						disabled={isSolved}
					>
						<DoneIcon
							sx={{ color: isSolved ? theme.palette.secondary.main : 'grey' }}
						/>
					</IconButton>
				)}
				<CardContent sx={{ flex: '1 0 auto', paddingBottom: '0px' }}>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{ flexWrap: 'wrap', overflow: 'hidden' }}
					>
						<Avatar
							alt={question.questionerName}
							src={question.profilePicture ? question.profilePicture : ''}
						/>
						<Typography variant="subtitle1" component="div">
							{question.questionerName}
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
						{question.questionTitle}
					</Typography>

					{maxSteps > 0 && (
						<Box>
							<SwipeableViews
								axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
								index={activeStep}
								onChangeIndex={handleStepChange}
								enableMouseEvents
							>
								{question.questionImages.map((path, index) => (
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
										下一頁
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
										上一頁
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
						{question.questionContext}
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
							marginBottom: '10px',
						}}
					>
						{question.tags.map((tag) => (
							<Chip key={tag} label={tag} size="medium" data-tag={tag} />
						))}
					</Box>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ marginTop: '10px' }}
					>
						<IconButton
							onClick={handleUpvote}
							color={question.hasUpvote ? 'secondary' : 'default'}
						>
							<FavoriteIcon />
						</IconButton>
						<Typography variant="body2">{question.upvotes}</Typography>

						<IconButton color={question.hasComment ? 'secondary' : 'default'}>
							<CommentIcon />
						</IconButton>
						<Typography variant="body2">{question.commentsCount}</Typography>
						<IconButton
							onClick={handleFavorite}
							color={question.hasFavorite ? 'secondary' : 'default'}
						>
							<BookmarkIcon />
						</IconButton>
						<Typography variant="body2">{question.favorites}</Typography>
					</Stack>
				</CardContent>
				<CardContent sx={{ paddingTop: '5px' }}>
					<List sx={{ borderRadius: '30px' }}>
						{question.comments.map((comment, index) => (
							<React.Fragment key={comment.commentId}>
								{index >= 0 && <Divider />}
								<ListItem alignItems="flex-start">
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										{comment.isHelpful ? (
											<CheckCircleIcon
												sx={{
													color: '#C0EDD4',
													marginRight: 2,
													marginTop: '8px',
												}}
											/>
										) : (
											<div style={{ width: 24, marginRight: 15 }} />
										)}
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
									</Box>
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
										sx={{ marginLeft: 'auto' }}
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
										{session?.user.userId === question.questionerId &&
											!question.hasHelpfulComment && (
												<IconButton
													onClick={() => {
														setOpenConfirmDialog(true);
														setSelectedCommentId(comment.commentId);
														setSelectedCommenterId(comment.commenterId);
													}}
												>
													<MoreVertIcon />
												</IconButton>
											)}
									</Stack>
								</ListItem>

								{comment.replies &&
									comment.replies.map((reply, replyIndex) => (
										<React.Fragment key={reply.commentId}>
											{replyIndex >= 0 && (
												<Divider variant="inset" component="li" />
											)}
											<ListItem alignItems="flex-start" sx={{ pl: 8 }}>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													{reply.isHelpful ? (
														<CheckCircleIcon
															sx={{
																color: '#C0EDD4',
																marginRight: 2,
																marginTop: '8px',
															}}
														/>
													) : (
														<div
															style={{ width: 24, marginRight: 16 }}
														/>
													)}
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
												</Box>
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
													{session?.user.userId ===
														question.questionerId &&
														!question.hasHelpfulComment && (
															<IconButton
																onClick={() => {
																	setOpenConfirmDialog(true);
																	setSelectedCommentId(
																		reply.commentId,
																	);
																	setSelectedCommenterId(
																		reply.commenterId,
																	);
																}}
															>
																<MoreVertIcon />
															</IconButton>
														)}
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
												sx={{ ml: 6 }}
											>
												<TextField
													fullWidth
													variant="outlined"
													label="Add a reply"
													value={newReply[comment.commentId] || ''}
													onChange={(e) =>
														handleReplyChange(
															comment.commentId,
															e as ChangeEvent<HTMLInputElement>,
														)
													}
													multiline
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
											fullWidth
											variant="outlined"
											label="Add a comment"
											value={newComment}
											onChange={handleCommentChange}
											color="secondary"
											multiline
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
				open={openConfirmDialog}
				onClose={() => setOpenConfirmDialog(false)}
				PaperProps={{ sx: { borderRadius: '10px', backgroundColor: '#FEFDFA' } }}
			>
				{session?.user.userId !== selectedCommenterId && (
					<>
						<DialogContent>
							<Typography>
								是否將這則留言標記為最佳解答？標記後不能再更改。
							</Typography>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setOpenConfirmDialog(false)}>取消</Button>
							<Button
								onClick={() => {
									if (selectedCommentId !== null) {
										markAsBestAnswer(selectedCommentId);
									}
								}}
							>
								確認
							</Button>
						</DialogActions>
					</>
				)}
				{session?.user.userId === selectedCommenterId && (
					<>
						<DialogContent>
							<Typography>不能將自己的留言標記為最佳解答哦！</Typography>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setOpenConfirmDialog(false)}>關閉</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
			<Dialog
				open={openSolvedDialog}
				onClose={() => setOpenSolvedDialog(false)}
				PaperProps={{ sx: { borderRadius: '10px', backgroundColor: '#FEFDFA' } }}
			>
				<DialogContent>
					<Typography>是否將這個問題標記為已解決？標記後不能再更改。</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenSolvedDialog(false)}>取消</Button>
					<Button onClick={() => handleMarkAsSolved()}>確認</Button>
				</DialogActions>
			</Dialog>
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
