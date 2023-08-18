const path = require("path");
const express = require("express");
const multer = require("multer");
const {
	recreateFolder,
	compressFolder,
	compressFile,
	recreateFile,
	encryptFile,
	uploadFile,
	encryptFileManager,
	uploadFileManager,
} = require("../file/fileUtils");

const dataDirectory = path.join(__dirname, "../data");
const upload = multer({
	fileFilter: function (req, file, cb) {
		const id = parseInt(file.fieldname.replace("file", ""));
		if (!id || !req.body[`filepath${id}`]) {
			cb(null, false);
		} else {
			cb(null, true);
		}
	},
	storage: multer.memoryStorage(),
});

const FileRouter = express.Router();

FileRouter.post("/upload", upload.any(), async (req, res) => {
	let payload, token;
	try {
		payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);
		token = req.headers.authorization.replace("Bearer ", "");
	} catch (e) {
		console.log(e);
		res.status(300).json({ error: "Authorization Requried" });
		return;
	}

	if (!payload || !payload.role === "MANAGER") {
		res.status(300).json({ error: "Authentication Required" });
		return;
	}

	if (Object.keys(req.body).length !== req.files.length) {
		console.log(Object.keys(req.body), req.files.length);
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length === 0) {
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length > 1) {
		try {
			const foldername = req.body[`filepath1`].split("/")[0];
			await recreateFolder(req);
			compressFolder(path.join(dataDirectory, foldername))
				.on("error", (err) => {
					throw err;
				})
				.on("finish", async () => {
					const body = await encryptFileManager(
						path.join(dataDirectory, foldername + ".tar.gz"),
						token,
						req.params.group_id,
						foldername + ".tar.gz"
					);
					await uploadFileManager(body, token);

					res.status(200).json({ ok: true });
				});
			return;
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
	}

	try {
		await recreateFile(req);
		compressFile(path.join(dataDirectory, req.files[0].originalname))
			.on("error", (err) => {
				throw err;
			})
			.on("finish", async () => {
				const body = await encryptFileManager(
					path.join(dataDirectory, req.files[0].originalname + ".gz"),
					token,
					req.params.group_id,
					req.files[0].originalname + ".gz"
				);
				await uploadFileManager(body, token);
				res.status(200).json({ ok: true });
			});
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: "Internal Server Error" });
		return;
	}
});
FileRouter.post("/:group_id/upload", upload.any(), async (req, res) => {
	let payload, token;
	try {
		payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);
		token = req.headers.authorization.replace("Bearer ", "");
	} catch (e) {
		console.log(e);
		res.status(300).json({ error: "Authorization Requried" });
		return;
	}

	if (!payload) {
		res.status(300).json({ error: "Authentication Required" });
		return;
	}

	if (Object.keys(req.body).length !== req.files.length) {
		console.log(Object.keys(req.body), req.files.length);
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length === 0) {
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length > 1) {
		try {
			const foldername = req.body[`filepath1`].split("/")[0];
			await recreateFolder(req);
			compressFolder(path.join(dataDirectory, foldername))
				.on("error", (err) => {
					throw err;
				})
				.on("finish", async () => {
					const body = await encryptFile(
						path.join(dataDirectory, foldername + ".tar.gz"),
						token,
						req.params.group_id,
						foldername + ".tar.gz"
					);
					await uploadFile(body, token, req.params.group_id);
					res.status(200).json({ ok: true });
				});
			return;
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Internal Server Error" });
			return;
		}
	}

	try {
		await recreateFile(req);
		compressFile(path.join(dataDirectory, req.files[0].originalname))
			.on("error", (err) => {
				throw err;
			})
			.on("finish", async () => {
				const body = await encryptFile(
					path.join(dataDirectory, req.files[0].originalname + ".gz"),
					token,
					req.params.group_id,
					req.files[0].originalname + ".gz"
				);
				await uploadFile(body, token, req.params.group_id);
				res.status(200).json({ ok: true });
			});
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: "Internal Server Error" });
		return;
	}
});

module.exports = FileRouter;
