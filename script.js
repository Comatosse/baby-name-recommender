document.addEventListener('DOMContentLoaded', function() {
    let namesData = [];
  
    // Fetch and parse the CSV
    fetch('baby_names.csv')
      .then(response => response.text())
      .then(data => {
        namesData = parseCSV(data);
      })
      .catch(error => {
        console.error("Error loading CSV file:", error);
      });
  
    document.getElementById('filterBtn').addEventListener('click', function() {
      const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
      const selectedGender = document.getElementById('gender').value;
      const lastName = document.getElementById('lastName').value;
  
      if (!namesData || namesData.length === 0) {
        alert("Names data not loaded yet. Please try again.");
        return;
      }
  
      const worker = new Worker('filterWorker.js');
      worker.postMessage({ namesData, startingLetter, selectedGender, lastName });
  
      worker.onmessage = function(e) {
        const filteredNames = e.data;
        displayNames(filteredNames, lastName);
      };
  
      worker.onerror = function(error) {
        console.error("Error in Web Worker:", error);
      };
    });
  
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
  });
  