document.addEventListener('DOMContentLoaded', function() {
    let namesData = [];
    let filteredNames = [];
    let currentPage = 1;
    const namesPerPage = 10; // Change this to 15 if you'd like to display 15 names per page

    fetch('baby_names.csv')
        .then(response => response.text())
        .then(data => {
            namesData = parseCSV(data);
            console.log("Parsed CSV data:", namesData);
        })
        .catch(error => {
            console.error("Error loading CSV file:", error);
        });

    document.getElementById('filterBtn').addEventListener('click', function() {
        const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
        const selectedGender = document.getElementById('gender').value;
        const lastName = document.getElementById('lastName').value.toLowerCase();
        const compareSyllables = document.getElementById('compareSyllables').checked;
        const lastNameStartingLetter = lastName.trim().charAt(0).toLowerCase();

        if (!namesData || namesData.length === 0) {
            alert("Names data not loaded yet. Please try again.");
            return;
        }

        console.log("Starting Letter:", startingLetter);
        console.log("Last Name Starting Letter:", lastNameStartingLetter);
        console.log("Selected Gender:", selectedGender);
        console.log("Last Name:", lastName);

        const worker = new Worker('filterWorker.js');
        worker.postMessage({ namesData, startingLetter, selectedGender, lastName, compareSyllables });

        worker.onmessage = function(e) {
            filteredNames = e.data;
            console.log("Filtered Names:", filteredNames);
            goToPage(1);  // Reset to page 1 when new filter is applied
        };

        worker.onerror = function(error) {
            console.error("Error in Web Worker:", error);
        };
    });

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

    // Function to display names with pagination
    function displayNames(names, lastName) {
        const namesOutput = document.getElementById('namesOutput');
        namesOutput.innerHTML = '';

        if (names.length === 0) {
            namesOutput.innerHTML = '<li>No names found</li>';
            return;
        }

        // Paginate the names to display only names for the current page
        const startIndex = (currentPage - 1) * namesPerPage;
        const endIndex = Math.min(startIndex + namesPerPage, names.length);
        const paginatedNames = names.slice(startIndex, endIndex);

        paginatedNames.forEach(name => {
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

        // Update the pagination controls
        displayPaginationControls(currentPage);
    }

    function countSyllables(name) {
        name = name.toLowerCase();
        if (name.length <= 3) return 1;
        name = name.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        name = name.replace(/^y/, '');
        const syllableMatches = name.match(/[aeiouy]{1,2}/g);
        return syllableMatches ? syllableMatches.length : 1;
    }

    function getNameDescription(name) {
        const descriptions = {
            "John": "John is a classic name meaning 'God is gracious.'",
            "Emma": "Emma is a popular name meaning 'whole' or 'universal.'",
            "Olivia": "Olivia is a Latin name meaning 'olive tree.'"
        };
        return descriptions[name] || `The name ${name} is unique and beautiful.`;
    }

    function getPopularityStatement(names) {
        if (names.length === 0) return "No data on this name's popularity.";
        
        const totalBabies = names.reduce((sum, n) => sum + parseInt(n.Count, 10), 0);

        return `The name has a total of ${totalBabies} occurrences.`;
    }

    // Pagination logic
    function goToPage(page) {
        currentPage = page;
        displayNames(filteredNames);
    }

    // Function to display pagination controls
    function displayPaginationControls(page) {
        const totalPages = Math.ceil(filteredNames.length / namesPerPage);
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';  // Clear previous controls
    
        const maxPagesToShow = 5; // Number of pages to show around the current page
        const firstPage = 1;
        const lastPage = totalPages;
    
        // Create "Previous" link
        if (page > 1) {
            const prevLink = document.createElement('a');
            prevLink.textContent = 'Previous';
            prevLink.onclick = () => goToPage(page - 1);
            paginationControls.appendChild(prevLink);
        }
    
        // Show "First Page" and ellipses if the current page is far from the first page
        if (page > 2) {
            const firstLink = document.createElement('a');
            firstLink.textContent = '1';  // First Page
            firstLink.onclick = () => goToPage(1);
            paginationControls.appendChild(firstLink);
    
            if (page > 3) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
        }
    
        // Display page numbers around the current page
        for (let i = Math.max(firstPage, page - 1); i <= Math.min(lastPage, page + 1); i++) {
            const pageLink = document.createElement('a');
            pageLink.textContent = i;
            pageLink.onclick = () => goToPage(i);
            if (i === page) {
                pageLink.style.textDecoration = 'underline';  // Underline current page
                pageLink.style.cursor = 'default';            // Disable pointer on current page
                pageLink.onclick = null;                      // Disable click action
            }
            paginationControls.appendChild(pageLink);
        }
    
        // Show ellipses and "Last Page" if the current page is far from the last page
        if (page < lastPage - 1) {
            if (page < lastPage - 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }
    
            const lastLink = document.createElement('a');
            lastLink.textContent = lastPage;  // Last Page
            lastLink.onclick = () => goToPage(lastPage);
            paginationControls.appendChild(lastLink);
        }
    
        // Create "Next" link
        if (page < lastPage) {
            const nextLink = document.createElement('a');
            nextLink.textContent = 'Next';
            nextLink.onclick = () => goToPage(page + 1);
            paginationControls.appendChild(nextLink);
        }
    }    
});