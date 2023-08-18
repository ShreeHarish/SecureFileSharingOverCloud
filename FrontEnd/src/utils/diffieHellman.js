import { randBetween, eGcd, modInv, modPow } from "./math";

export function find_xi(p) {
	p = BigInt(p);
	let p1 = p - 1n;
	let xi = randBetween(p1, 1n);

	return new Promise((resolve, reject) => {
		while (eGcd(xi, p1).g !== 1n) {
			xi = randBetween(p1, 1n);
		}
		resolve(xi);
	});
}

export function find_yi(xi, p) {
	p = BigInt(p);
	xi = BigInt(xi);
	return new Promise((resolve, reject) => {
		let y = modInv(xi, p - 1n);
		resolve(y);
	});
}

export function find_Xi(g, xi, p) {
	return modPow(g, xi, p);
}

export function find_k(q) {
	let k = randBetween(q);
	while (eGcd(k, q).g !== 1n) {
		k = randBetween(q);
	}
	return k;
}

export function find_Xik(Xi, k, p) {
	return modPow(Xi, k, p);
}
