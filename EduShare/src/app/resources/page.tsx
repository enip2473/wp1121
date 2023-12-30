'use client';

import React, { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';

import PostCard from '../../components/PostCard';
import TagsSelector from '../../components/TagsSelector';
import { getAllPosts, getTop3HotPosts } from '../../lib/api/resources/apiEndpoints';
import { getAllTags } from '../../lib/api/tags/apiEndpoints';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTheme, Fab, Box, Button, Dialog, TextField, Chip, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import type { PostCardType } from '@/lib/types';

function Page() {
	const theme = useTheme();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<PostCardType[]>([]);
	const [posts, setPosts] = useState<PostCardType[]>([]);
	const [hotPosts, setHotPosts] = useState<PostCardType[]>([]);
	const [searchInput, setSearchInput] = useState('');

	const [tags, setTags] = useState<string[]>([]);
	const { data: session } = useSession();

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

	const handleCreatePostClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!session) {
			openModal('登入後才可發文哦');
			event.preventDefault();
		}
	};
	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);
	const handleSave = (selected: string[]) => {
		setSelectedTags(selected);
		handleCloseModal();
	};

	useEffect(() => {
		async function fetchTags() {
			try {
				const fetchedTags = await getAllTags();
				setTags(fetchedTags);
			} catch (error) {
				console.error('Error fetching tags:', error);
			}
		}
		fetchTags();
	}, []);
	useEffect(() => {
		async function fetchData() {
			try {
				const allPosts = await getAllPosts();
				const topHotPosts = await getTop3HotPosts();
				setPosts(allPosts);
				setFilteredPosts(allPosts);
				setHotPosts(topHotPosts);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		}
		fetchData();
	}, []);

	useEffect(() => {
		const filterByTags =
			selectedTags.length > 0
				? (post: PostCardType) =>
						selectedTags.every((tagName) => post.tags.includes(tagName))
				: (_: PostCardType) => true;
		const filterBySearch = (post: PostCardType) =>
			post.postTitle.toLowerCase().startsWith(searchInput.toLowerCase());

		const newFilteredPosts = posts.filter(
			(post: PostCardType) => filterByTags(post) && filterBySearch(post),
		);
		setFilteredPosts(newFilteredPosts);
	}, [selectedTags, searchInput, posts]);
	useEffect(() => {
		const sortedPosts = [...posts];

		switch (sortMethod) {
			case 'lovesHighToLow':
				sortedPosts.sort((a, b) => b.upvotes - a.upvotes);
				break;
			case 'lovesLowToHigh':
				sortedPosts.sort((a, b) => a.upvotes - b.upvotes);
				break;
			case 'newToOld':
				sortedPosts.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
				break;
			case 'oldToNew':
				sortedPosts.sort(
					(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				);
				break;
			default:
		}

		const filterByTags =
			selectedTags.length > 0
				? (post: PostCardType) =>
						selectedTags.every((tagName) => post.tags.includes(tagName))
				: (_: PostCardType) => true;

		const filterBySearch = (post: PostCardType) =>
			searchInput === '' || post.postTitle.toLowerCase().includes(searchInput.toLowerCase());

		const newFilteredPosts = sortedPosts.filter(
			(post: PostCardType) => filterByTags(post) && filterBySearch(post),
		);

		setFilteredPosts(newFilteredPosts);
	}, [selectedTags, searchInput, posts, sortMethod]);
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
					本日熱門文章
				</p>
				<LocalFireDepartmentIcon sx={{ color: '#E09090', fontSize: '40px', ml: 1 }} />
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
				{hotPosts.map((post, index) => (
					<PostCard key={index} {...post} />
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
					所有文章
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
					<MenuItem value="lovesHighToLow">讚數由高到低</MenuItem>
					<MenuItem value="lovesLowToHigh">讚數由低到高</MenuItem>
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
				<TagsSelector tags={tags} onSave={handleSave} onCancel={handleCloseModal} />{' '}
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
				{filteredPosts.map((post, index) => (
					<PostCard key={index} {...post} />
				))}
			</Box>
			{session && (
				<a
					href="/resources/post/new"
					style={{ textDecoration: 'none' }}
					onClick={handleCreatePostClick}
				>
					<Fab
						color="secondary"
						aria-label="我要發文"
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
