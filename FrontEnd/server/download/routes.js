const express = require("express");
const fetch = require("node-fetch").default;
const { decryptFile, decompressFile } = require("../file/fileUtils");

const DownloadRouter = express.Router();

DownloadRouter.get("/manager/download/:id", async (req, res) => {
	const payload = JSON.parse(
		Buffer.from(req.headers.authorization.split(".")[1], "base64").toString(
			"binary"
		)
	);
	const token = req.headers.authorization.replace("Bearer ", "");
	try {
		const response = await fetch(
			process.env.REACT_APP_API_URL +
				`/api/manager/files/${req.params.id}`,
			{
				headers: {
					authorization: `Bearer ${token}`,
				},
			}
		).then((res) => res.json());
		const decryptedData = await decryptFile(
			response.content,
			response.file_time,
			response.Xik,
			token,
			payload,
			payload.groupId
		);
		const uncompressed = decompressFile(decryptedData);
		res.status(200).json({
			id: response.id,
			filename: response.original_filename,
			content: uncompressed.toString("base64"),
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Server Error" });
		return;
	}
});

DownloadRouter.get("/:group_id/download/:id", async (req, res) => {
	console.log(req.params);
	const payload = JSON.parse(
		Buffer.from(req.headers.authorization.split(".")[1], "base64").toString(
			"binary"
		)
	);
	const token = req.headers.authorization.replace("Bearer ", "");
	try {
		const response = await fetch(
			process.env.REACT_APP_API_URL +
				`/api/file/${req.params.group_id}/files/${req.params.id}`,
			{
				headers: {
					authorization: `Bearer ${token}`,
				},
			}
		).then((res) => res.json());
		const decryptedData = await decryptFile(
			response.content,
			response.file_time,
			response.Xik,
			token,
			payload,
			req.params.group_id
		);
		const uncompressed = decompressFile(decryptedData);
		res.status(200).json({
			id: response.id,
			filename: response.original_filename,
			content: uncompressed.toString("base64"),
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Server Error" });
		return;
	}
});

module.exports = DownloadRouter;
