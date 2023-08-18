import React, { useContext } from "react";
import { useHistory } from "react-router";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserRegister = () => {
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [username, setUsername] = React.useState("");
	const [error, setError] = React.useState("");
	const router = useHistory();
	const [, setToken] = useContext(IsAuthenticatedContext);

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password || !username) {
			return;
		}
		const { data, error } = await apiFetch("/api/user/register", {
			method: "POST",
			body: JSON.stringify({ email, password, username }),
		});
		if (error) {
			setError(error);
			return;
		}

		setToken(data.token);
		router.push("/user/groups");
	};

	return (
		<div>
			<h1>User Register</h1>
			{error && (
				<div>
					<h5>An Error Occured</h5>
					<p>{error}</p>
				</div>
			)}
			<form onSubmit={onSubmit}>
				<div>
					<label>Username</label>
					<br />
					<input
						type="text"
						placeholder="Username"
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
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
				<button type="submit">Sign Up</button>
			</form>
		</div>
	);
};

export default UserRegister;
