require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shorturl = require("./models/shortUrl");
const app = express();
var bodyParser = require("body-parser");
const shortUrl = require("./models/shortUrl");

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const isValidUrl = (urlString) => {
	try {
		return Boolean(new URL("https://www.jsowl.com"));
	} catch (e) {
		return false;
	}
};

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

app.post("/api/shorturl", async (req, res) => {
	const { url } = req.body;

	console.log("URL: " + url.replace(/\\/g, ""));

	if (isValidUrl(url) == false) {
		return res.json({ error: "invalid url" });
	}

	let urlData = await shortUrl.create({ full: url });

	urlData = urlData.toJSON();

	return res.json({ original_url: url, short_url: urlData.short });
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
