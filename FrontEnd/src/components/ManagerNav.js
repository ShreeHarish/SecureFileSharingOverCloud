import React from "react";
import { Link } from "react-router-dom";

const ManagerNav = () => {
	return (
		<nav
			style={{
				margin: "2rem",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Link href="/manager/group" to="/manager/group">
				View Group
			</Link>
			<Link href="/manager/requests" to="/manager/requests">
				View Requests
			</Link>
			<Link href="/manager/files/upload" to="/manager/files/upload">
				File Upload
			</Link>
			<Link href="/manager/files" to="/manager/files">
				File Download
			</Link>
			<Link href="/manager/logout" to="/manager/logout">
				Logout
			</Link>
		</nav>
	);
};

export default ManagerNav;
