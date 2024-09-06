self.onmessage = function(e) {
  const { namesData, startingLetter, selectedGender, lastName, compareSyllables } = e.data;

  console.log("Data received in worker:", e.data);  // Log the entire data received by the worker

  if (!namesData || !startingLetter || !selectedGender) {
      postMessage([]);  // Return empty if anything is missing
      return;
  }

  const filteredNames = namesData.filter(name => {
      // Check if 'Name' field exists and is valid
      if (!name.Name || typeof name.Name !== 'string') {
          console.warn('Skipping entry due to missing or invalid Name:', name);
          return false;
      }

      // Get the first letter of the name
      const nameFirstLetter = name.Name.trim().charAt(0).toLowerCase();
      console.log("First letter of name:", name.Name.trim().charAt(0).toLowerCase());

      // Log what the script believes the start letter is
      console.log(`Name: ${name.Name}, First letter from CSV: ${nameFirstLetter}, User's starting letter: ${startingLetter}`);

      const lastNameStartingLetter = lastName.trim().charAt(0).toLowerCase();
      console.log("First letter of last name:", name.Name.trim().charAt(0).toLowerCase());

      // First letter match check
      const firstLetterMatch = nameFirstLetter === startingLetter;
      console.log(firstLetterMatch);

      // Gender match check
      const genderMatch = name.Gender === selectedGender;

      // If lastName is empty, skip alliteration and syllable check
      if (!lastName) {
          return firstLetterMatch && genderMatch;  // Only filter by gender
      }

      // Alliteration check
      const alliterationMatch = nameFirstLetter === lastNameStartingLetter;

      if (!compareSyllables && !lastName) {
        return firstLetterMatch && genderMatch
      }

      if (lastName && !compareSyllables) {
        console.log(`First Name Letter: ${nameFirstLetter}, Last Name Letter: ${lastNameStartingLetter}, Alliteration Match: ${alliterationMatch}`);
        return firstLetterMatch && genderMatch && alliterationMatch
      }

      const firstNameSyllables = countSyllables(name.Name);
      const lastNameSyllables = lastName ? countSyllables(lastName) : 0; // Count syllables of last name if provided
      const matchesSyllables = lastName ? firstNameSyllables === lastNameSyllables : true; // Compare syllables if last name is provided

      return firstLetterMatch && genderMatch && alliterationMatch && matchesSyllables;
  });

  postMessage(filteredNames);
};

// Function to count syllables
function countSyllables(name) {
  name = name.toLowerCase();
  if (name.length <= 3) return 1; // Short names likely have 1 syllable
  name = name.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  name = name.replace(/^y/, '');
  const syllableMatches = name.match(/[aeiouy]{1,2}/g);
  return syllableMatches ? syllableMatches.length : 1;
}