'use client';

import React, { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';

import QuestionCard from '../../components/QuestionCard';
import TagsSelector from '../../components/TagsSelector';
import { getAllQuestions, getTop3HotQuestions } from '../../lib/api/discussions/apiEndpoints';
import { getAllTags } from '../../lib/api/tags/apiEndpoints';
import { getUserInfo } from '../../lib/api/users/apiEndpoints';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { Box, Button, Dialog, TextField, Chip, Typography, Fab, useTheme } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import type { QuestionCardType, UserInfoType } from '@/lib/types';

function Page() {
	const theme = useTheme();
	const { data: session } = useSession();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filteredQuestions, setFilteredQuestions] = useState<QuestionCardType[]>([]);
	const [questions, setQuestions] = useState<QuestionCardType[]>([]);
	const [hotQuestions, setHotQuestions] = useState<QuestionCardType[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');
	const [sortMethod, setSortMethod] = useState('');

	const openModal = (content: string) => {
		setModalContent(content);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};
	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);
	const handleSave = (selected: string[]) => {
		setSelectedTags(selected);
		handleCloseModal();
	};

	const handleCreateQuestionClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!session) {
			openModal('登入後才可發問哦');
			event.preventDefault();
			return;
		}

		try {
			const userInfo: UserInfoType = await getUserInfo(session.user.userId);
			if (userInfo.points < 3) {
				openModal('點數不足三點，幫忙回答別人問題或分享技術文章來獲取點數吧！');
				event.preventDefault();
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
			openModal('無法獲取用戶信息，請稍後重試。');
			event.preventDefault();
		}
	};

	useEffect(() => {
		const fetchQuestionsAndTags = async () => {
			try {
				const questions = await getAllQuestions();
				const hotQs = await getTop3HotQuestions();
				const fetchedTags = await getAllTags();
				setQuestions(questions);
				setFilteredQuestions(questions);
				setHotQuestions(hotQs);
				setTags(fetchedTags);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		fetchQuestionsAndTags();
	}, []);

	useEffect(() => {
		let sortedQuestions = [...questions];

		switch (sortMethod) {
			case 'solved':
				sortedQuestions = sortedQuestions.filter((q) => q.isSolved);
				break;
			case 'unsolved':
				sortedQuestions = sortedQuestions.filter((q) => !q.isSolved);
				break;
			case 'lovesHighToLow':
				sortedQuestions.sort((a, b) => b.upvotes - a.upvotes);
				break;
			case 'lovesLowToHigh':
				sortedQuestions.sort((a, b) => a.upvotes - b.upvotes);
				break;
			case 'newToOld':
				sortedQuestions.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
				break;
			case 'oldToNew':
				sortedQuestions.sort(
					(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				);
				break;
			default:
		}

		const filterByTags =
			selectedTags.length > 0
				? (question: QuestionCardType) =>
						selectedTags.every((tagName) => question.tags.includes(tagName))
				: (_: QuestionCardType) => true;

		const filterBySearch = (question: QuestionCardType) =>
			searchInput === '' ||
			question.questionTitle.toLowerCase().includes(searchInput.toLowerCase());

		const newFilteredQuestions = sortedQuestions.filter(
			(question: QuestionCardType) => filterByTags(question) && filterBySearch(question),
		);

		setFilteredQuestions(newFilteredQuestions);
	}, [selectedTags, searchInput, questions, sortMethod]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchInput(event.target.value);
	};

	return (
		<>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<p
					style={{
						fontWeight: 'bold',
						color: '#24282D',
						fontSize: '24px',
						textAlign: 'center',
					}}
				>
					本日熱門問題
				</p>
				<LocalFireDepartmentIcon sx={{ color: '#E3A0A0', fontSize: '40px', ml: 1 }} />
			</Box>

			<Box
				sx={{
					height: '90%',
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 1,
					width: '100%',
				}}
			>
				{hotQuestions.map((question) => (
					<QuestionCard key={question.questionId} {...question} />
				))}
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: '30px',
				}}
			>
				<p
					style={{
						fontWeight: 'bold',
						color: '#24282D',
						fontSize: '24px',
						textAlign: 'center',
					}}
				>
					所有問題
				</p>
				<ArticleIcon sx={{ color: '#9FAAE3', fontSize: '40px', ml: 1 }} />
			</Box>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					mt: 4,
					mb: 4,
				}}
			>
				<TextField
					fullWidth
					color="secondary"
					placeholder="Search..."
					value={searchInput}
					onChange={handleSearchChange}
					sx={{ flexGrow: 1 }}
					InputProps={{
						style: { borderRadius: '15px', height: '40px' },
					}}
				/>
				<Select
					color="secondary"
					value={sortMethod}
					onChange={(event) => setSortMethod(event.target.value as string)}
					displayEmpty
					inputProps={{ 'aria-label': 'Without label' }}
					sx={{
						width: 200,
						height: '38px',
						borderRadius: '10px',
						bgcolor: `${theme.palette.secondary.main} !important`,
						border: 'none',
						'& .MuiOutlinedInput-notchedOutline': {
							border: 'none',
						},
						'&:focus': {
							border: 'none',
						},
						'&:hover': {
							border: 'none',
						},
					}}
				>
					<MenuItem value="">選擇排序方式</MenuItem>
					<MenuItem value="solved">只顯示已解決的問題</MenuItem>
					<MenuItem value="unsolved">只顯示未解決的問題</MenuItem>
					<MenuItem value="lovesHighToLow">愛心由高到低</MenuItem>
					<MenuItem value="lovesLowToHigh">愛心由低到高</MenuItem>
					<MenuItem value="newToOld">由新到舊</MenuItem>
					<MenuItem value="oldToNew">由舊到新</MenuItem>
				</Select>

				<Button
					variant="contained"
					onClick={handleOpenModal}
					color="secondary"
					sx={{
						bgcolor: `${theme.palette.secondary.main} !important`,
						borderRadius: '10px',
						height: '35px',
						width: '105px',
						minWidth: '105px',
					}}
				>
					<Typography variant="body1" style={{ fontSize: '18px' }}>
						{selectedTags.length > 0 ? '所選分類' : '選擇分類'}
					</Typography>
				</Button>
				{selectedTags.map((tag) => (
					<Chip
						key={tag}
						label={<Typography style={{ fontSize: '18px' }}>{tag}</Typography>}
					/>
				))}
			</Box>
			<Dialog open={isModalOpen} onClose={handleCloseModal}>
				<TagsSelector tags={tags} onSave={handleSave} onCancel={handleCloseModal} />
			</Dialog>
			<Box
				sx={{
					height: '90%',
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 1,
					width: '100%',
				}}
			>
				{filteredQuestions.map((question) => (
					<QuestionCard key={question.questionId} {...question} />
				))}
			</Box>
			{session && (
				<a
					href="/discussions/question/new"
					style={{ textDecoration: 'none' }}
					onClick={handleCreateQuestionClick}
				>
					<Fab
						color="secondary"
						aria-label="我要發問"
						sx={{
							position: 'fixed',
							bottom: 20,
							right: 20,
							backgroundColor: '#BFD1ED !important',
						}}
					>
						<CreateIcon />
					</Fab>
				</a>
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
		</>
	);
}

export default Page;
