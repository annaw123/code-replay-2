# Code Replay

**Code Replay** is a web-based code typing simulation tool. It visually "types out" code files and simulates console input/output, making it ideal for demonstrations, tutorials, or educational purposes.

## Features

- Animated code typing for C# and Python files.
- Simulated console output with user input.
- Syntax highlighting powered by [Highlight.js](highlight/README.md).
- Customizable typing speed and tab width via URL parameters.
- Easily extensible with new code and output files.

## Usage

1. **Install dependencies:**  
   No installation required. All dependencies are included in the repository.

2. **Run locally:**  
   Open [index.html](index.html) in your browser, specifying the code file via URL, for example `/?file=hello-world.cs`

3. **Adding programs**
   Place your code file (e.g. `my-program.cs`) in the `files/` folder.  
   Add a comment (e.g. `// typingOrder=...`) to control the typing sequence. Use a hyphen (-) for blocks, e.g. 1-9 and commas (,) to separate e.g. 1-9,23,10  
   Add a corresponding `.txt` file for the console output (e.g., `my-program.txt`). For 'user input', use an asterisk (*) on a new line.

**Optional parameters:**
- `speedUpFactor` — Increase typing speed (e.g., `&speedUpFactor=2`)
- `tabs` — Set spaces per tab (e.g., `&tabs=2`)

## Syntax highlighting
Highlight.js is used for syntax highlighting. Themes can be changed by editing the `<link rel="stylesheet">` in [index.html](index.html).  
See [highlight/styles/](highlight/styles/) for available themes.
