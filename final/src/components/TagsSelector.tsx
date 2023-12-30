import React, { useState } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Chip } from '@mui/material';
import { Box } from '@mui/system';

interface TagsSelectorProps {
	tags: string[];
	onSave: (selected: string[]) => void;
	onCancel: () => void;
}

function TagsSelector({ tags, onSave, onCancel }: TagsSelectorProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const toggleTag = (tagName: string) => {
		if (selectedTags.includes(tagName)) {
			setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
		} else if (selectedTags.length < 5) {
			setSelectedTags([...selectedTags, tagName]);
		}
	};

	const isTagSelected = (tagName: string) => {
		return selectedTags.includes(tagName);
	};

	const onSaveClicked = () => {
		onSave(selectedTags);
	};

	return (
		<Dialog
			open
			onClose={onCancel}
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '30px',
					backgroundColor: '#FEFDFA',
				},
			}}
		>
			<DialogTitle
				color="primary"
				sx={{
					fontWeight: 'bold',
					fontSize: '22px',
					textAlign: 'center',
				}}
			>
				選擇分類
			</DialogTitle>
			<DialogContent>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 0.5,
						justifyContent: 'center',
						alignItems: 'center',
						padding: 1,
					}}
				>
					{tags.map((tagName) => (
						<Chip
							label={tagName}
							key={tagName}
							clickable
							onClick={() => toggleTag(tagName)}
							variant={isTagSelected(tagName) ? 'filled' : 'outlined'}
							sx={{
								bgcolor: isTagSelected(tagName) ? 'secondary.main' : '#EBEBEB',
								color: isTagSelected(tagName) ? 'common.black' : 'common.black',
								'&:hover': {
									bgcolor: 'secondary.light',
								},
								borderColor: isTagSelected(tagName) ? 'secondary.main' : '#EBEBEB',
								borderWidth: '1px',
							}}
						/>
					))}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>取消</Button>
				<Button onClick={onSaveClicked}>儲存</Button>
			</DialogActions>
		</Dialog>
	);
}

export default TagsSelector;
