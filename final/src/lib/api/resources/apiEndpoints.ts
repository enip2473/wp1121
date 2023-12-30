import api from '@/lib/api/base';
import type { PostCardType, NewPostType, PostCardDetailType } from '@/lib/types';

export const getAllPosts = async () => {
	try {
		const response = await api.get(`/api/posts`);
		return response.data as PostCardType[];
	} catch (error) {
		console.error('Error getAllPosts :', error);
		throw error;
	}
};

export const getTop3HotPosts = async () => {
	try {
		const response = await api.get('/api/posts/top');
		const data = response.data as PostCardType[];
		if (data.length > 3) {
			console.error('Data length is too long!');
		}
		return data;
	} catch (error) {
		console.error('Error getTop3HotPosts :', error);
		throw error;
	}
};

export const getPostDetail = async (postId: number) => {
	try {
		const response = await api.get(`/api/posts/${postId}`);
		return response.data as PostCardDetailType;
	} catch (error) {
		console.error('Error getPostDetail :', error);
		throw error;
	}
};

export const addCommentToPost = async (postId: number, commenterId: number, text: string) => {
	try {
		const response = await api.post(`/api/comments`, { postId, commenterId, text });
		return response.data;
	} catch (error) {
		console.error('Error addCommentToPost :', error);
		throw error;
	}
};

export const addReplyToComment = async (
	parentCommentId: number,
	replierId: number,
	text: string,
) => {
	try {
		await api.post('/api/comments', {
			parentCommentId,
			commenterId: replierId,
			text,
		});
	} catch (error) {
		console.error('Error addCommentToPost :', error);
		throw error;
	}
};

export const interactWithPost = async (userId: number, postId: number, actionType: string) => {
	try {
		await api.post('/api/interactions', {
			userId,
			postId,
			actionType,
		});
	} catch (error) {
		console.error('Error interactWithPost :', error);
		throw error;
	}
};

export const interactiWithPostComment = async (
	userId: number,
	commentId: number,
	actionType: string,
) => {
	try {
		await api.post('/api/interactions', {
			userId,
			commentId,
			actionType,
		});
	} catch (error) {
		console.error('Error interactiWithPostComment :', error);
		throw error;
	}
};

export const addNewPost = async (newPost: NewPostType) => {
	try {
		await api.post('/api/posts', newPost);
	} catch (error) {
		console.error('Error addNewPost :', error);
		throw error;
	}
};
