self.onmessage = function(e) {
    const { namesData, startingLetter, selectedGender, lastName } = e.data;
  
    // Perform filtering
    const filteredNames = namesData.filter(name => {
      const nameMatch = !startingLetter || name.Name.toLowerCase().startsWith(startingLetter);
      const genderMatch = selectedGender === 'any' || name.Gender === selectedGender;
      const alliterates = name.Name.charAt(0).toLowerCase() === lastName.charAt(0).toLowerCase();
  
      return nameMatch && genderMatch && alliterates;
    });
  
    // Post the filtered data back to the main thread
    self.postMessage(filteredNames);
  };
  