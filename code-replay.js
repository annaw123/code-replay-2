document.addEventListener('DOMContentLoaded', function () {
    const typedCodeBlock = document.getElementById('typed-code');
    const hiddenCodeBlock = document.getElementById('hidden-code');
    const params = new URLSearchParams(window.location.search);
    const programFileName = params.get('file');
    const speedUpFactor = params.get('speedUpFactor') || 1;
    const typingSpeed = 83.3333333333 / speedUpFactor; // Speed in milliseconds. 24 fps = 41.6666666667. 12 fps = 83.3333333333
    if(!programFileName) {
        typedCodeBlock.innerHTML = "<p>Error: No file specified. Add ?file=filename to the URL</p>";
        return;
    }
    const consoleFileName = programFileName.replace(".cs", ".txt");

    let linesTyped = [];
    let dynamicCode = "";

    async function fetchFile(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            typedCodeBlock.innerHTML = "<p>Error loading file: " + filePath + "</p>";
        }
        return response.text();
    }

    function getInsertLine(line) {
        for (let i = 0; i < linesTyped.length; i++) {
            if (line < linesTyped[i]) {
                return i;
            }
        }
        return linesTyped.length;
    }

    function findNthNewlinePosition(str, n) {
        let count = 1;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '\n') {
                count++;
                if (count === n) {
                    return i;
                }
            }
        }
        return str.length; // put at the end of the string
    }

    async function insertCharAt(char, position) {
        // Ensure the position is within the string's length
        if (position > dynamicCode.length) {
            position = dynamicCode.length;
        } else if (position < 0) {
            position = 0;
        }

        // Slice and concatenate
        dynamicCode = dynamicCode.slice(0, position) + char + dynamicCode.slice(position);
        hiddenCodeBlock.textContent = dynamicCode;
        hiddenCodeBlock.removeAttribute("data-highlighted");
        await hljs.highlightElement(hiddenCodeBlock);

        // wrap any hiddenCodeBlock text fragment that is not wrapped in a span with a span
        let children = hiddenCodeBlock.childNodes;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "#text") {
                let span = document.createElement("span");
                span.textContent = children[i].textContent;
                children[i].replaceWith(span);
            }
        }

        // compare hiddenCodeBlock with typedCodeBlock
        let changedElement = findFirstDifferingElement(hiddenCodeBlock, typedCodeBlock);

        // now move the children from hiddenCodeBlock to typedCodeBlock
        moveChildren(hiddenCodeBlock, typedCodeBlock);

        // now scroll to the changed element if necessary
        if(changedElement) {
            changedElement.scrollIntoViewIfNeeded();
        }
    }

    function findFirstDifferingElement(element1, element2) {
        // Get child nodes of both nodes
        let children1 = element1.childNodes;
        let children2 = element2.childNodes;

        // Ensure both elements have children
        if (!children1 || !children2) return null;

        // Compare number of children
        let length = Math.min(children1.length, children2.length);

        // Iterate over each pair of children
        for (let i = 0; i < length; i++) {
            // Check if content is different
            if (children1[i].textContent !== children2[i].textContent) {
                return children1[i]; // Return the first differing element
            }
        }

        return null; // No differing element found
    }

    function moveChildren(sourceDiv, targetDiv) {
        targetDiv.innerHTML = "";
        while (sourceDiv.firstChild) {
            targetDiv.appendChild(sourceDiv.firstChild);
        }
    }

    function indentLevel(line) {
        return (line.trimEnd().match(/^\t+/) || [''])[0].length;
    }

    function isBlankLine(line) {
        return line.trim() === "";
    }

    function addToArray(lines, arr, startIx, endIx) {
        let activeIndentLevel = null;
        for (let ix = startIx; ix <= endIx; ix++) {
            let line = lines[ix];
            if(line.trim() === "class Program") {
                console.log("aargh");
            }
            let level = indentLevel(line);
            if(isBlankLine(line)) {
                arr.push(ix);
            } else if(activeIndentLevel === null) {
                arr.push(ix);
                activeIndentLevel = level;
            } else if(level <= activeIndentLevel) {
                arr.push(ix);
            } else if(lines[ix - 1].trim().startsWith("case") && level == activeIndentLevel + 1) {
                arr.push(ix);
                activeIndentLevel = level;
            } else {
                // find the next non-blank line with the same indent level as this one
                let nextIx = ix + 1;
                while(nextIx < endIx) {
                    let nextLine = lines[nextIx];
                    if(isBlankLine(nextLine)) {
                        // keep going irrespective of indent level
                    } else if(indentLevel(nextLine) <= activeIndentLevel) {
                        break;
                    }
                    nextIx++;
                }
                arr.push(nextIx);
                if(nextIx - ix > 1) {
                    addToArray(lines, arr, ix, nextIx - 1)
                } else if(nextIx - ix == 1) {
                    arr.push(ix);
                }
                ix = nextIx;
            }
        }
    }



    // Function to simulate typing
    async function typeCode() {
        // Load your code and typing order here (you can use fetch if the files are served)
        // const code = await fetchCode("files/hello-world.cs");
        const code = await fetchFile("files/"+programFileName);

        let lines = code.split('\n');

        // set up an array of line numbers to type in order
        // for example, typingOrder = ["1-3", "5", "7-10"] means type lines 1, 2, 3, 5, 7, 8, 9, 10
        // put this at the end of your file in a comment like this: // typingOrder=1-3,5,7-10
        // if typingOrder is not specified, then type all lines in order

        // look in reverse order through the lines array and find the first line that contains the string "typingOrder="
        let lastLine = null;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes("typingOrder=")) {
                lastLine = i;
                break;
            }
        }
        if(lastLine === null) {
            typingOrder = [`1-${lines.length}`];
        } else {
            typingOrder = lines[lastLine].trim().replace(/\s/g,"").split("=")[1].split(",");
        }

        // add a blank line at the beginning so that the line numbers match the array indices
        lines.unshift("");

        for (let range of typingOrder) {
            let [start, end] = range.split('-').map(Number);
            end ||= start;

            let arr = [];
            addToArray(lines, arr, start, end);

            for(let ix of arr) {
                let line = lines[ix].replace(/\t/g,"    ");

                // find where to start typing the next line
                let insertLine = getInsertLine(ix);
                let insertPoint = findNthNewlinePosition(dynamicCode, insertLine);

                await typeLine(line, insertPoint);
                linesTyped.push(ix);
                linesTyped = linesTyped.sort((a, b) => a - b);
            }
        }
    }

    // Function to type a line
    function typeLine(line, insertPoint) {
        return new Promise(resolve => {
            let index = -1;
            let interval = setInterval(() => {
                if (index == -1)  {
                    if (insertPoint > 0) {
                        insertCharAt('\n', insertPoint);
                        insertPoint++;
                    }
                    index++;
                } else if (index < line.length) {
                    insertCharAt(line[index++], insertPoint);
                    insertPoint++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, typingSpeed);
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function typeResults() {
        await delay(2000);
        const consoleText = await fetchFile("files/"+consoleFileName);
        const delayMs = 400 / speedUpFactor;
        let consoleOutputEl = document.getElementById("console-text");
        let lines = consoleText.split('\n');
        for (let line of lines) {
            let p = document.createElement("p");
            if (line.length > 0 && line.charAt(0) === '*') {
                p.className = 'user-input';
                consoleOutputEl.appendChild(p);
                for(i = 0; i < 4; i++) {
                    p.textContent = "_";
                    p.scrollIntoViewIfNeeded();
                    await delay(delayMs);
                    p.textContent = " ";
                    p.scrollIntoViewIfNeeded();
                    await delay(delayMs);
                }
                for(i = 1; i < line.length; i++) {
                    p.textContent = line.substring(1, i + 1);
                    p.scrollIntoViewIfNeeded();
                    await delay(delayMs / 4);
                }
                for(i = 0; i < 2; i++) {
                    p.textContent = line.substring(1, line.length) + "_";
                    p.scrollIntoViewIfNeeded();
                    await delay(delayMs);
                    p.textContent = line.substring(1, line.length) + " ";
                    p.scrollIntoViewIfNeeded();
                    await delay(delayMs);
                }
                await delay(delayMs);
            } else {
                p.textContent = line;
                consoleOutputEl.appendChild(p);
                p.scrollIntoViewIfNeeded();
            }
        }
    }

    // Start typing
    typeCode().then(() => {
        typeResults();
    });
});
