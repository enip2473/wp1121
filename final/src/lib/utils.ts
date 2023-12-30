import moment from 'moment-timezone';

export function isSameDateInUTC8(date1: Date, date2: Date): boolean {
	const format = 'YYYY-MM-DD';
	const d1 = moment(date1).tz('Asia/Shanghai').format(format);
	const d2 = moment(date2).tz('Asia/Shanghai').format(format);
	return d1 === d2;
}
