document.addEventListener('DOMContentLoaded', function () {
    let namesData = [];
    let filteredNames = [];  // Stores the filtered names for pagination
    let currentPage = 1;
    const namesPerPage = 10;  // You can set this to 15 if needed

    // Load CSV data and parse it
    fetch('baby_names.csv')
        .then(response => response.text())
        .then(data => {
            namesData = parseCSV(data);
            console.log("Parsed CSV data:", namesData);
        })
        .catch(error => {
            console.error("Error loading CSV file:", error);
        });

    // Add click event listener for filtering
    document.getElementById('filterBtn').addEventListener('click', function () {
        const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
        const selectedGender = document.getElementById('gender').value;
        const lastName = document.getElementById('lastName').value.toLowerCase();
        const compareSyllables = document.getElementById('compareSyllables').checked;

        if (!namesData || namesData.length === 0) {
            alert("Names data not loaded yet. Please try again.");
            return;
        }

        const worker = new Worker('filterWorker.js');
        worker.postMessage({ namesData, startingLetter, selectedGender, lastName, compareSyllables });

        worker.onmessage = function (e) {
            filteredNames = e.data;
            console.log("Filtered Names:", filteredNames);
            currentPage = 1;  // Reset to the first page
            displayNamesForPage(currentPage);
        };

        worker.onerror = function (error) {
            console.error("Error in Web Worker:", error);
        };
    });

    // Parse CSV data
    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            headers.forEach((header, index) => {
                obj[header.trim()] = currentLine[index].trim();
            });

            result.push(obj);
        }
        return result;
    }

    // Function to display names for a specific page
    function displayNamesForPage(page) {
        const namesOutput = document.getElementById('namesOutput');
        namesOutput.innerHTML = ''; // Clear previous results

        const start = (page - 1) * namesPerPage;
        const end = start + namesPerPage;
        const namesToShow = filteredNames.slice(start, end);

        if (namesToShow.length === 0) {
            namesOutput.innerHTML = '<li>No names found</li>';
            return;
        }

        namesToShow.forEach(name => {
            const syllables = countSyllables(name.Name);
            const description = getNameDescription(name.Name);
            const popularity = getPopularityStatement(namesData.filter(n => n.Name === name.Name));

            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${name.Name}</strong> (${name.Gender === 'M' ? 'Male' : 'Female'}) - Syllables: ${syllables}
                <br>Description: ${description}
                <br>Popularity: ${popularity}
            `;
            namesOutput.appendChild(li);
        });

        // Update pagination controls
        displayPaginationControls(page);
    }

    // Function to display pagination controls
    function displayPaginationControls(page) {
        const totalPages = Math.ceil(filteredNames.length / namesPerPage);
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';  // Clear previous controls

        // Create "Previous" button
        if (page > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.onclick = () => goToPage(page - 1);
            paginationControls.appendChild(prevButton);
        }

        // Create page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.onclick = () => goToPage(i);
            if (i === page) {
                pageButton.disabled = true;  // Disable the current page button
            }
            paginationControls.appendChild(pageButton);
        }

        // Create "Next" button
        if (page < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.onclick = () => goToPage(page + 1);
            paginationControls.appendChild(nextButton);
        }
    }

    // Function to change the page
    function goToPage(page) {
        currentPage = page;
        displayNamesForPage(page);
    }

    // Function to count syllables (as before)
    function countSyllables(name) {
        name = name.toLowerCase();
        if (name.length <= 3) return 1;
        name = name.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        name = name.replace(/^y/, '');
        const syllableMatches = name.match(/[aeiouy]{1,2}/g);
        return syllableMatches ? syllableMatches.length : 1;
    }

    // Function to get a brief description of the name (dummy data for now)
    function getNameDescription(name) {
        const descriptions = {
            "John": "John is a classic name meaning 'God is gracious.'",
            "Emma": "Emma is a popular name meaning 'whole' or 'universal.'",
            "Olivia": "Olivia is a Latin name meaning 'olive tree.'"
        };
        return descriptions[name] || `The name ${name} is unique and beautiful.`;
    }

    // Function to calculate name popularity
    function getPopularityStatement(names) {
        if (names.length === 0) return "No data on this name's popularity.";

        const totalBabies = names.reduce((sum, n) => sum + parseInt(n.Count, 10), 0);
        return `The name has a total of ${totalBabies} occurrences.`;
    }
});