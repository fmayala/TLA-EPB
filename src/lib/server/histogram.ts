/*

The actual breakdown is:

0% // 0
0-9% // 1
10-19% // 2
20-29% // 3
30-39% // 4
40-49% // 5
50-59% // 6
60-69% // 7
70-79% // 8
80-89% // 9
90-99% // 10
100-109% // 11
110-119% // 12
120-129% // 13
130-139% // 14
140-149% // 15
150-174% // 16
175-199% // 17
200%+ (includes everything at or above 200%) // 18

*/

export function getBucket(percentage) {
	if (percentage === 0) {
		return 0;
	}

	if (percentage < 10) {
		return 1;
	}

	if (percentage < 20) {
		return 2;
	}

	if (percentage < 30) {
		return 3;
	}

	if (percentage < 40) {
		return 4;
	}

	if (percentage < 50) {
		return 5;
	}

	if (percentage < 60) {
		return 6;
	}

	if (percentage < 70) {
		return 7;
	}

	if (percentage < 80) {
		return 8;
	}

	if (percentage < 90) {
		return 9;
	}

	if (percentage < 100) {
		return 10;
	}

	if (percentage < 110) {
		return 11;
	}

	if (percentage < 120) {
		return 12;
	}

	if (percentage < 130) {
		return 13;
	}

	if (percentage < 140) {
		return 14;
	}

	if (percentage < 150) {
		return 15;
	}

	if (percentage < 175) {
		return 16;
	}

	if (percentage < 200) {
		return 17;
	}

	return 18;
}
