import React from "react";
import UserNav from "../components/UserNav";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserRequests = () => {
	const [requests, setRequests] = React.useState([]);
	const [error, setError] = React.useState("");
	const [token] = React.useContext(IsAuthenticatedContext);

	React.useEffect(() => {
		apiFetch("/api/user/requests", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setRequests(data.requests);
		});
	}, [token]);

	console.log(requests);

	const handleDeleteRejected = async (e, req) => {
		const { data, error } = apiFetch(
			"/api/user/requests",
			{ method: "DELETE" },
			token
		);
		if (error) {
			setError(error);
		}
		console.log(data);
		window.location.reload();
	};

	return (
		<div>
			<UserNav />
			<h1>Requests Made By You</h1>
			{error && (
				<div>
					<h2>An Error Occured</h2>
					<p>{error}</p>
				</div>
			)}
			<h2>Pending Requests</h2>
			{requests.every((req) => req.ok != null) &&
				"There is 0 requests pending"}
			<h3>Joining Requests</h3>
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok == null && req.joining === true ? (
						<div>
							<h3>{req.group_name}</h3>
							<p>Managed By {req.manager_name}</p>
						</div>
					) : null}
				</React.Fragment>
			))}
			<h3>Leaving Requests</h3>
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok == null && req.joining === false ? (
						<div>
							<h3>{req.group_name}</h3>
							<p>Managed By {req.manager_name}</p>
						</div>
					) : null}
				</React.Fragment>
			))}
			<h2>Accepted Requests</h2>
			{requests.every((req) => req.ok === false || req.ok == null) &&
				"There is no accepted requests"}
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok === true ? (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								<h3>{req.group_name}</h3>
								<p>Managed By {req.manager_name}</p>
							</div>
							<div>
								{req.joining
									? "Joining Requested"
									: "Leaving Requested"}
							</div>
						</div>
					) : null}
				</React.Fragment>
			))}
			<h2>Rejected Requests</h2>
			{requests.every((req) => req.ok === true || req.ok == null) ? (
				"There is no rejected requests"
			) : (
				<div>
					<button onClick={handleDeleteRejected}>
						Delete Rejected Requests
					</button>
				</div>
			)}
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok === false ? (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								<h3>{req.group_name}</h3>
								<p>Managed By {req.manager_name}</p>
							</div>
							<div>
								{req.joining
									? "Joining Requested"
									: "Leaving Requested"}
							</div>
						</div>
					) : null}
				</React.Fragment>
			))}
		</div>
	);
};

export default UserRequests;
