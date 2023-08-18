import React, { useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import UserNav from "../components/UserNav";
import apiFetch from "../utils/apiFetch";
import { UserStorage } from "../utils/db";
import { find_Xi, find_xi, find_yi } from "../utils/diffieHellman";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserGroups = () => {
	const [groups, setGroups] = React.useState([]);
	const [error, setError] = React.useState("");
	const [token] = useContext(IsAuthenticatedContext);
	const router = useHistory();

	useEffect(() => {
		if (!token) {
			return;
		}
		apiFetch("/api/user/groups", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			console.log(data);
			setGroups(data.groups);
		});
	}, [token]);

	const handleLeaveGroup = async (e, groupId) => {
		const isConfirmed = window.confirm(
			`Are You Sure You want to leave the group ${groupId}?`
		);

		if (isConfirmed) {
			apiFetch(
				`/api/user/${groupId}/resign`,
				{ method: "DELETE" },
				token
			).then(({ data, error }) => {
				if (error) {
					setError(error);
					return;
				}
				router.push("/user/requests");
			});
		}
	};

	const onClick = async (e, groupId) => {
		if (groups.length < groupId) {
			return;
		}

		const user = JSON.parse(atob(token.split(".")[1]));
		const { p, q, g, id } = groups[groupId];
		const xi = await find_xi(p);
		const yi = await find_yi(xi, p);
		const userStorage = UserStorage.getInstance(user.id);
		try {
			await userStorage.addGroupPrivateData(
				id,
				BigInt(p),
				BigInt(q),
				BigInt(g),
				xi,
				yi,
				token
			);
		} catch (err) {
			setError(err.message);
		}
		const Xi = find_Xi(g, xi, p);
		const { error } = await apiFetch(
			"/api/user/requests",
			{
				method: "POST",
				body: JSON.stringify({
					Xi: Xi.toString(),
					groupId: id,
					joining: true,
				}),
			},
			token
		);
		if (error) {
			setError(error);
			return;
		}
		router.push("/user/requests");
	};

	return (
		<div>
			<UserNav />
			<h1>All Groups</h1>
			{error && (
				<div>
					<h3>An Error Occured</h3>
					<p>{error}</p>
				</div>
			)}
			<h2>Accepted Groups</h2>
			{groups.every((group) => !group.is_joining_accepted) &&
				"There is 0 groups accepted"}
			{groups.map((group) => (
				<div
					key={group.id}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					{group.is_joining_accepted ? (
						<>
							<Link
								href={`/user/groups/${group.id}`}
								to={`/user/groups/${group.id}`}
							>
								<h3>{group.name}</h3>
								<div>
									<strong>Managed By</strong>
									{" " + group.manager_name}
								</div>
							</Link>
							{!group.leaving_requested && (
								<div>
									<button
										onClick={(e) =>
											handleLeaveGroup(e, group.id)
										}
									>
										Leave Group
									</button>
								</div>
							)}
						</>
					) : null}
				</div>
			))}
			<h2>Requested Groups</h2>
			{groups.every(
				(group) => !group.joining_requested || !group.leaving_requested
			) && "There is 0 groups requested"}
			{groups.map((group) => (
				<div key={group.id}>
					{(group.joining_requested && !group.is_joining_accepted) ||
					(group.leaving_requested && !group.is_leaving_accepted) ? (
						<div
							key={group.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								<h3>{group.name}</h3>
								<div>
									<strong>Managed By</strong>
									{" " + group.manager_name}
								</div>
							</div>
							<div>
								{group.joining_requested &&
									!group.is_joining_accepted &&
									"Joining Requested"}
								{group.leaving_requested && "Leaving Requested"}
							</div>
						</div>
					) : null}
				</div>
			))}
			<h2>New Groups</h2>
			{groups.every(
				(group) => group.joining_requested && group.leaving_requested
			) && "There is 0 new groups"}
			{groups.map((group, index) => (
				<div
					key={group.id}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					{!group.joining_requested && !group.leaving_requested ? (
						<>
							<div>
								<h3>{group.name}</h3>
								<div>
									<strong>Managed By</strong>
									{" " + group.manager_name}
								</div>
							</div>
							<div>
								<button onClick={(e) => onClick(e, index)}>
									Ask to Join
								</button>
							</div>
						</>
					) : null}
				</div>
			))}
		</div>
	);
};

export default UserGroups;
