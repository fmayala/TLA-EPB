export function getBucket(percentage: number) {
	const buckets = [
		0,
		10,
		20,
		30,
		40,
		50,
		60,
		70,
		80,
		90,
		100,
		110,
		120,
		130,
		140,
		150,
		175,
		200,
		Infinity
	];
	for (let i = 1; i < buckets.length; i++) {
		if (percentage < buckets[i]) {
			return i - 1;
		}
	}
	return buckets.length - 1;
}
