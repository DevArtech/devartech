let colorMode = "dark";
let mobileFriendly = false;

document.addEventListener("DOMContentLoaded", function () {
  // Focus on the input field when the page is loaded
  document.querySelector(".input-field").focus();
  document.getElementById("commandInput").value = "";
  appendNewlines(init);

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    // Code for mobile devices
    mobileFriendly = true;
  } else {
    const dark = document.querySelectorAll(".dark");
    for (let i = 0; i < dark.length; i++) {
      dark[i].classList.add("mf");
    }
  }

  // Add event listener for form submission
  document
    .querySelector(".input-container")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the form from submitting

      // Get the value of the input field
      const inputValue = document.getElementById("commandInput").value;

      if (inputValue.trim() !== "") {
        // Create a new element with the entered text
        const outputElement = document.createElement("div");
        outputElement.textContent = "> " + inputValue;
        outputElement.classList.add("terminal-input");

        // Append the element to the page
        document.querySelector(".body").appendChild(outputElement);
        checkInput(inputValue);

        // Clear the input field
        document.getElementById("commandInput").value = "";
        window.scrollTo(0, document.body.scrollHeight);
      }

      // Focus on the input field again
      document.querySelector(".input-field").focus();
    });
});

function checkInput(input) {
  const i = input.toLowerCase();

  if (isMathematicalOperator(i)) {
    performMath(i);
  } else if (i === "help" || i === "h") {
    appendNewlines(help);
  } else if (i === "weather" || i === "wttr" || i === "w") {
    getWeather();
  } else if (i === "projects" || i === "project" || i === "p") {
    appendNewlines(projects);
  } else if (i === "contacts" || i === "contact" || i === "co") {
    appendNewlines(contacts);
  } else if (i === "invert" || i === "i") {
    invertPage();
  } else if (i === "mobile-friendly" || i === "mf") {
    switchMobileFriendly();
  } else if (i === "clear" || i === "c") {
    clearPage();
  } else {
    appendNewlines(error);
  }
}

function isMathematicalOperator(input) {
  const expression = /^(?:\d|\()/;
  return expression.test(input);
}

function performMath(expression) {
  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3,
  };

  function applyOperator(operator, operand1, operand2) {
    if (operator === "/" && operand2 === 0) {
      console.error("Error: Division by zero");
      return NaN;
    }

    switch (operator) {
      case "+":
        return operand1 + operand2;
      case "-":
        return operand1 - operand2;
      case "*":
        return operand1 * operand2;
      case "/":
        return operand1 / operand2;
      case "^":
        return Math.pow(operand1, operand2);
      default:
        throw new Error("Unknown operator: " + operator);
    }
  }

  function shuntingYard(expression) {
    const outputQueue = [];
    const operatorStack = [];

    // Updated regex to support decimal numbers
    const tokens = expression.match(/\d+\.\d+|\d+|\+|\-|\*|\/|\^|\(|\)/g) || [];

    tokens.forEach((token) => {
      if (!isNaN(token)) {
        outputQueue.push(parseFloat(token));
      } else if (token in precedence) {
        while (
          operatorStack.length > 0 &&
          precedence[operatorStack[operatorStack.length - 1]] >=
            precedence[token]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== "("
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.pop();
      }
    });

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
  }

  function evaluatePostfix(postfixExpression) {
    const stack = [];

    postfixExpression.forEach((token) => {
      if (!isNaN(token)) {
        stack.push(token);
      } else {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        const result = applyOperator(token, operand1, operand2);
        stack.push(result);
      }
    });

    return stack.pop();
  }

  const postfixExpression = shuntingYard(expression);
  const result = evaluatePostfix(postfixExpression);
  appendNewlines(result.toString());
}

function switchMobileFriendly() {
  if (mobileFriendly) {
    const dark = document.querySelectorAll(".dark");
    for (let i = 0; i < dark.length; i++) {
      dark[i].classList.add("mf");
    }
    mobileFriendly = false;
  } else {
    const dark = document.querySelectorAll(".dark");
    for (let i = 0; i < dark.length; i++) {
      dark[i].classList.remove("mf");
    }
    mobileFriendly = true;
  }
}

function clearPage() {
  // Clear the page
  const outputElements = document.querySelectorAll(".terminal-input");
  outputElements.forEach(function (element) {
    element.remove();
  });
  appendNewlines(init);
}

function invertPage() {
  let newColorMode = colorMode;
  if (colorMode == "dark") {
    newColorMode = "light";
  } else {
    newColorMode = "dark";
  }

  var darkElements = document.querySelectorAll("." + colorMode);
  darkElements.forEach(function (element) {
    if (element.classList.contains(colorMode)) {
      // If it has, set it to "light"
      element.classList.replace(colorMode, newColorMode);
    }
  });

  colorMode = newColorMode;
}

function appendNewlines(text) {
  document.querySelector(".input-field").disabled = true;
  // Console.log all lines of text while maintaining the whitespace
  const numChars = text.length;
  if (text.indexOf("\n") === -1) {
    const outputElement = document.createElement("div");
    // Parse the resultString and add colorMode class
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const elements = doc.querySelectorAll("*");

    elements.forEach((element) => {
      element.classList.add(colorMode);
    });

    outputElement.innerHTML = doc.documentElement.outerHTML;
    outputElement.classList.add("terminal-input");
    document.querySelector(".body").appendChild(outputElement);
  } else {
    let resultString = "";
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") {
        const outputElement = document.createElement("div");
        // Parse the resultString and add colorMode class
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultString, "text/html");

        const elements = doc.querySelectorAll("*");

        elements.forEach((element) => {
          element.classList.add(colorMode);
        });

        outputElement.innerHTML = doc.documentElement.outerHTML;
        outputElement.classList.add("terminal-input");

        setTimeout(() => {
          document.querySelector(".body").appendChild(outputElement);
          window.scrollTo(0, document.body.scrollHeight);
        }, i * 0.25);

        resultString = "";
      } else {
        if (text[i] == "\\") {
          resultString += "\u005C";
        } else {
          resultString += text[i];
        }
      }
    }
  }
  setTimeout(() => {
    document.querySelector(".input-field").disabled = false;
    document.querySelector(".input-field").focus();
  }, numChars * 0.25);
}

