import { createContext, useEffect, useState } from "react";

export const IsAuthenticatedContext = createContext(["", (value) => {}]);

const useLocalState = (key, initialValue) => {
	const [state, setState] = useState(() => {
		const token = localStorage.getItem("token");
		if (token) {
			return token;
		}

		return initialValue;
	});

	useEffect(() => {
		localStorage.setItem(key, state);
	}, [state, key]);

	return [state, setState];
};

export default useLocalState;
