self.onmessage = function(e) {
  const { namesData, startingLetter, selectedGender, lastName, compareSyllables } = e.data;

  console.log("Data received in worker:", e.data);  // Log the entire data received by the worker

  if (!namesData || !startingLetter || !selectedGender) {
    postMessage([]);  // Return empty if anything is missing
    return;
  }

  // Map to store unique names and merge their stats (for duplicates)
  const nameMap = {};

  namesData.forEach(name => {
    // Check if 'Name' field exists and is valid
    if (!name.Name || typeof name.Name !== 'string') {
      console.warn('Skipping entry due to missing or invalid Name:', name);
      return; // Skip this entry
    }

    // Get the first letter of the name
    const nameFirstLetter = name.Name.trim().charAt(0).toLowerCase();
    console.log(`Name: ${name.Name}, First letter from CSV: ${nameFirstLetter}, User's starting letter: ${startingLetter}`);

    const lastNameStartingLetter = lastName.trim().charAt(0).toLowerCase();

    // First letter match check
    const firstLetterMatch = nameFirstLetter === startingLetter;

    // Gender match check
    const genderMatch = name.Gender === selectedGender;

    // If lastName is empty, skip alliteration and syllable check
    if (!lastName) {
      if (firstLetterMatch && genderMatch) {
        mergeNameStats(nameMap, name);  // Merge or add to nameMap
      }
      return; // No need to do further checks if lastName is empty
    }

    // Alliteration check
    const alliterationMatch = nameFirstLetter === lastNameStartingLetter;

    // If syllable comparison is off, check for alliteration only
    if (!compareSyllables) {
      if (firstLetterMatch && genderMatch && alliterationMatch) {
        mergeNameStats(nameMap, name);  // Merge or add to nameMap
      }
      return;
    }

    // Syllable comparison
    const firstNameSyllables = countSyllables(name.Name);
    const lastNameSyllables = lastName ? countSyllables(lastName) : 0; // Count syllables of last name if provided
    const matchesSyllables = lastName ? firstNameSyllables === lastNameSyllables : true; // Compare syllables if last name is provided

    // All conditions met
    if (firstLetterMatch && genderMatch && alliterationMatch && matchesSyllables) {
      mergeNameStats(nameMap, name);  // Merge or add to nameMap
    }
  });

  // Convert nameMap back to array and post the result
  const filteredNames = Object.values(nameMap);
  postMessage(filteredNames);
};

// Function to merge duplicate names into nameMap
function mergeNameStats(nameMap, name) {
  const nameKey = name.Name;

  if (nameMap[nameKey]) {
    nameMap[nameKey].Count += parseInt(name.Count, 10);  // Add the counts for duplicates
  } else {
    // Add new entry for this name with initial stats
    nameMap[nameKey] = { ...name, Count: parseInt(name.Count, 10) };
  }
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
