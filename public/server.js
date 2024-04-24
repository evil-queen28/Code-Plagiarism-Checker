const express = require("express");
const multer = require("multer");
const levenshtein = require("fast-levenshtein");
const difflib = require("difflib");
const fastDiff = require("fast-diff");

const app = express();
const port = process.env.PORT || 4000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static("public"));

// Define the plagiarism percentage threshold
const plagiarismThreshold = 70;

app.post("/check", upload.array("files"), (req, res) => {
    const codeFiles = req.files.map((file) => file.buffer.toString());
    const results = [];

    for (let i = 0; i < codeFiles.length; i++) {
        for (let j = i + 1; j < codeFiles.length; j++) {
            const { similarity, plagiarismPercentage, plagiarizedLines } = calculatePlagiarism(codeFiles[i], codeFiles[j]);
            const isPlagiarized = plagiarismPercentage > plagiarismThreshold;
            results.push({
                file1: i,
                file2: j,
                similarity,
                plagiarismPercentage,
                isPlagiarized,
                code: codeFiles[i], // Include the code content
                comparison: codeComparison(codeFiles[i], codeFiles[j]), // Include the code comparison
                plagiarizedLines,
            });
        }
    }

    res.json(results);
});

function codeComparison(code1, code2) {
    const diff = fastDiff(code1, code2);
    let comparison = "";

    diff.forEach(([type, text]) => {
        if (type === 0) {
            // No difference, use plain text
            comparison += `<span class="unchanged">${text}</span>`;
        } else if (type === 1) {
            // Added text (in code2)
            comparison += `<span class="added">${text}</span>`;
        } else if (type === -1) {
            // Removed text (from code1)
            comparison += `<span class="removed">${text}</span>`;
        }
    });

    return comparison;
}

function calculatePlagiarism(code1, code2) {
    const normalizedCode1 = code1.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "").replace(/\s/g, "");
    const normalizedCode2 = code2.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "").replace(/\s/g, "");

    const distance = levenshtein.get(normalizedCode1, normalizedCode2);

    const similarity = 1 - distance / Math.max(normalizedCode1.length, normalizedCode2.length);
    const plagiarismPercentage = similarity * 100;

    // Calculate and identify plagiarized lines
    const sequenceMatcher = new difflib.SequenceMatcher(null, normalizedCode1, normalizedCode2);
    const matchingBlocks = sequenceMatcher.getMatchingBlocks();

    const plagiarizedLines = [];
    for (const block of matchingBlocks) {
        const start = block.a;
        const end = block.a + block.size;
        for (let i = start; i < end; i++) {
            plagiarizedLines.push(i);
        }
    }

    return { similarity, plagiarismPercentage, code: code1, plagiarizedLines };
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
