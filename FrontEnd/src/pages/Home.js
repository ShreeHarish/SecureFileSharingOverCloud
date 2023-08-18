import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div>
			<h1>Secure Cloud Groups File Sharing</h1>
			<nav>
				<div>
					<Link href="/admin/login" to="/admin/login">
						Admin
					</Link>
				</div>
				<div>
					<Link href="/user/login" to="/user/login">
						User
					</Link>
				</div>
				<div>
					<Link href="/manager/login" to="/manager/login">
						Group Manager
					</Link>
				</div>
			</nav>
		</div>
	);
};

export default Home;
