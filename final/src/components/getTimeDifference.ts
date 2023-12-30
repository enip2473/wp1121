export default function getTimeDifference(createdAt: string) {
	const postDate = new Date(createdAt).getTime();
	const now = new Date().getTime();
	const differenceInMilliseconds = now - postDate;

	const minutes = Math.floor(differenceInMilliseconds / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (minutes < 60) {
		return `${minutes} 分鐘前`;
	} else if (hours < 24) {
		return `${hours} 小時前`;
	} else {
		return `${days} 天前`;
	}
}
