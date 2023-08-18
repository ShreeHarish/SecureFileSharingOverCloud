import React, { useContext } from "react";
import { useHistory } from "react-router";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const ManagerLogin = () => {
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState("");
	const router = useHistory();
	const [, setToken] = useContext(IsAuthenticatedContext);

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			return;
		}
		const { data, error } = await apiFetch("/api/manager/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		if (error) {
			setError(error);
			return;
		}

		setToken(data.token);
		router.push("/manager/group");
	};

	return (
		<div>
			<h1>Manager Login</h1>
			{error && (
				<div>
					<h5>An Error Occured</h5>
					<p>{error}</p>
				</div>
			)}
			<form onSubmit={onSubmit}>
				<div>
					<label>Email</label>
					<br />
					<input
						type="text"
						placeholder="Email"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div>
					<label>Password</label>
					<br />
					<input
						type="password"
						placeholder="Password"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button type="submit">Sign In</button>
			</form>
		</div>
	);
};

export default ManagerLogin;
