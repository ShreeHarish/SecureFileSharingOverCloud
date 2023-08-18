const fsPromise = require("fs/promises");
const fs = require("fs");
const path = require("path");
const tar = require("tar-fs");
const zlib = require("zlib");
const { find_manager_gk, find_user_gk } = require("../utils/dh");
const fetch = require("node-fetch").default;
const salsa20 = require("../encryption/salsa20");
const { bigToUint8Array } = require("../utils/math");

const dataDirectory = path.join(__dirname, "../data");

const recreateFolder = async (req) => {
	for (let i = 0; i < req.files.length; i++) {
		const folderpath = req.body[`filepath${i + 1}`].split("/");
		const filename = folderpath.pop();
		try {
			await fsPromise.mkdir(path.join(dataDirectory, ...folderpath), {
				recursive: true,
			});
		} catch (e) {}

		await fsPromise.writeFile(
			path.join(dataDirectory, ...folderpath, filename),
			req.files[i].buffer,
			{ encoding: "utf-8" }
		);
	}
};

const recreateFile = async (req) => {
	await fsPromise.writeFile(
		path.join(dataDirectory, req.files[0].originalname),
		req.files[0].buffer,
		{ encoding: "utf-8" }
	);
};

const compressFolder = (folderAbsolutePath) => {
	const compressedFilePath = folderAbsolutePath + ".tar.gz";
	return tar
		.pack(folderAbsolutePath)
		.pipe(zlib.createGzip())
		.pipe(fs.createWriteStream(compressedFilePath, { encoding: "utf-8" }))
		.on("finish", () => {
			fsPromise.rm(folderAbsolutePath, { recursive: true });
		});
};

const compressFile = (fileAbsolutePath) => {
	const compressedFilePath = fileAbsolutePath + ".gz";
	return fs
		.createReadStream(fileAbsolutePath)
		.pipe(zlib.createGzip())
		.pipe(fs.createWriteStream(compressedFilePath))
		.on("finish", () => {
			fsPromise.unlink(fileAbsolutePath);
		});
};

const encryptFile = async (fileAbsolutePath, token, groupId, filename) => {
	const tokenPayload = JSON.parse(
		Buffer.from(token.split(".")[1], "base64").toString("binary")
	);
	const dataString = await fsPromise.readFile(
		path.join(dataDirectory, "data.json"),
		{ encoding: "utf-8" }
	);
	const data = JSON.parse(dataString);
	let groupKey, response;

	const userData = data[`${tokenPayload.role}-${tokenPayload.id}-${groupId}`];
	if (!userData) {
		return null;
	}
	response = await fetch(
		process.env.REACT_APP_API_URL + `/api/file/${groupId}/upload/init`,
		{
			method: "POST",
			headers: {
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				original_filename: filename,
				file_size: fs.statSync(fileAbsolutePath).size,
			}),
		}
	).then((res) => res.json());
	console.log(response);
	groupKey = find_user_gk(response.Xik, userData.yi, userData.p);
	const groupKeyByte = bigToUint8Array(groupKey);
	const encryptedData = salsa20.encrypt(
		groupKeyByte,
		groupKeyByte.slice(0, 8),
		fs.readFileSync(fileAbsolutePath)
	);
	const encryptedBuffer = Buffer.from(encryptedData.buffer).toString(
		"base64"
	);
	fs.unlink(fileAbsolutePath, () => {});
	return {
		original_filename: response.original_filename,
		id: response.file_id,
		content: encryptedBuffer,
	};
};

const encryptFileManager = async (
	fileAbsolutePath,
	token,
	groupId,
	filename
) => {
	const tokenPayload = JSON.parse(
		Buffer.from(token.split(".")[1], "base64").toString("binary")
	);
	const dataString = await fsPromise.readFile(
		path.join(dataDirectory, "data.json"),
		{ encoding: "utf-8" }
	);
	const data = JSON.parse(dataString);
	let groupKey, response;
	const managerData =
		data[`${tokenPayload.role}-${tokenPayload.id}-${tokenPayload.groupId}`];
	managerData.sort((a, b) => new Date(b.time) - new Date(a.time));
	response = await fetch(
		process.env.REACT_APP_API_URL + "/api/manager/group",
		{
			headers: {
				authorization: `Bearer ${token}`,
			},
		}
	).then((res) => res.json());
	groupKey = find_manager_gk(response.g, managerData[0].k, response.p);
	const groupKeyByte = bigToUint8Array(groupKey);
	const encryptedData = salsa20.encrypt(
		groupKeyByte,
		groupKeyByte.slice(0, 8),
		fs.readFileSync(fileAbsolutePath)
	);
	const encryptedBuffer = Buffer.from(encryptedData.buffer).toString(
		"base64"
	);

	const size = fs.statSync(fileAbsolutePath).size;
	fs.unlink(fileAbsolutePath, () => {});
	return {
		original_filename: filename,
		content: encryptedBuffer,
		file_size: size,
	};
};

const uploadFile = async (body, token, groupId) => {
	const response = await fetch(
		process.env.REACT_APP_API_URL + `/api/file/${groupId}/upload`,
		{
			method: "POST",
			headers: {
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		}
	).then((res) => res.json());

	return response;
};

const uploadFileManager = async (body, token) => {
	const response = await fetch(
		process.env.REACT_APP_API_URL + `/api/manager/files`,
		{
			method: "POST",
			headers: {
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		}
	).then((res) => res.json());

	return response;
};

const decryptFile = async (
	fileContent,
	filetime,
	Xik,
	token,
	payload,
	groupId
) => {
	let groupKey;
	const dataString = await fsPromise.readFile(
		path.join(dataDirectory, "data.json"),
		{ encoding: "utf-8" }
	);
	const data = JSON.parse(dataString);
	let response;

	if (payload.role === "MANAGER") {
		filetime = new Date(filetime);
		let k;
		const managerData = data[`${payload.role}-${payload.id}-${groupId}`];
		managerData.sort((a, b) => new Date(b.time) - new Date(a.time));
		for (let i = 0; i < managerData.length; i++) {
			if (new Date(managerData[i].time) < filetime) {
				k = managerData[i].k;
				break;
			}
		}

		response = await fetch(
			process.env.REACT_APP_API_URL + "/api/manager/group",
			{
				headers: {
					authorization: `Bearer ${token}`,
				},
			}
		).then((res) => res.json());
		groupKey = find_manager_gk(response.g, k, response.p);
	} else {
		const user_data = data[`${payload.role}-${payload.id}-${groupId}`];
		console.log(user_data);
		groupKey = find_user_gk(Xik, user_data.yi, user_data.p);
	}

	const groupKeyByte = bigToUint8Array(groupKey);
	const encryptedData = Buffer.from(fileContent, "base64");
	const decryptedData = salsa20.decrypt(
		groupKeyByte,
		groupKeyByte.slice(0, 8),
		encryptedData
	);

	return decryptedData;
};

const decompressFile = (decryptedData) => {
	const buffer = Buffer.from(decryptedData);
	return zlib.gunzipSync(buffer);
};

module.exports = {
	recreateFolder,
	recreateFile,
	compressFile,
	decompressFile,
	compressFolder,
	encryptFile,
	decryptFile,
	uploadFile,
	uploadFileManager,
	encryptFileManager,
};
