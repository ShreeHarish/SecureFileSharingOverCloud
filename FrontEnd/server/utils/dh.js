const { modPow } = require("./math");

const find_user_gk = (Xik, yi, p) => {
	Xik = BigInt(Xik);
	yi = BigInt(yi);
	p = BigInt(p);
	return modPow(Xik, yi, p);
};

const find_manager_gk = (g, k, p) => {
	g = BigInt(g);
	k = BigInt(k);
	p = BigInt(p);
	return modPow(g, k, p);
};

module.exports = {
	find_user_gk,
	find_manager_gk,
};
