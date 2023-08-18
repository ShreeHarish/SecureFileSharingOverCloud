import React from "react";
import { Link } from "react-router-dom";

const AdminNav = () => {
	return (
		<nav
			style={{
				margin: "2rem",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Link href="/admin/groupsCreate" to="/admin/groupsCreate">
				Create Group
			</Link>
			<Link href="/admin/groups" to="/admin/groups">
				View Groups
			</Link>
			<Link href="/admin/logout" to="/admin/logout">
				Logout
			</Link>
		</nav>
	);
};

export default AdminNav;
