import React, { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Card, CardContent, Typography, Avatar, Chip, Stack, Box } from '@mui/material';

import type { QuestionCardType } from '@/lib/types';

import getTimeDifference from './getTimeDifference';

function QuestionCard(question: QuestionCardType) {
	const [visibleTags, setVisibleTags] = useState<string[]>(question.tags);
	const tagContainerRef = useRef<HTMLDivElement>(null);
	const formattedTime = getTimeDifference(question.createdAt);
	const router = useRouter();
	useEffect(() => {
		const updateVisibleTags = () => {
			const container = tagContainerRef.current;
			if (container) {
				const visibleWidth = container.offsetWidth;
				let accumulatedWidth = 0;
				const newVisibleTags: string[] = [];

				question.tags.forEach((tag) => {
					const tagElement = container.querySelector(
						`[data-tag="${tag}"]`,
					) as HTMLElement;
					if (tagElement) {
						const tagWidth = tagElement.offsetWidth;
						accumulatedWidth += tagWidth + 2;
						if (accumulatedWidth <= visibleWidth) {
							newVisibleTags.push(tag);
						}
					}
				});

				setVisibleTags(newVisibleTags);
			}
		};

		window.addEventListener('resize', updateVisibleTags);
		updateVisibleTags();

		return () => {
			window.removeEventListener('resize', updateVisibleTags);
		};
	}, [question.tags]);
	const handleCardClick = () => {
		router.push(`/discussions/question/${question.questionId}`);
	};
	return (
		<Card
			onClick={handleCardClick}
			sx={{
				minWidth: 330,
				maxWidth: 330,
				m: 2,
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '5px',
				backgroundColor: '#FEFDFA',
				position: 'relative',
				cursor: 'pointer',
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: '15px',
					backgroundColor: question.isSolved ? '#C0EDCA' : '#EDC0C0',
				},
				'&:hover': {
					boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
				},
			}}
		>
			<CardContent sx={{ flex: '1 0 auto', paddingLeft: '30px' }}>
				<Stack
					direction="row"
					spacing={2}
					alignItems="center"
					sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}
				>
					<Avatar alt={question.questionerName} src={question.profilePicture} />
					<Typography variant="subtitle1" component="div" noWrap>
						{question.questionerName}
					</Typography>
					<Typography variant="body2" sx={{ marginLeft: 1 }}>
						{formattedTime}
					</Typography>
				</Stack>
				<Typography
					variant="h6"
					component="div"
					noWrap
					sx={{ paddingTop: '5px', fontWeight: '500' }}
				>
					{question.questionTitle}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						lineHeight: '20px',
						height: '25px',
						paddingLeft: '1px',
						paddingTop: '5px',
					}}
				>
					{question.questionContext}
				</Typography>
				<Box
					ref={tagContainerRef}
					sx={{ display: 'flex', gap: 0.5, overflow: 'hidden', paddingTop: '10px' }}
				>
					{visibleTags.map((tag) => (
						<Chip key={tag} label={tag} size="small" data-tag={tag} />
					))}
				</Box>
			</CardContent>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{ p: 2, pl: 4, pt: 0, mt: 'auto' }}
			>
				<FavoriteIcon sx={{ color: '#EDC0C0' }} />
				<Typography variant="body2">{question.upvotes}</Typography>

				<CommentIcon sx={{ color: '#C0DCED' }} />
				<Typography variant="body2">{question.commentsCount}</Typography>
				<BookmarkIcon sx={{ color: '#D2C0ED' }} />
				<Typography variant="body2">{question.favorites}</Typography>
			</Stack>
		</Card>
	);
}

export default QuestionCard;
