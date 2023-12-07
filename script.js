let colorMode = "dark";

document.addEventListener('DOMContentLoaded', function() {
    // Focus on the input field when the page is loaded
    document.querySelector('.input-field').focus();
    document.getElementById('commandInput').value = '';
    appendNewlines(init);
    
    // Add event listener for form submission
    document.querySelector('.input-container').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting

        // Get the value of the input field
        const inputValue = document.getElementById('commandInput').value;

        if (inputValue.trim() !== '') {
            // Create a new element with the entered text
            const outputElement = document.createElement('div');
            outputElement.textContent = "> " + inputValue;
            outputElement.classList.add('terminal-input');

            // Append the element to the page
            document.querySelector('.body').appendChild(outputElement);
            checkInput(inputValue);

            // Clear the input field
            document.getElementById('commandInput').value = '';
            window.scrollTo(0, document.body.scrollHeight);
        }

        // Focus on the input field again
        document.querySelector('.input-field').focus();
    });
});

function checkInput(input) {
    const i = input.toLowerCase();
    if (i === "help" || i === "h") {
        appendNewlines(help);
    } 
    else if (i === "weather" || i === "wttr" || i === "w") {
        getWeather();
    } 
    else if (i === "projects" || i === "project" || i === "p") {
        appendNewlines(projects);
    }
    else if (i === "contacts" || i === "contact" || i === "c") {
        appendNewlines(contacts);
    }
    else if (i === "invert" || i === "i") {
        invertPage();
    }
    else {
        appendNewlines(error);
    }
}

function invertPage() {
    let newColorMode = colorMode;
    if(colorMode == "dark") {
        newColorMode = "light";
    } else {
        newColorMode = "dark";
    }

    var darkElements = document.querySelectorAll('.' + colorMode);
    darkElements.forEach(function(element) {
        if (element.classList.contains(colorMode)) {
            // If it has, set it to "light"
            element.classList.replace(colorMode, newColorMode);
        }
    });

    colorMode = newColorMode;
}

function appendNewlines(text) {
    // Console.log all lines of text while maintaining the whitespace
    let resultString = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            const outputElement = document.createElement('div');
            // Parse the resultString and add colorMode class
            const parser = new DOMParser();
            const doc = parser.parseFromString(resultString, 'text/html');

            const elements = doc.querySelectorAll('*');

            elements.forEach(element => {
                element.classList.add(colorMode);
            });

            outputElement.innerHTML = doc.documentElement.outerHTML;
            outputElement.classList.add('terminal-input');

            setTimeout(() => {
                document.querySelector('.body').appendChild(outputElement);
                window.scrollTo(0, document.body.scrollHeight);
            }, i * 0.25);

            resultString = '';
        } else {
            if (text[i] == "\\") {
                resultString += "\u005C";
            } else {
                resultString += text[i];
            }
        }
    }
    document.querySelector('.input-field').focus();
}

