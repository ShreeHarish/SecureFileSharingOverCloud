import React, { useContext } from "react";
import { useHistory } from "react-router";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const Logout = () => {
	const router = useHistory();
	const [, setToken] = useContext(IsAuthenticatedContext);

	React.useEffect(() => {
		setToken("");
		localStorage.removeItem("token");
		router.push("/");
	}, [router, setToken]);

	return null;
};

export default Logout;
