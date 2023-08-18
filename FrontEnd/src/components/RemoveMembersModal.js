import React, { useEffect } from "react";
import Modal from "react-modal";
import { IsAuthenticatedContext } from "../utils/useLocalState";
import { ManagerStorage } from "../utils/db";
import apiFetch from "../utils/apiFetch";
import { find_k, find_Xik } from "../utils/diffieHellman";

Modal.setAppElement("#modal3");

const RemoveMembersModal = (props) => {
	const {
		removeUserList,
		handleModalClose,
		setError,
		showModal,
		requests,
		handleCheckBoxClick,
	} = props;
	const [members, setMembers] = React.useState([]);
	const [token] = React.useContext(IsAuthenticatedContext);

	useEffect(() => {
		apiFetch("/api/manager/group", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				handleModalClose();
				return;
			}

			if (data.members) {
				setMembers(data.members);
			}
		});
	}, []);

	console.log(requests);

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (removeUserList.length === 0) {
			return;
		}
		const { data, error } = await apiFetch("/api/manager/Xi", {}, token);
		const postDataMembersList = [];
		if (error) {
			setError(error);
			handleModalClose();
			return;
		}
		const time = new Date();
		const manager = JSON.parse(atob(token.split(".")[1]));
		const managerStorage = ManagerStorage.getInstance(manager.id);
		const { q, p } = await managerStorage.getGroup(token);
		const k = find_k(q);
		managerStorage.addK(k, time, token);
		data.requests.forEach((req) => {
			if (!removeUserList.find((userId) => userId === req.user_id)) {
				postDataMembersList.push({
					userId: req.user_id,
					Xik: find_Xik(req.xi, k, p).toString(),
					time: time.toJSON(),
				});
			}
		});
		console.log(postDataMembersList, removeUserList);
		const { error: err } = await apiFetch(
			"/api/manager/requests",
			{
				method: "PATCH",
				body: JSON.stringify({
					membersData: postDataMembersList,
					removeUsersIDs: removeUserList,
				}),
			},
			token
		);
		if (err) {
			setError(err);
		}
		handleModalClose();
		// window.location.reload();
	};

	return (
		<Modal isOpen={showModal} onRequestClose={handleModalClose}>
			<div>
				<form onSubmit={handleFormSubmit}>
					<h1>People Requested to Leave The Group</h1>
					{requests.map((req) => (
						<React.Fragment key={req.id}>
							{req.joining === false && (
								<>
									<input
										type="checkbox"
										id={req.id}
										onChange={(e) =>
											handleCheckBoxClick(e, req.user_id)
										}
									/>
									<label htmlFor={req.id}>
										{req.user_name} -{" "}
										<a href={`mailto:${req.email}`}>
											{req.email}
										</a>
									</label>
									<br />
								</>
							)}
						</React.Fragment>
					))}
					<h1>Members Of The Group</h1>
					{members.map((member) => {
						const shouldHide = requests.find(
							(req) => req.user_id !== member.user_id
						);
						if (shouldHide) {
							return null;
						}
						return (
							<div key={member.id}>
								<input
									type="checkbox"
									id={member.id}
									onChange={(e) =>
										handleCheckBoxClick(e, member.user_id)
									}
								/>
								<label htmlFor={member.id}>
									{member.name} -{" "}
									<a href={`mailto:${member.email}`}>
										{member.email}
									</a>
								</label>
								<br />
							</div>
						);
					})}
					<br />
					<button type="submit">Remove These Members</button>
				</form>
			</div>
		</Modal>
	);
};

export default RemoveMembersModal;
