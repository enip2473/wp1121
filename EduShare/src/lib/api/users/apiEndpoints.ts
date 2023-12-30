import api from '@/lib/api/base';
import type { QuestionCardType, PostCardType, NewUserInfoType, UserInfoType } from '@/lib/types';

export const getUserInfo = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}`);
		return response.data as UserInfoType;
	} catch (error) {
		console.error('Error getPost :', error);
		throw error;
	}
};

export const getUserPosts = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}/posts`);
		return response.data as PostCardType[];
	} catch (error) {
		console.error('Error getPost :', error);
		throw error;
	}
};

export const getUserFavoritePosts = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}/favoritePosts`);
		return response.data as PostCardType[];
	} catch (error) {
		console.error('Error getPost :', error);
		throw error;
	}
};

export const getUserQuestions = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}/questions`);
		return response.data as QuestionCardType[];
	} catch (error) {
		console.error('Error getQuestion :', error);
		throw error;
	}
};

export const getUserFavoriteQuestions = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}/favoriteQuestions`);
		return response.data as QuestionCardType[];
	} catch (error) {
		console.error('Error getQuestion :', error);
		throw error;
	}
};

export const updateUserInfo = async (newUserInfo: NewUserInfoType) => {
	try {
		const requestBody = newUserInfo;
		const response = await api.put(`/api/users/${newUserInfo.userId}`, requestBody);
		return response.data;
	} catch (error) {
		console.error('Error updating user info:', error);
		throw error;
	}
};

export const updateUserPoints = async (userId: number, pointsDiff: number) => {
	try {
		const requestBody = {
			userId,
			pointsDiff,
		};
		const response = await api.put(`/api/users/points`, requestBody);
		return response.data;
	} catch (error) {
		console.error('Error updating user points:', error);
		throw error;
	}
};

export const dailySign = async (userId: number) => {
	try {
		const response = await api.put(`/api/users/${userId}/dailySign`);
		return response.data;
	} catch (error) {
		console.error('Error daily sign:', error);
		throw error;
	}
};

export const getNotifications = async (userId: number) => {
	try {
		const response = await api.get(`/api/users/${userId}/notifications`);
		return response.data;
	} catch (error) {
		console.error('Error getting notifications:', error);
		throw error;
	}
};