async function getWeather() {
  document.querySelector(".input-field").disabled = true;
  try {
    const response = await fetch("https://wttr.in");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    const preElement = doc.querySelector("pre");
    const preContent = preElement ? preElement.innerHTML : null;

    appendNewlines(preContent);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function getProjects() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> projects";
  outputElement.classList.add("terminal-input");

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  appendNewlines(projects);
}

function getContacts() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> contacts";
  outputElement.classList.add("terminal-input");

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  appendNewlines(contacts);
}

function weather() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> weather";
  outputElement.classList.add("terminal-input");

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  getWeather();
}

const currentYear = new Date().getFullYear();

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
 ​
Type 'help' to get started. © DevArtech ${currentYear}
`;

const help = `
Welcome to the portfolio page of DevArtech!
​
Available Commands (Pages):
 - <a href="javascript:void(0)" onclick="getProjects()">projects, p</a>: List the current projects DevArtech is working on or has worked on.
 - <a href="javascript:void(0)" onclick="getContacts()">contact, co</a>: Contact information for DevArtech.
 - <a href="javascript:void(0)" onclick="weather()">weather wttr</a>: Get the current weather of your area.
 - <a href="javascript:void(0)" onclick="invertPage()">invert i</a>: Invert the page's color.
 - <a href="javascript:void(0)" onclick="clearPage()">clear c</a>: Clear the terminal.
 - <a href="javascript:void(0)" onclick="switchMobileFriendly()">mobile-friendly mf</a>: Switch effects to mobile-friendly.
 - Math: Input any algebraic expression to be evaluated.
 ​
I am Artech, also known as DevArtech or Adam Haile, and I am a current computer science student at MSOE. 
I am most well known for my game development and MC Map creation but am also an avid Additive Manufacturer 
and 3D Printing developer and 3D designer. I'm currently working on studying the world of AI/ML so if you 
would like to contact me with more information on this science, please do so! 
​
<a href='https://drive.google.com/file/d/1cogawcy3mon54x3XdpdEpYGirClaB2x1/view?usp=sharing' target="_blank">Resume</a>
Github: <a href='https://github.com/DevArtech' target="_blank">github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech' target="_blank">x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/' target="_blank">instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/' target="_blank">linkedin.com/in/devartech</a>
`;

const projects = `
Current Projects:
 - Game Development: <a href='https://store.steampowered.com/app/1631930/The_Insignia_Project/' target="_blank">The Insignia Project</a>
    - The Insignia Project is a horror game that delves into an alternate universe within our multiverse where it has been 
      corrupted and broken beyond repair. UO#-405 is now an ever-consuming universe where all of your nightmares come together 
      into one place. Our universe has just been added to the mix. 
      ​
 - 3D Printing: Additive Manufacturing is a technique I've been learning the past four years to prototype efficiently and 
   quickly. I've designed and printed tons of models and have learned many different factors to making models in ways they are 
   needed and wanted, in terms of strength, efficiency, and speed of production. I've obtained mamy different Solidworks 
   Certifcations with this as well.
   ​
 - Artificial Intelligence: Artifical Intelligence is a science I am still learning and working with to be my end goal. 
   I've always enjoyed puzzles and critical thinking scenarios so AI/ML sciences has very much caught my attention in that regard. 
   On my <a href='https://github.com/Adam-Haile' target="_blank">school GitHub</a> are a variety of projects which I have created for extra curriculars 
   and for classes. Amongst them are a project of deepfake detection and a video to audio model!
`;

const contacts = `
Email: <a href='mailto:iamhaile222@gmail.com' target="_blank">iamhaile222@gmail.com</a> or <a href='mailto:hailea@msoe.edu' target="_blank">hailea@msoe.edu</a>
Github: <a href='https://github.com/DevArtech' target="_blank">github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech' target="_blank">x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/' target="_blank">instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/' target="_blank">linkedin.com/in/devartech</a>
`;

const error = `
Unknown command. Type "help" to get started.
`;
