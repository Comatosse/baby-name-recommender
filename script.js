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
      try {
        const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
        const selectedGender = document.getElementById('gender').value;
        const lastName = document.getElementById('lastName').value;
  
        if (!namesData || namesData.length === 0) {
          alert("Names data not loaded yet. Please try again.");
          return;
        }
  
        // Filter the names based on the user input
        const filteredNames = namesData.filter(name => {
          const nameMatch = !startingLetter || name.Name.toLowerCase().startsWith(startingLetter);
          const genderMatch = selectedGender === 'any' || name.Gender === selectedGender;
          const alliterates = checkAlliteration(name.Name, lastName);
  
          return nameMatch && genderMatch && alliterates;
        });
  
        displayNames(filteredNames, lastName);
      } catch (error) {
        console.error("Error processing filter:", error);
        alert("An error occurred while processing your request. Please check the console for more details.");
      }
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
  
    function parseCSV(data) {
      const rows = data.split('\n');
      const namesArray = [];
  
      rows.forEach(row => {
        const [Year, Name, Gender, Count] = row.split(',');
  
        if (Name && Gender && Count) {
          namesArray.push({
            Year,
            Name,
            Gender,
            Count
          });
        }
      });
  
      return namesArray;
    }
  
    // Function to check alliteration (same starting letter as last name)
    function checkAlliteration(firstName, lastName) {
      if (!lastName) return true; // If last name is empty, ignore alliteration check
      return firstName.charAt(0).toLowerCase() === lastName.charAt(0).toLowerCase();
    }
  
    // Function to count syllables in a name
    function countSyllables(name) {
      name = name.toLowerCase();
      if (name.length <= 3) return 1;
  
      const vowels = 'aeiouy';
      let syllables = 0;
      let lastWasVowel = false;
  
      for (let i = 0; i < name.length; i++) {
        const char = name.charAt(i);
        if (vowels.indexOf(char) !== -1) {
          if (!lastWasVowel) {
            syllables++;
          }
          lastWasVowel = true;
        } else {
          lastWasVowel = false;
        }
      }
  
      // Remove a syllable if the name ends with 'e' (silent e rule)
      if (name.endsWith('e')) {
        syllables--;
      }
  
      return syllables > 0 ? syllables : 1;
    }
  
    // Function to generate a brief description (placeholder for now)
    function getNameDescription(name) {
      // Placeholder description
      return `The name ${name} is beautiful and timeless.`;
    }
  
    // Function to generate a popularity statement
    function getPopularityStatement(filteredNames) {
      if (filteredNames.length === 0) return 'No data available';
  
      const totalOccurrences = filteredNames.reduce((sum, name) => sum + parseInt(name.Count), 0);
      return `The name has been used ${totalOccurrences} times over the years.`;
    }
  });
  