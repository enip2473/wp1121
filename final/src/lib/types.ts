export type PostCardType = {
	postId: number;
	postTitle: string;
	postContext: string;
	postImages: string[];
	posterId: number;
	posterName: string;
	profilePicture: string | null;
	upvotes: number;
	downvotes: number;
	commentsCount: number;
	favorites: number;
	tags: string[];
	createdAt: string;
};
export type Comment = {
	commentId: number;
	commenterId: number;
	commenterName: string;
	commenterProfilePicture: string | null | undefined;
	upvotes: number;
	hasUpvote: boolean;
	downvotes: number;
	hasDownvote: boolean;
	text: string;
	isHelpful: boolean;
	createdAt: string;
	replies: ReplyType[];
};
export type ReplyType = Omit<Comment, 'replies'>;
export type PostCardDetailType = {
	postId: number;
	postTitle: string;
	postContext: string;
	postImages: string[];
	posterId: number;
	posterName: string;
	profilePicture: string | null | undefined;
	tags: string[];
	createdAt: string;
	upvotes: number;
	hasUpvote: boolean;
	downvotes: number;
	hasDownvote: boolean;
	favorites: number;
	hasFavorite: boolean;
	commentsCount: number;
	comments: Comment[];
	hasComment: boolean;
};
export type NewPostType = {
	postTitle: string;
	postContext: string;
	posterId: number;
	postImages: string[];
	tags: string[];
};

export type NewQuestionType = {
	questionTitle: string;
	questionContext: string;
	questionerId: number;
	questionImages: string[];
	tags: string[];
};

export type QuestionCardType = {
	questionId: number;
	questionTitle: string;
	questionContext: string;
	questionImages: string[];
	questionerId: number;
	questionerName: string;
	profilePicture: string;
	upvotes: number;
	commentsCount: number;
	favorites: number;
	isSolved: boolean;
	tags: string[];
	createdAt: string;
};
export type QuestionCardDetailType = {
	questionId: number;
	questionTitle: string;
	questionContext: string;
	questionImages: string[];
	questionerId: number;
	questionerName: string;
	profilePicture: string | null | undefined;
	tags: string[];
	createdAt: string;
	upvotes: number;
	hasUpvote: boolean;
	favorites: number;
	hasFavorite: boolean;
	isSolved: boolean;
	commentsCount: number;
	comments: Comment[];
	hasComment: boolean;
	hasHelpfulComment: boolean;
};
export type NotificationType = {
	notificationId: number;
	notificationType: string;
	userId: number;
	postTitle: string | null;
	questionTitle: string | null;
	isRead: boolean;
	createdAt: string;
	postId: number | null;
	questionId: number | null;
	lastNotifyUserId: number;
	lastNotifyUsername: string;
};

export type NewCommentType = {
	postId?: number;
	commenterId: number;
	commenterName: string;
	text: string;
};

export type NewUserInfoType = {
	userId: number;
	newName?: string;
	newProfilePicture?: string;
	currentPassword?: string;
	newPassword?: string;
};

export type UserInfoType = {
	userId: number;
	name: string;
	email: string;
	profilePicture: string | null;
	resumeFile: string;
	points: number;
	hearts: number;
	upvotes: number;
	downvotes: number;
	favorites: number;
	checkmarks: number;
	hasSigned: boolean;
};
