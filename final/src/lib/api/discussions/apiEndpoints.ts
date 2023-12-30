import api from '@/lib/api/base';
import type { QuestionCardType, NewQuestionType, QuestionCardDetailType } from '@/lib/types';

export const getAllQuestions = async () => {
	try {
		const response = await api.get(`/api/questions`);
		return response.data as QuestionCardType[];
	} catch (error) {
		console.error('Error getAllQuestions :', error);
		throw error;
	}
};

export const getTop3HotQuestions = async () => {
	try {
		const response = await api.get('/api/questions/top');
		const data = response.data as QuestionCardType[];
		if (data.length > 3) {
			console.error('Data length is too long!');
		}
		return data;
	} catch (error) {
		console.error('Error getTop3HotQuestions :', error);
		throw error;
	}
};

export const getQuestionDetail = async (questionId: number) => {
	try {
		const response = await api.get(`/api/questions/${questionId}`);
		return response.data as QuestionCardDetailType;
	} catch (error) {
		console.error('Error getQuestionDetail :', error);
		throw error;
	}
};

export const addCommentToQuestion = async (
	questionId: number,
	commenterId: number,
	text: string,
) => {
	try {
		const response = await api.post(`/api/comments`, { questionId, commenterId, text });
		return response.data;
	} catch (error) {
		console.error('Error addCommentToQuestion :', error);
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
		console.error('Error addCommentToQuestion :', error);
		throw error;
	}
};

export const interactWithQuestion = async (
	userId: number,
	questionId: number,
	actionType: string,
) => {
	try {
		await api.post('/api/interactions', {
			userId,
			questionId,
			actionType,
		});
	} catch (error) {
		console.error('Error interactWithQuestion :', error);
		throw error;
	}
};

export const interactiWithQuestionComment = async (
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
		console.error('Error interactiWithQuestionComment :', error);
		throw error;
	}
};

export const addNewQuestion = async (newQuestion: NewQuestionType) => {
	try {
		await api.post('/api/questions', newQuestion);
	} catch (error) {
		console.error('Error addNewQuestion :', error);
		throw error;
	}
};

export const updateQuestionStatus = async (
	questionId: number,
	isSolved?: boolean,
	helpfulCommentId?: number,
) => {
	try {
		const body = {
			questionId: questionId,
			isSolved: isSolved || undefined,
			helpfulCommentId: helpfulCommentId || undefined,
		};
		const response = await api.put(`/api/questions/${questionId}`, body);
		return response.data;
	} catch (error) {
		console.error('Error updating question status:', error);
		throw error;
	}
};
