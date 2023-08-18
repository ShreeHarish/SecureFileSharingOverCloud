import React, { useContext } from "react";
import { useHistory } from "react-router";
import { IsAuthenticatedContext } from "../utils/useLocalState";
import AdminNav from "../components/AdminNav";

const AdminGroupCreate = () => {
	const [groupName, setGroupName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [managerName, setManagerName] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [token] = useContext(IsAuthenticatedContext);
	const router = useHistory();

	if (!token) {
		router.push("/admin/login");
		return null;
	}

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const data = JSON.stringify({
			groupName,
			managerName,
			password,
			email,
		});
		const response = await fetch(
			process.env.REACT_APP_API_URL + "/api/admin/groups",
			{
				method: "POST",
				headers: {
					authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: data,
			}
		).then((res) => res.json());
		setLoading(false);
		if (response.error) {
			setError(response.error);
			return;
		}
		router.push("/admin/groups");
	};

	return (
		<div>
			<AdminNav />
			<h1>Create A New Group</h1>
			{error && (
				<div>
					<h5>An Error Occured</h5>
					<p>{error}</p>
				</div>
			)}
			{loading && <div>Loading...</div>}
			<div>
				<form onSubmit={onSubmit}>
					<div>
						<label>Group Name</label>
						<br />
						<input
							type="text"
							placeholder="Group Name"
							onChange={(e) => setGroupName(e.target.value)}
						/>
					</div>
					<div>
						<label>Manager Name</label>
						<br />
						<input
							type="text"
							placeholder="Manager Name"
							onChange={(e) => setManagerName(e.target.value)}
						/>
					</div>
					<div>
						<label>Manager Email</label>
						<br />
						<input
							type="text"
							placeholder="Manager Email"
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<label>Manager Password</label>
						<br />
						<input
							type="password"
							placeholder="Manager Password"
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<button type="submit">Create Group</button>
				</form>
			</div>
		</div>
	);
};

export default AdminGroupCreate;
