export const randBetween = (max, min = 1n) => {
	if (max <= 0n || min < 0n || max <= min) {
		throw new RangeError(
			"Arguments MUST be: max > 0 && min >=0 && max > min"
		);
	}

	const interval = max - min;
	const bitLen = bitLength(interval);
	let rnd;
	do {
		const buff = randBitsSync(bitLen);
		rnd = fromBuffer(buff);
	} while (rnd > interval);

	return rnd + min;
};

const fromBuffer = (buff) => {
	let num = 0n;
	for (const i of buff.values()) {
		const bi = BigInt(i);
		num = (num << BigInt(8)) + bi;
	}

	return num;
};

const randBitsSync = (bitLength, forceLength = false) => {
	const byteLength = Math.ceil(bitLength / 8);
	const rndBytes = randBytesSync(byteLength, false);
	const bitLengthMod8 = bitLength % 8;

	if (bitLengthMod8) {
		rndBytes[0] = rndBytes[0] & (2 ** bitLengthMod8 - 1);
	}
	if (forceLength) {
		const mask = bitLengthMod8 ? 2 ** (bitLengthMod8 - 1) : 128;
		rndBytes[0] = rndBytes[0] | mask;
	}

	return rndBytes;
};

const randBytesSync = (byteLength, forceLength = false) => {
	if (byteLength < 1) {
		throw new RangeError("Bytelength must be > 0");
	}
	const buff = new Uint8Array(byteLength);
	window.crypto.getRandomValues(buff);
	if (forceLength) {
		buff[0] = buff[0] | 128;
	}

	return buff;
};

const bitLength = (a) => {
	a = BigInt(a);
	if (a === 1n) {
		return 1;
	}
	let bits = 1;
	do {
		bits++;
	} while ((a >>= 1n) > 1n);
	return bits;
};

export const modInv = (a, n) => {
	const egcd = eGcd(toZn(a, n), n);
	if (egcd.g !== 1n) {
		throw new RangeError("No Inverse Modulo");
	} else {
		return toZn(egcd.x, n);
	}
};

const toZn = (a, n) => {
	n = BigInt(n);
	if (n <= 0) {
		return NaN;
	}

	a = BigInt(a) % n;
	return a < 0 ? a + n : a;
};

export const eGcd = (a, b) => {
	a = BigInt(a);
	b = BigInt(b);
	if ((a <= 0n) | (b <= 0n)) {
		throw new RangeError("a and b MUST be > 0");
	}

	let x = 0n;
	let y = 1n;
	let u = 1n;
	let v = 0n;

	while (a !== 0n) {
		const q = b / a;
		const r = b % a;
		const m = x - u * q;
		const n = y - v * q;
		b = a;
		a = r;
		x = u;
		y = v;
		u = m;
		v = n;
	}
	return {
		g: b,
		x: x,
		y: y,
	};
};

const abs = (a) => {
	a = BigInt(a);
	return a >= 0n ? a : -a;
};

export const modPow = (b, e, n) => {
	n = BigInt(n);
	if (n === 0n) {
		throw new RangeError("n must be > 0");
	} else if (n === 1n) {
		return BigInt(0);
	}
	b = toZn(b, n);
	e = BigInt(e);
	if (e < 0n) {
		return modInv(modPow(b, abs(e), n), n);
	}

	let r = 1n;
	while (e > 0) {
		if (e % 2n === 1n) {
			r = (r * b) % n;
		}
		e = e / 2n;
		b = b ** 2n % n;
	}

	return r;
};