async function getWeather() {
    try {
        const response = await fetch('https://wttr.in');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const preElement = doc.querySelector('pre');
        const preContent = preElement ? preElement.innerHTML : null;

        appendNewlines(preContent);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function getProjects() {
    const outputElement = document.createElement('div');
    outputElement.textContent = "> projects";
    outputElement.classList.add('terminal-input');

    // Append the element to the page
    document.querySelector('.body').appendChild(outputElement);
    window.scrollTo(0, document.body.scrollHeight);
    appendNewlines(projects);
}

function getContacts() {
    const outputElement = document.createElement('div');
    outputElement.textContent = "> contacts";
    outputElement.classList.add('terminal-input');

    // Append the element to the page
    document.querySelector('.body').appendChild(outputElement);
    window.scrollTo(0, document.body.scrollHeight);
    appendNewlines(contacts);
}

function weather() {
    const outputElement = document.createElement('div');
    outputElement.textContent = "> weather";
    outputElement.classList.add('terminal-input');

    // Append the element to the page
    document.querySelector('.body').appendChild(outputElement);
    window.scrollTo(0, document.body.scrollHeight);
    getWeather();
}

const init = `
▓█████▄ ▓█████ ██▒   █▓ ▄▄▄       ██▀███  ▄▄▄█████▓▓█████  ▄████▄   ██░ ██ 
▒██▀ ██▌▓█   ▀▓██░   █▒▒████▄    ▓██ ▒ ██▒▓  ██▒ ▓▒▓█   ▀ ▒██▀ ▀█  ▓██░ ██▒
░██   █▌▒███   ▓██  █▒░▒██  ▀█▄  ▓██ ░▄█ ▒▒ ▓██░ ▒░▒███   ▒▓█    ▄ ▒██▀▀██░
░▓█▄   ▌▒▓█  ▄  ▒██ █░░░██▄▄▄▄██ ▒██▀▀█▄  ░ ▓██▓ ░ ▒▓█  ▄ ▒▓▓▄ ▄██▒░▓█ ░██ 
░▒████▓ ░▒████▒  ▒▀█░   ▓█   ▓██▒░██▓ ▒██▒  ▒██▒ ░ ░▒████▒▒ ▓███▀ ░░▓█▒░██▓
 ▒▒▓  ▒ ░░ ▒░ ░  ░ ▐░   ▒▒   ▓▒█░░ ▒▓ ░▒▓░  ▒ ░░   ░░ ▒░ ░░ ░▒ ▒  ░ ▒ ░░▒░▒
 ░ ▒  ▒  ░ ░  ░  ░ ░░    ▒   ▒▒ ░  ░▒ ░ ▒░    ░     ░ ░  ░  ░  ▒    ▒ ░▒░ ░
 ░ ░  ░    ░       ░░    ░   ▒     ░░   ░   ░         ░   ░         ░  ░░ ░
   ░       ░  ░     ░        ░  ░   ░                 ░  ░░ ░       ░  ░  ░
 ░                 ░                                      ░             
 
Type 'help' to get started.
`;

const help = `
Welcome to the portfolio page of DevArtech!
 
I am Artech, also known as DevArtech or Adam Haile, and I am a current computer science student at MSOE. 
I am most well known for my game development and MC Map creation but am also an avid Additive Manufacturer 
and 3D Printing developer and 3D designer. I'm currently working on studying the world of AI/ML so if you 
would like to contact me with more information on this science, please do so! 
 
<a href='https://drive.google.com/file/d/1cogawcy3mon54x3XdpdEpYGirClaB2x1/view?usp=sharing'>Resume</a>
Github: <a href='https://github.com/DevArtech'>github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech'>x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/'>instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/'>linkedin.com/in/devartech</a>
 
Available Commands (Pages):
 - <a href="javascript:void(0)" onclick="getProjects()">projects, p</a>: List the current projects DevArtech is working on or has worked on.
 - <a href="javascript:void(0)" onclick="getContacts()">contact, c</a>: Contact information for DevArtech.
 - <a href="javascript:void(0)" onclick="weather()">weather wttr</a>: Get the current weather of your area.
 - <a href="javascript:void(0)" onclick="invertPage()">invert i</a>: Invert the page's color.
`

const projects = `
Current Projects:
 - Game Development: <a href='https://store.steampowered.com/app/1631930/The_Insignia_Project/'>The Insignia Project</a>
    - The Insignia Project is a horror game that delves into an alternate universe within our multiverse where it has been 
      corrupted and broken beyond repair. UO#-405 is now an ever-consuming universe where all of your nightmares come together 
      into one place. Our universe has just been added to the mix. 
 - 3D Printing: Additive Manufacturing is a technique I've been learning the past four years to prototype efficiently and 
   quickly. I've designed and printed tons of models and have learned many different factors to making models in ways they are 
   needed and wanted, in terms of strength, efficiency, and speed of production. I've obtained mamy different Solidworks 
   Certifcations with this as well.
 - Artificial Intelligence: Artifical Intelligence is a science I am still learning and working with to be my end goal. 
   I've always enjoyed puzzles and critical thinking scenarios so AI/ML sciences has very much caught my attention in that regard. 
   On my <a href='https://github.com/Adam-Haile'>school GitHub</a> are a variety of projects which I have created for extra curriculars 
   and for classes. Amongst them are a project of deepfake detection and a video to audio model!
`

const contacts = `
Email: <a href='mailto:iamhaile222@gmail.com'>iamhaile222@gmail.com</a> or <a href='mailto:hailea@msoe.edu'>hailea@msoe.edu</a>
Github: <a href='https://github.com/DevArtech'>github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech'>x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/'>instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/'>linkedin.com/in/devartech</a>
`

const error = `
Unknown command. Type "help" to get started.
`