# Baby Name Recommender

Welcome to the Baby Name Recommender! This web application helps users find baby names based on various criteria such as starting letter, gender, and name popularity. The app evaluates names based on syllable count and allows for alliteration comparisons with a last name.

## Features

- **Filter by Starting Letter**: Enter a letter to find names that start with that letter.
- **Gender Selection**: Choose to filter names based on gender (Male/Female).
- **Alliteration Check**: Input a last name to see if the first name alliterates with it.
- **Syllable Comparison**: Compare the syllables of the first name with the last name.
- **Popularity**: View how popular a name is based on historical data.

## Technologies Used

- HTML
- CSS
- JavaScript
- Web Workers (for filtering large datasets)

## File Structure

``` File Structure
/baby-name-finder
├── index.html # Main HTML file for the application
├── style.css # CSS file for styling the application
├── script.js # JavaScript file for the main application logic
├── filterWorker.js # Web Worker for handling name filtering
└── baby_names.csv # CSV file containing baby names data
```
## Getting Started

### Prerequisites

To run this application, you'll need a modern web browser (like Chrome, Firefox, or Edge) that supports HTML5 and JavaScript.

### Running the Application

1. Clone the repository or download the files.
2. Open `index.html` in your web browser. 
3. Use the input fields to filter names based on your criteria.

## How It Works

1. **CSV Data Parsing**: The application reads a CSV file containing baby names, genders, and counts.
2. **User Input Handling**: It captures user inputs for the starting letter, gender, last name, and syllable comparison.
3. **Filtering Logic**: Utilizes a Web Worker to filter names based on user inputs efficiently, ensuring a smooth user experience.
4. **Display Results**: Outputs the filtered names along with syllable counts, descriptions, and uniqueness scores.

## Contribution

Feel free to fork this repository, make changes, and submit pull requests. Your contributions are welcome!

## License

This project is open-source and available under the [MIT License](LICENSE).

## Contact

For any questions or suggestions, feel free to reach out at [rbend10@eq.edu.au].
