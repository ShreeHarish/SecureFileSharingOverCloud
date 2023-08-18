const express = require("express");
const fs = require("fs/promises");
const cors = require("cors");
const path = require("path");
const FileRouter = require("./upload/routes");
const DownloadRouter = require("./download/routes");

const app = express();
app.use(cors());
app.use(express.json());

const dataDirectory = path.join(__dirname, "./data");
const dataFile = path.join(dataDirectory, "data.json");

app.use(FileRouter);
app.use(DownloadRouter);

// fs.readFile(dataFile, { encoding: "utf-8" }).then((data) => {
// 	data = JSON.parse(data);
// 	const p = BigInt(data[`USER-1-7`].p);
// 	const q = BigInt(data[`USER-1-7`].q);
// 	const g = BigInt(data[`USER-1-7`].g);
// 	const xi = BigInt(data[`USER-1-7`].xi);
// 	const yi = BigInt(data[`USER-1-7`].yi);
// 	const k = BigInt(data[`MANAGER-7-7`][0].k);
// 	const gk = modPow(g, k, p);
// 	console.log(bigToUint8Array(gk));
// 	const Xi = modPow(g, xi, p);
// 	const Xik = modPow(Xi, k, p);
// 	const gkdata = modPow(Xik, yi, p);
// 	console.log(bigToUint8Array(gkdata));
// 	console.log(gk === gkdata);
// });

// const data = getByteArray(path.join(dataDirectory, "Fonts.tar.gz.enc"));
// fs.writeFile(
// 	path.join(dataDirectory, "Fonts1.tar.gz"),
// 	salsa20.decrypt(
// 		bigToUint8Array(
// 			92157275648763950175992712063012686811575630649691372807414186868034182203523n
// 		),
// 		bigToUint8Array(
// 			92157275648763950175992712063012686811575630649691372807414186868034182203523n
// 		).slice(0, 8),
// 		data
// 	)
// );

app.post("/requests", async (req, res) => {
	try {
		const payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);

		if (!payload) {
			res.status(300).json({ error: "Authentication Required" });
			return;
		}

		const privateData = req.body;
		const dataString = await fs.readFile(dataFile, { encoding: "utf8" });
		const data = JSON.parse(dataString || "{}");
		data[
			`${payload.role}-${payload.id}-${privateData.group_id}`
		] = privateData;
		await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
		res.status(200).json({
			data: data[`${payload.role}-${payload.id}-${privateData.group_id}`],
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Error" });
	}
});

app.get("/requests/:group_id", async (req, res) => {
	try {
		const group_id = req.params.group_id;
		const payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);

		if (!payload) {
			res.status(300).json({ error: "Authentication Required" });
			return;
		}

		const dataString = await fs.readFile(dataFile, { encoding: "utf8" });
		const data = JSON.parse(dataString || "{}");
		if (data[`${payload.role}-${payload.id}-${group_id}`]) {
			res.status(200).json({
				data: data[`${payload.role}-${payload.id}-${group_id}`],
			});
			return;
		}

		res.status(404).json({ error: "Data Not Found" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Error" });
	}
});

app.post("/k", async (req, res) => {
	try {
		const body = req.body;
		const payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);

		if (!payload) {
			res.status(300).json({ error: "Authentication Required" });
			return;
		}
		const dataString = await fs.readFile(dataFile, { encoding: "utf8" });
		const data = JSON.parse(dataString || "{}");
		const key = `${payload.role}-${payload.id}-${payload.groupId}`;
		if (!data[key]) {
			data[key] = [];
		}
		data[key].push({ k: body.k, time: body.time });
		await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
		res.status(200).json({
			currentKs: data[key],
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Error" });
	}
});

app.get("/k", async (req, res) => {
	try {
		const payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);

		if (!payload) {
			res.status(300).json({ error: "Authentication Required" });
			return;
		}

		const dataString = await fs.readFile(dataFile, { encoding: "utf8" });
		const data = JSON.parse(dataString || "{}");
		const key = `${payload.role}-${payload.id}-${payload.groupId}`;
		let returnData;
		if (!data[key]) {
			returnData = [];
		} else {
			returnData = data[key];
		}
		res.status(200).json({
			currentKs: returnData,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Internal Error" });
	}
});

app.listen(4000, () => {
	console.log(`Server is listening on http://localhost:${4000}`);
});
