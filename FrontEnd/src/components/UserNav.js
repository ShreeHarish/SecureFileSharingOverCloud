import React from "react";
import { Link } from "react-router-dom";

const UserNav = () => {
	return (
		<nav
			style={{
				margin: "2rem",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Link href="/user/groups" to="/user/groups">
				View All Groups
			</Link>
			<Link href="/user/requests" to="/user/requests">
				View All Made Requests
			</Link>
			<Link href="/user/logout" to="/user/logout">
				Logout
			</Link>
		</nav>
	);
};

export default UserNav;
