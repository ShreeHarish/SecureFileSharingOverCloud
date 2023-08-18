import React from "react";
import AddMembersModal from "../components/AddMembersModal";
import ManagerNav from "../components/ManagerNav";
import RejectRequestsModal from "../components/RejectRequestsModal";
import RemoveMembersModal from "../components/RemoveMembersModal";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const ManagerRequests = () => {
	const [requests, setRequests] = React.useState([]);
	const [error, setError] = React.useState("");
	const [showAcceptModal, setShowAcceptModal] = React.useState(false);
	const [showRejectReqModal, setShowRejectReqModal] = React.useState(false);
	const [showRemoveModal, setShowRemoveModal] = React.useState(false);
	const [userList, setUserList] = React.useState([]);
	const [rejRequests, setRejRequests] = React.useState([]);
	const [removeUserList, setRemoveUserList] = React.useState([]);
	const [token] = React.useContext(IsAuthenticatedContext);

	React.useEffect(() => {
		apiFetch("/api/manager/requests", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setRequests(data.requests);
		});
	}, [token]);

	const handleAddMembersClick = () => {
		setShowAcceptModal(true);
	};

	const handleRejectRequestsClick = () => {
		setShowRejectReqModal(true);
	};

	const handleRemoveMembersClick = () => {
		setShowRemoveModal(true);
	};

	const handleAcceptModalClose = () => {
		setUserList([]);
		setShowAcceptModal(false);
	};

	const handleRejectModalClose = () => {
		setRejRequests([]);
		setShowRejectReqModal(false);
	};

	const handleRemoveModalClose = () => {
		setRemoveUserList([]);
		setShowRemoveModal(false);
	};

	const handleAcceptCheckBoxClick = (e, req) => {
		if (e.target.checked) {
			setUserList((prevState) => [
				...prevState,
				{ userId: req.user_id, xi: req.xi },
			]);
			return;
		}
		setUserList((prevState) =>
			prevState.filter((member) => member.userId !== req.user_id)
		);
	};

	const handleRejectCheckBoxClick = (e, req) => {
		if (e.target.checked) {
			setRejRequests((prevState) => [...prevState, req.id]);
			return;
		}
		setRejRequests((prevState) =>
			prevState.filter((request) => request !== req.id)
		);
	};

	const handleRemoveCheckBoxClick = (e, userId) => {
		if (e.target.checked) {
			setRemoveUserList((prevState) => [...prevState, userId]);
			return;
		}
		setRemoveUserList((prevState) =>
			prevState.filter((id) => id !== userId)
		);
	};

	return (
		<div>
			<ManagerNav />
			<AddMembersModal
				userList={userList}
				handleModalClose={handleAcceptModalClose}
				setError={setError}
				showModal={showAcceptModal}
				requests={requests}
				handleCheckBoxClick={handleAcceptCheckBoxClick}
			/>
			<RejectRequestsModal
				rejRequests={rejRequests}
				showModal={showRejectReqModal}
				setError={setError}
				requests={requests}
				setRequests={setRequests}
				handleCheckBoxClick={handleRejectCheckBoxClick}
				handleModalClose={handleRejectModalClose}
			/>
			<RemoveMembersModal
				removeUserList={removeUserList}
				showModal={showRemoveModal}
				setError={setError}
				requests={requests}
				handleCheckBoxClick={handleRemoveCheckBoxClick}
				handleModalClose={handleRemoveModalClose}
			/>
			<div>
				<div>
					<button onClick={handleAddMembersClick}>Add Members</button>
					<button onClick={handleRejectRequestsClick}>
						Reject Requests
					</button>
					<button onClick={handleRemoveMembersClick}>
						Remove Members
					</button>
				</div>
				<h1>All Pending Requests</h1>
				{error && (
					<div>
						<h3>An Error Occured</h3>
						<p>{error}</p>
					</div>
				)}
				<h2>Joining Requests</h2>
				{requests.map((req) => (
					<React.Fragment key={req.id}>
						{req.joining === true ? (
							<div>
								<h3>{req.user_name}</h3>
								<a href={`mailto:${req.email}`}>
									Email : {req.email}
								</a>
							</div>
						) : null}
					</React.Fragment>
				))}
				<h2>Leaving Requests</h2>
				{requests.map((req) => (
					<React.Fragment key={req.id}>
						{req.joining === false ? (
							<div>
								<h3>{req.user_name}</h3>
								<a href={`mailto:${req.email}`}>
									Email : {req.email}
								</a>
							</div>
						) : null}
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

export default ManagerRequests;
