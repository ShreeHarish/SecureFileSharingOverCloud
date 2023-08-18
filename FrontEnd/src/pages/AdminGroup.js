import React, { useContext } from "react";
import { useHistory, useParams } from "react-router";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";
import AdminNav from "../components/AdminNav";
import { dateDiff } from "../utils/date";

const AdminGroup = () => {
	const [group, setGroup] = React.useState(null);
	const [error, setError] = React.useState("");
	const [token] = useContext(IsAuthenticatedContext);
	const router = useHistory();
	const params = useParams();

	React.useEffect(() => {
		if (!token) {
			return;
		}
		apiFetch(`/api/admin/groups/${params.id}`, {}, token).then(
			({ data, error }) => {
				if (error) {
					setError(error);
					return;
				}

				setGroup(data);
			}
		);
	}, [token, params.id]);

	const onSubmit = (e) => {
		e.preventDefault();
		const isConfirmed = window.confirm(
			`Are You Sure You want to delete group ${group.name}`
		);
		if (isConfirmed) {
			apiFetch(`/api/admin/groups/${params.id}`, {
				method: "DELETE",
			}).then(({ data, error }) => {
				if (error) {
					setError(error);
					return;
				}
				router.push("/admin/groups");
			});
		}
	};

	if (!token) {
		router.push("/admin/login");
		return null;
	}

	if (error) {
		return (
			<div>
				<AdminNav />
				<h5>An Error Occured</h5>
				<p>{error}</p>
			</div>
		);
	}

	if (group) {
		return (
			group && (
				<div>
					<AdminNav />
					<h1>{group.name}</h1>
					<h3>Manager Name</h3>
					<p>{group.manager}</p>
					<a href={`mailto://${group.email}`}>{group.email}</a>
					<h3>Group Members</h3>
					{group.members &&
						group.members.map((member) => (
							<div key={member.user_id}>
								<div>{member.name}</div>
								<a href={`mailto://${member.email}`}>
									{member.email}
								</a>
								<div>
									Joined{" "}
									{dateDiff(
										new Date(),
										new Date(member.join_time)
									)}{" "}
									ago
								</div>
							</div>
						))}
					<br />
					<form onSubmit={onSubmit}>
						<button type="submit">Delete Group</button>
					</form>
				</div>
			)
		);
	}

	return null;
};

export default AdminGroup;
