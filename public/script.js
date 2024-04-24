document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const uploadFilesButton = document.getElementById("upload-files-button");
    const selectedFileCountDisplay = document.getElementById("selected-file-count");

    fileInput.addEventListener("change", () => {
        const files = fileInput.files;
        selectedFileCountDisplay.textContent = `Selected Files: ${files.length}`;
    });

    uploadFilesButton.addEventListener("click", () => {
        fileInput.click();
    });

    const checkButton = document.getElementById("check-button");
    const resultsContainer = document.getElementById("results-container");

    checkButton.addEventListener("click", () => {
        const files = fileInput.files;

        if (files.length < 2) {
            alert("Please select at least two files for plagiarism checking.");
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        fetch('/.netlify/functions/checkPlagiarism', {
            method: "POST",
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            displayResults(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    });

    function displayResults(results) {
        resultsContainer.innerHTML = "";

        results.forEach((result) => {
            let resultElement = document.createElement("div");
            resultElement.classList.add("result-item");

            // Simplified display logic for clarity
            resultElement.innerHTML = `
                <div class="result-header">
                    <h3>Files ${result.file1 + 1} and ${result.file2 + 1}</h3>
                    <p>Similarity: ${result.similarity}</p>
                    <p>Plagiarism Percentage: ${result.plagiarismPercentage}%</p>
                </div>
                <div class="result-content">
                    ${result.isPlagiarized ? "Plagiarized" : "Not Plagiarized"}
                </div>
            `;

            resultsContainer.appendChild(resultElement);
        });
    }
});
