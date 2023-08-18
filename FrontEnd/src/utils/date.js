export function dateDiff(date1, date2) {
	let diff = Math.floor(date1.getTime() - date2.getTime());
	let day = 1000 * 60 * 60 * 24;

	let days = Math.floor(diff / day);
	let months = Math.floor(days / 31);
	let years = Math.floor(months / 12);

	if (years) {
		return `${years} years`;
	} else if (months) {
		return `${months} months`;
	} else {
		return `${days} days`;
	}
}
