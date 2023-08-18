import React from "react";
import Modal from "react-modal";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

Modal.setAppElement("#modal2");

const RejectRequestsModal = (props) => {
	const {
		showModal,
		setError,
		requests,
		handleCheckBoxClick,
		rejRequests,
		handleModalClose,
		setRequests,
	} = props;
	const [token] = React.useContext(IsAuthenticatedContext);

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		console.log(JSON.stringify(rejRequests));
		const { error } = await apiFetch(
			"/api/manager/requests",
			{ method: "PUT", body: JSON.stringify(rejRequests) },
			token
		);
		handleModalClose();
		if (error) {
			setError(error);
		}
		setRequests([]);
	};

	return (
		<Modal isOpen={showModal} onRequestClose={handleModalClose}>
			<h1>Select the requests to reject</h1>
			<form onSubmit={handleFormSubmit}>
				{requests.map((req) => (
					<React.Fragment key={req.id}>
						<input
							type="checkbox"
							id={req.id}
							onChange={(e) => handleCheckBoxClick(e, req)}
						/>
						<label htmlFor={req.id}>
							{req.user_name} -{" "}
							<a href={`mailto:${req.email}`}>{req.email}</a>
						</label>
						<br />
					</React.Fragment>
				))}
				<button type="submit">Reject These Requests</button>
			</form>
		</Modal>
	);
};

export default RejectRequestsModal;
