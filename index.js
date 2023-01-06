require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shorturl = require("./models/shortUrl");
const app = express();
var bodyParser = require("body-parser");
const shortUrl = require("./models/shortUrl");
const dns = require("dns");
var parse = require("url-parse");

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

const links = [];

app.post("/api/shorturl", async (req, res) => {
	let url = req.body["url"];

	const parsedUrl = parse(url, true).hostname;

	console.log("PARSED URL", parsedUrl);

	await dns.lookup(parsedUrl, (err, address, family) => {
		console.log("FROM LOOK UP", address, family);
		if (err) {
			return res.json({ error: "invalid url" });
		}
	});

	let query = { full: url };
	let update = { full: url };
	let options = { upsert: true, new: true, setDefaultsOnInsert: true };
	let urlData = await shortUrl.findOneAndUpdate(query, update, options);

	return res.json({ original_url: urlData.full, short_url: urlData.short });
});

app.get("/api/shorturl/:url", async (req, res) => {
	const { url } = req.params;

	console.log("URL", url);

	const urlObj = await shortUrl.find({ short: url });

	res.redirect(urlObj[0].full);
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
