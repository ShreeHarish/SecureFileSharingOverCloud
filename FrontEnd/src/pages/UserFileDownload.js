import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { saveAs } from "file-saver";
import UserGroupNav from "../components/UserGroupNav";
import apiFetch from "../utils/apiFetch";
import serverFetch from "../utils/serverFetch";
import { dateDiff } from "../utils/date";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserFileDownload = () => {
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState([]);
	const [error, setError] = useState("");
	const { id } = useParams();
	const [token] = useContext(IsAuthenticatedContext);
	const router = useHistory();

	useEffect(() => {
		apiFetch(`/api/file/${id}/files`, {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setFiles(data.files);
		});
	}, [id, token]);

	if (!id) {
		router.push(`/user/groups`);
		return null;
	}

	const onClick = async (file) => {
		setLoading(true);
		const { data, error } = await serverFetch(
			`/${id}/download/${file.id}`,
			{},
			token
		);
		if (error) {
			setLoading(false);
			setError(error);
			return;
		}
		let mime;
		if (data.filename.includes(".tar.gz")) {
			mime = "application/x-tar";
		} else {
			mime = "application/octet-stream";
		}
		let bstr = atob(data.content);
		let n = bstr.length;
		let uint8Array = new Uint8Array(n);
		while (n--) {
			uint8Array[n] = bstr.charCodeAt(n);
		}
		file = new File([uint8Array], data.filename, { type: mime });
		setLoading(false);
		saveAs(file, data.filename.replace(".gz", ""));
	};

	const onDelete = async (file) => {
		setLoading(true);
		const { error } = await apiFetch(
			`/api/file/${id}/files/${file.id}`,
			{ method: "DELETE" },
			token
		);
		setLoading(false);
		if (error) {
			setError(error);
			return;
		}
		window.location.reload();
	};

	return (
		<>
			<UserGroupNav />
			<h1>All Files In This Group</h1>
			{error && (
				<div>
					<h3>An Error Occured</h3>
					<p>{error}</p>
				</div>
			)}
			{loading && <div>Loading...</div>}
			{files.map((file) => {
				let filename = file.original_filename;
				if (filename.includes(".tar.gz")) {
					filename = filename.replace(".tar.gz", "");
				} else {
					filename = filename.replace(".gz", "");
				}
				return (
					<div key={file.id}>
						<h4>{filename}</h4>
						<p>{file.file_size} bytes</p>
						<p>
							Uploaded{" "}
							{dateDiff(new Date(), new Date(file.file_time))} ago
						</p>
						<button onClick={() => onClick(file)}>Download</button>
						{file.isOwner && (
							<button onClick={() => onDelete(file)}>
								Delete
							</button>
						)}
					</div>
				);
			})}
		</>
	);
};

export default UserFileDownload;
