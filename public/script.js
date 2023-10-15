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

        fetch("/check", {
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

            if (result.isPlagiarized) {
                // Get the plagiarized lines
                const plagiarizedLines = result.plagiarizedLines;

                // Highlight the plagiarized code
                const highlightedCode1 = highlightPlagiarizedCode(result.code, plagiarizedLines);
                const highlightedCode2 = highlightPlagiarizedCode(result.comparison, plagiarizedLines);

                // Display the highlighted code
                resultElement.innerHTML = `
            <div class="result-header">
          <h3>Files ${result.file1 + 1} and ${result.file2 + 1}</h3>
          <p>Similarity: ${result.similarity}</p>
          <p>Plagiarism Percentage: ${result.plagiarismPercentage}%</p>
    </div>

      <div class="plagiarized-code-container">
         <div class="plagiarized-code1">
           <h4>Code 1:</h4>
            <pre>${highlightedCode1}</pre>
   </div>

       <div class="plagiarized-code2">
            <h4>Code 2:</h4>
         <pre>${highlightedCode2}</pre>
      </div>
</div>
`;


        } else {
                // Display the unplagiarized code as before
                resultElement.innerHTML = `
        <div class="result-header">
         <h3>Files ${result.file1 + 1} and ${result.file2 + 1}</h3>
         <p>Similarity: ${result.similarity}</p>
         <p>Plagiarism Percentage: ${result.plagiarismPercentage}%</p>
        </div>

        <div class="result-content">
         <p>Not Plagiarized</p>
        </div>
       `;
            }

            resultsContainer.appendChild(resultElement);
        });



// Additional code to display the plagiarized code horizontally
        const plagiarizedCodeContainers = document.querySelectorAll(".plagiarized-code-container");
        for (const plagiarizedCodeContainer of plagiarizedCodeContainers) {
            plagiarizedCodeContainer.style.display = "flex";
            plagiarizedCodeContainer.style.flexDirection = "row";
            plagiarizedCodeContainer.style.justifyContent = "space-between";

            const plagiarizedCode1 = plagiarizedCodeContainer.querySelector(".plagiarized-code1");
            const plagiarizedCode2 = plagiarizedCodeContainer.querySelector(".plagiarized-code2");

            plagiarizedCode1.style.width = "40%";
            plagiarizedCode2.style.width = "40%";
        }
    }


    function highlightPlagiarizedCode(code, plagiarizedLines) {
        // Split the code into lines
        const codeLines = code.split("\n");

        // Iterate through the plagiarized lines
        for (const line of plagiarizedLines) {
            // Check if the line starts with '-' (removed) or '+' (added)
            if (codeLines[line].startsWith('-')) {
                codeLines[line] = `<span class="removed">${codeLines[line].substring(1)}</span>`;
            } else if (codeLines[line].startsWith('+')) {
                codeLines[line] = `<span class="added">${codeLines[line].substring(1)}</span>`;
            }
        }

        // Join the lines back together
        return codeLines.join("\n");
    }


});
