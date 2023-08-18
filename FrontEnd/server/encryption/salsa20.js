class Salsa {
	_stringToBytes(str) {
		let bytes = [];
		for (let i = 0; i < str.length; i++) {
			bytes.push(str.charCodeAt(i));
		}
		return new Uint8Array(bytes);
	}

	_to32bytes(data, index) {
		return (
			data[index++] ^
			(data[index++] << 8) ^
			(data[index++] << 16) ^
			(data[index] << 24)
		);
	}

	_encryptAndDecrypt(data) {
		if (data.length === 0) {
			throw new Error("Data should not be empty");
		}
		const output = new Uint8Array(data.length);
		for (let i = 0; i < data.length; i++) {
			if (this.byteCounter === 0 || this.byteCounter === 64) {
				this._salsa();
				this._incrementCounter();
				this.byteCounter = 0;
			}

			output[i] = data[i] ^ this.block[this.byteCounter++];
		}

		return output;
	}

	_incrementCounter() {
		this.param[8] = (this.param[8] + 1) >>> 0;
		if (this.param[8] === 0) {
			this.param[9] = (this.param[9] + 1) >>> 0;
		}
	}

	_salsa() {
		const mix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let b = 0;

		for (let i = 0; i < 16; i++) {
			mix[i] = this.param[i];
		}

		for (let i = 0; i < this.rounds; i += 2) {
			mix[4] = (mix[4] ^ this._rotateLeft(mix[0] + mix[12], 7)) >>> 0;
			mix[8] = (mix[8] ^ this._rotateLeft(mix[4] + mix[0], 9)) >>> 0;
			mix[12] = (mix[12] ^ this._rotateLeft(mix[8] + mix[4], 13)) >>> 0;
			mix[0] = (mix[0] ^ this._rotateLeft(mix[12] + mix[8], 18)) >>> 0;
			mix[9] = (mix[9] ^ this._rotateLeft(mix[5] + mix[1], 7)) >>> 0;
			mix[13] = (mix[13] ^ this._rotateLeft(mix[9] + mix[5], 9)) >>> 0;
			mix[1] = (mix[1] ^ this._rotateLeft(mix[13] + mix[9], 13)) >>> 0;
			mix[5] = (mix[5] ^ this._rotateLeft(mix[1] + mix[13], 18)) >>> 0;
			mix[14] = (mix[14] ^ this._rotateLeft(mix[10] + mix[6], 7)) >>> 0;
			mix[2] = (mix[2] ^ this._rotateLeft(mix[14] + mix[10], 9)) >>> 0;
			mix[6] = (mix[6] ^ this._rotateLeft(mix[2] + mix[14], 13)) >>> 0;
			mix[10] = (mix[10] ^ this._rotateLeft(mix[6] + mix[2], 18)) >>> 0;
			mix[3] = (mix[3] ^ this._rotateLeft(mix[15] + mix[11], 7)) >>> 0;
			mix[7] = (mix[7] ^ this._rotateLeft(mix[3] + mix[15], 9)) >>> 0;
			mix[11] = (mix[11] ^ this._rotateLeft(mix[7] + mix[3], 13)) >>> 0;
			mix[15] = (mix[15] ^ this._rotateLeft(mix[11] + mix[7], 18)) >>> 0;
			mix[1] = (mix[1] ^ this._rotateLeft(mix[0] + mix[3], 7)) >>> 0;
			mix[2] = (mix[2] ^ this._rotateLeft(mix[1] + mix[0], 9)) >>> 0;
			mix[3] = (mix[3] ^ this._rotateLeft(mix[2] + mix[1], 13)) >>> 0;
			mix[0] = (mix[0] ^ this._rotateLeft(mix[3] + mix[2], 18)) >>> 0;
			mix[6] = (mix[6] ^ this._rotateLeft(mix[5] + mix[4], 7)) >>> 0;
			mix[7] = (mix[7] ^ this._rotateLeft(mix[6] + mix[5], 9)) >>> 0;
			mix[4] = (mix[4] ^ this._rotateLeft(mix[7] + mix[6], 13)) >>> 0;
			mix[5] = (mix[5] ^ this._rotateLeft(mix[4] + mix[7], 18)) >>> 0;
			mix[11] = (mix[11] ^ this._rotateLeft(mix[10] + mix[9], 7)) >>> 0;
			mix[8] = (mix[8] ^ this._rotateLeft(mix[11] + mix[10], 9)) >>> 0;
			mix[9] = (mix[9] ^ this._rotateLeft(mix[8] + mix[11], 13)) >>> 0;
			mix[10] = (mix[10] ^ this._rotateLeft(mix[9] + mix[8], 18)) >>> 0;
			mix[12] = (mix[12] ^ this._rotateLeft(mix[15] + mix[14], 7)) >>> 0;
			mix[13] = (mix[13] ^ this._rotateLeft(mix[12] + mix[15], 9)) >>> 0;
			mix[14] = (mix[14] ^ this._rotateLeft(mix[13] + mix[12], 13)) >>> 0;
			mix[15] = (mix[15] ^ this._rotateLeft(mix[14] + mix[13], 18)) >>> 0;
		}

		for (let i = 0; i < 16; i++) {
			mix[i] += this.param[i];
			this.block[b++] = mix[i] & 0xff;
			this.block[b++] = (mix[i] >>> 8) & 0xff;
			this.block[b++] = (mix[i] >>> 16) & 0xff;
			this.block[b++] = (mix[i] >>> 24) & 0xff;
		}
	}

	_rotateLeft(data, shift) {
		return (data << shift) | (data >>> (32 - shift));
	}

	constructor(key, nonce) {
		if (key.length !== 32) {
			console.log(key.length);
			throw new Error("Key should be 32 byte array");
		}
		if (nonce.length !== 8) {
			throw new Error("Nonce should ne 8 byte array");
		}
		this.key = key;
		this.nonce = nonce;
		this.rounds = 20;
		this.sigma = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
		this.param = [
			this.sigma[0],
			this._to32bytes(key, 0),
			this._to32bytes(key, 4),
			this._to32bytes(key, 8),
			this._to32bytes(key, 12),
			this.sigma[1],
			this._to32bytes(nonce, 0),
			this._to32bytes(nonce, 4),
			0,
			0,
			this.sigma[2],
			this._to32bytes(key, 16),
			this._to32bytes(key, 20),
			this._to32bytes(key, 24),
			this._to32bytes(key, 28),
			this.sigma[3],
		];

		//prettier-ignore
		this.block=[
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        ];
		this.byteCounter = 0;
	}

	encrypt(data) {
		return this._encryptAndDecrypt(data);
	}

	decrypt(data) {
		return this._encryptAndDecrypt(data);
	}

	static toString(data) {
		const uint8Array = new Uint8Array(data);
		data = uint8Array.reduce(
			(acc, i) => (acc += String.fromCharCode.apply(null, [i])),
			""
		);
		return data;
	}
}

module.exports = {
	encrypt: (key, nonce, data) => {
		const salsa = new Salsa(key, nonce);
		return salsa.encrypt(data);
	},
	decrypt: (key, nonce, data) => {
		const salsa = new Salsa(key, nonce);
		return salsa.decrypt(data);
	},
	toString: (data) => {
		return Salsa.toString(data);
	},
};
