// Fetch the CSV file and parse it
let namesData = [];

fetch('baby_names.csv')
  .then(response => response.text())
  .then(data => {
    namesData = parseCSV(data); // Parse the CSV data into an array
  });

document.getElementById('filterBtn').addEventListener('click', function() {
  const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
  const minPopularity = parseInt(document.getElementById('popularity').value, 10);
  const selectedGender = document.getElementById('gender').value;

  // Filter names based on user input
  const filteredNames = namesData.filter(name => {
    const nameMatch = !startingLetter || name.Name.toLowerCase().startsWith(startingLetter);
    const popularityMatch = !minPopularity || parseInt(name.Count, 10) >= minPopularity;
    const genderMatch = selectedGender === 'any' || name.Gender === selectedGender;

    return nameMatch && popularityMatch && genderMatch;
  });

  displayNames(filteredNames);
});

// Display the filtered names
function displayNames(names) {
  const namesOutput = document.getElementById('namesOutput');
  namesOutput.innerHTML = '';

  if (names.length === 0) {
    namesOutput.innerHTML = '<li>No names found</li>';
    return;
  }

  names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${name.Name} (${name.Gender === 'M' ? 'Male' : 'Female'}) - Popularity: ${name.Count} (Year: ${name.Year})`;
    namesOutput.appendChild(li);
  });
}

// Simple CSV parser for the structure: Year,Name,Gender,Count
function parseCSV(data) {
  const rows = data.split('\n');
  const namesArray = [];

  rows.forEach(row => {
    const [Year, Name, Gender, Count] = row.split(',');

    if (Name) {
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