let namesData = [];

// Fetch and parse the CSV
fetch('baby_names.csv')
  .then(response => response.text())
  .then(data => {
    namesData = parseCSV(data);
  });

document.getElementById('filterBtn').addEventListener('click', function() {
  const startingLetter = document.getElementById('startingLetter').value.toLowerCase();
  const selectedGender = document.getElementById('gender').value;
  const lastName = document.getElementById('lastName').value;

  // Filter the names
  const filteredNames = namesData.filter(name => {
    const nameMatch = !startingLetter || name.Name.toLowerCase().startsWith(startingLetter);
    const genderMatch = selectedGender === 'any' || name.Gender === selectedGender;
    const alliterates = checkAlliteration(name.Name, lastName);

    return nameMatch && genderMatch && alliterates;
  });

  displayNames(filteredNames, lastName);
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

// CSV Parsing
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