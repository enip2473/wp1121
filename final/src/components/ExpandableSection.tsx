'use client';

import React, { useState } from 'react';
import type { ReactElement } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography, Button, Box } from '@mui/material';

import type { PostCardType, QuestionCardType } from '@/lib/types';

type RenderQuestionItem = (question: QuestionCardType) => ReactElement;
type RenderPostItem = (post: PostCardType) => ReactElement;

interface ExpandableSectionProps {
	title: string;
	items: PostCardType[] | QuestionCardType[];
	renderQuestionItem?: RenderQuestionItem;
	renderPostItem?: RenderPostItem;
}

export function ExpandableSection({
	title,
	items,
	renderQuestionItem,
	renderPostItem,
}: ExpandableSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const handleToggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<>
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mt: 4,
					backgroundColor: '#FCFAF5',
				}}
			>
				<Box sx={{ width: '50%' }}></Box>
				<Typography
					variant="h5"
					component="h2"
					sx={{
						fontWeight: 'bold',
						position: 'absolute',
						width: '100%',
						textAlign: 'center',
					}}
				>
					{title}
				</Typography>
				<Box sx={{ mr: 10 }}>
					<Button onClick={handleToggleExpand}>
						{isExpanded ? (
							<>
								<span>收回</span>
								<ExpandLessIcon />
							</>
						) : (
							<>
								<span>展開</span>
								<ExpandMoreIcon />
							</>
						)}
					</Button>
				</Box>
			</Box>

			<Box
				sx={{
					width: '100%',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 1,
					display: 'grid',
					mt: 2,
				}}
			>
				{items.map(
					(item, index) =>
						(isExpanded || index < 3) &&
						('questionId' in item
							? renderQuestionItem?.(item)
							: renderPostItem?.(item)),
				)}
			</Box>
		</>
	);
}
