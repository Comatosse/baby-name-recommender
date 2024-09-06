document.addEventListener('DOMContentLoaded', function() {
    let namesData = [];

    // Fetch and parse the CSV
    fetch('baby_names.csv')
        .then(response => response.text())
        .then(data => {
            namesData = parseCSV(data);
            console.log("Parsed CSV data:", namesData); // Log the parsed CSV data
        })
        .catch(error => {
            console.error("Error loading CSV file:", error);
        });

    document.getElementById('filterBtn').addEventListener('click', function() {
        const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
        const selectedGender = document.getElementById('gender').value;
        const lastName = document.getElementById('lastName').value.toLowerCase();
        const compareSyllables = document.getElementById('compareSyllables').checked; // Get checkbox value

        const lastNameStartingLetter = lastName.trim().charAt(0).toLowerCase()

        if (!namesData || namesData.length === 0) {
            alert("Names data not loaded yet. Please try again.");
            return;
        }

        console.log("Starting Letter:", startingLetter);  // Log starting letter input
        console.log("Last Name Starting Letter:", lastNameStartingLetter);  // Log last name starting letter input
        console.log("Selected Gender:", selectedGender);  // Log gender selection
        console.log("Last Name:", lastName);              // Log last name input

        const worker = new Worker('filterWorker.js');
        worker.postMessage({ namesData, startingLetter, selectedGender, lastName, compareSyllables });

        worker.onmessage = function(e) {
            const filteredNames = e.data;
            console.log("Filtered Names:", filteredNames);  // Log the filtered names received from the worker
            displayNames(filteredNames, lastName);
        };

        worker.onerror = function(error) {
            console.error("Error in Web Worker:", error);
        };
    });

    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];

        // Extract the header
        const headers = lines[0].split(',');

        // Loop through each line after the header
        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            // Create an object for each row
            headers.forEach((header, index) => {
                obj[header.trim()] = currentLine[index].trim();
            });

            result.push(obj);
        }

        return result;
    }

    function displayNames(names, lastName) {
        const namesOutput = document.getElementById('namesOutput');
        namesOutput.innerHTML = '';

        if (names.length === 0) {
            namesOutput.innerHTML = '<li>No names found</li>';
            return;
        }

        names.forEach(name => {
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
    }

    // Function to count syllables in a name
    function countSyllables(name) {
        name = name.toLowerCase();
        if (name.length <= 3) return 1; // Short names likely have 1 syllable
        name = name.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        name = name.replace(/^y/, '');
        const syllableMatches = name.match(/[aeiouy]{1,2}/g);
        return syllableMatches ? syllableMatches.length : 1;
    }

    // Function to get a brief description of the name (dummy data for now)
    function getNameDescription(name) {
        // Example descriptions (these would usually come from an API or pre-existing data)
        const descriptions = {
            "John": "John is a classic name meaning 'God is gracious.'",
            "Emma": "Emma is a popular name meaning 'whole' or 'universal.'",
            "Olivia": "Olivia is a Latin name meaning 'olive tree.'"
        };

        return descriptions[name] || `The name ${name} is unique and beautiful.`;
    }

    // Function to generate a statement about the name's popularity over the years
    function getPopularityStatement(names) {
        if (names.length === 0) return "No data on this name's popularity.";
        
        const totalBabies = names.reduce((sum, n) => sum + parseInt(n.Count, 10), 0);

        return `The name has a total of ${totalBabies} occurrences.`;
    }
});
