import React from "react";
import { Link, useParams } from "react-router-dom";

const UserGroupNav = () => {
	const { id } = useParams();
	console.log(id);

	return (
		<nav
			style={{
				margin: "2rem",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Link href={`/user/groups/${id}`} to={`/user/groups/${id}`}>
				File Upload
			</Link>
			<Link
				href={`/user/groups/${id}/download`}
				to={`/user/groups/${id}/download`}
			>
				Files Download
			</Link>
			<Link href={`/user/groups`} to={`/user/groups`}>
				Back
			</Link>
		</nav>
	);
};

export default UserGroupNav;
