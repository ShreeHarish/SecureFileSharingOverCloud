import apiFetch from "./apiFetch";
import serverFetch from "./serverFetch";

export class UserStorage {
	static users = {};

	static getInstance(id) {
		if (this.users[id]) {
			return this.users[id];
		} else {
			this.users[id] = new UserStorage(id);
			return this.users[id];
		}
	}

	constructor(id) {
		this.id = id;
	}

	async addGroupPrivateData(group_id, p, q, g, xi, yi, token) {
		p = p.toString();
		q = q.toString();
		g = g.toString();
		xi = xi.toString();
		yi = yi.toString();

		const { error } = await serverFetch(
			"/requests",
			{
				method: "POST",
				body: JSON.stringify({
					p,
					q,
					g,
					xi,
					yi,
					group_id,
				}),
			},
			token
		);
		if (error) {
			throw new Error(error);
		}
		return {
			p: BigInt(p),
			q: BigInt(q),
			g: BigInt(g),
			xi: BigInt(xi),
			yi: BigInt(yi),
			group_id,
		};
	}

	async getGroupPrivateData(group_id, token) {
		const { data, error } = await serverFetch(
			`/requests/${group_id}`,
			{},
			token
		);
		if (error) {
			return null;
		}

		return {
			p: BigInt(data.data.p),
			q: BigInt(data.data.q),
			g: BigInt(data.data.g),
			xi: BigInt(data.data.xi),
			yi: BigInt(data.data.yi),
			group_id,
		};
	}

	addGroupKey(group_id, gk, time) {
		let currentGKs = [];
		if (localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)) {
			currentGKs = JSON.parse(
				localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)
			);
		}
		currentGKs.push({ gk: gk.toString(), time: time.toJSON() });
		currentGKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		localStorage.setItem(
			`user-${this.id}-group-${group_id}-keys`,
			currentGKs
		);
		return currentGKs;
	}

	getGroupKeys(group_id) {
		let currentGKs = [];
		if (localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)) {
			currentGKs = JSON.parse(
				localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)
			);
		}
		currentGKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		currentGKs = currentGKs.map((GK) => {
			return {
				gk: BigInt(GK.gk),
				time: new Date(GK.time),
			};
		});

		return currentGKs;
	}
}

export class ManagerStorage {
	static managers = {};

	static getInstance(id) {
		if (this.managers[id]) {
			return this.managers[id];
		} else {
			this.managers[id] = new ManagerStorage(id);
			return this.managers[id];
		}
	}

	constructor(id) {
		this.id = id;
	}

	async getGroup(token) {
		const { data, error } = await apiFetch("/api/manager/group", {}, token);
		if (error) {
			throw new Error(error);
		}

		return {
			...data,
			p: BigInt(data.p),
			q: BigInt(data.q),
			g: BigInt(data.g),
		};
	}

	async addK(k, time, token) {
		const { data, error } = await serverFetch(
			"/k",
			{
				method: "POST",
				body: JSON.stringify({ k: k.toString(), time: time.toJSON() }),
			},
			token
		);
		if (error) {
			return null;
		}
		data.currentKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		const currentKs = data.currentKs.map((obj) => ({
			k: BigInt(obj.k),
			time: new Date(obj.time),
		}));
		return currentKs;
	}

	async getKs(token) {
		const { data, error } = await serverFetch("/k", {}, token);
		if (error) {
			return null;
		}
		data.currentKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		const currentKs = data.currentKs.map((obj) => ({
			k: BigInt(obj.k),
			time: new Date(obj.time),
		}));

		return currentKs;
	}
}
