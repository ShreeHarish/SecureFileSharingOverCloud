const apiFetch = async (subUrl, payload, token) => {
	const headers =
		payload.method === "POST" ||
		payload.method === "PUT" ||
		payload.method === "PATCH"
			? {
					"Content-Type": "application/json",
			  }
			: {};
	if (token) {
		headers.authorization = `Bearer ${token}`;
	}
	if (payload.headers) {
		for (let key in Object.keys(payload.headers)) {
			headers[key] = payload.headers[key];
		}
	}
	try {
		const data = await fetch(process.env.REACT_APP_API_URL + subUrl, {
			headers,
			...payload,
		}).then((res) => res.json());
		if (data.error) {
			return { data: {}, error: data.error };
		} else {
			return { data, error: "" };
		}
	} catch (e) {
		console.log(e);
		return { data: {}, error: e.message };
	}
};

export default apiFetch;
