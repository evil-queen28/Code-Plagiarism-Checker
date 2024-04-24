// netlify/functions/checkPlagiarism.js
const { builder } = require("@netlify/functions");
const multer = require("multer");
const levenshtein = require("fast-levenshtein");
const difflib = require("difflib");
const fastDiff = require("fast-diff");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array("files");
const util = require("util");

const uploadPromise = util.promisify(upload);

const handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    try {
        await uploadPromise(event); // Handle file upload
        const files = event.files;
        const codeFiles = files.map((file) => file.buffer.toString());
        const results = [];

        // Your existing loop to calculate plagiarism
        // This needs adaptation to fit the event structure and response

        return {
            statusCode: 200,
            body: JSON.stringify(results),
            headers: {
                "Content-Type": "application/json"
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: "Internal Server Error", error: error.message }),
        };
    }
};

exports.handler = builder(handler);
