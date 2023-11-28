export function getBucket(percentage) {
    if (percentage >= 200) {
        return 18; // 200%+ goes to the last bucket
    }
    if (percentage === 0) {
        return 0; // 0% goes to the first bucket
    }

	const bucket = Math.floor(percentage / 10);

	if (bucket > 18) {
		return 18;
	}

	// Other percentages are divided into 10% ranges, make sure its an integer
    return bucket;
}
