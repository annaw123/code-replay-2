document.addEventListener('DOMContentLoaded', function () {
    const typingSpeed = 10; // Speed in milliseconds
    const typedCodeBlock = document.getElementById('typed-code');
    const hiddenCodeBlock = document.getElementById('hidden-code');
    let linesTyped = [];
    let dynamicCode = "";

    async function fetchCode(filePath) {
        const response = await fetch(filePath);
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

        // compare hiddenCodeBlock with typedCodeBlock
        //hiddenCodeBlock.innerHTML += "<span class='endspan'>&nbsp;</span>";
        let changedElement = findFirstDifferingElement(hiddenCodeBlock, typedCodeBlock);
        moveChildren(hiddenCodeBlock, typedCodeBlock);
        if(changedElement) {
            changedElement.scrollIntoView();
        }
    }

    function findFirstDifferingElement(element1, element2) {
        // Get child elements of both nodes
        let children1 = element1.children;
        let children2 = element2.children;

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


    // Function to simulate typing
    async function typeCode() {

        // Load your code and typing order here (you can use fetch if the files are served)
        const code = await fetchCode("files/hello-world.cs");
        const typingOrder = ["1-6","45","12-13","15","14","7-8","10","9", "21-44", "17-20"]; // Example order

        let lines = code.split('\n');
        for (let range of typingOrder) {
            let [start, end] = range.split('-').map(Number);
            for (let i = start; i <= (end || start); i++) {
                let ii = i - 1;

                let line = lines[ii].replace(/\t/g,"    ");

                if(line.trim() == 'static void LastOutput()') {
                    console.log('aargh');
                }
                // find where to start typing the next line
                let insertLine = getInsertLine(ii);
                let insertPoint = findNthNewlinePosition(dynamicCode, insertLine);

                await typeLine(line, insertPoint);
                linesTyped.push(ii);
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

    // Start typing
    typeCode();
});
