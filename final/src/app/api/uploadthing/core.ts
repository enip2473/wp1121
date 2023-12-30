import { createUploadthing, type FileRouter } from 'uploadthing/next';

import { getSessionUserId } from '@/utils/apiAuthentication';

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 3 } })
		.middleware(async () => {
			const userId = await getSessionUserId();
			if (!userId) throw new Error('Unauthorized');

			return { userId: userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Upload complete for userId:', metadata.userId);

			console.log('file url', file.url);

			return { uploadedBy: metadata.userId };
		}),

	profileUploader: f({ image: { maxFileSize: '4MB' } })
		.middleware(async () => {
			const userId = await getSessionUserId();
			if (!userId) throw new Error('Unauthorized');
			return { userId: userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log('Upload complete for userId:', metadata.userId);
			console.log('file url', file.url);
			return { uploadedBy: metadata.userId };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
