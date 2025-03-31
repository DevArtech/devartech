const API_KEY = "";

let colorMode = "dark";
let mobileFriendly = false;
let mode = "";
let previousInputs = [];
let currentIndex = 0;
let generationHistory = []; // Store generate command history

// On page load initializers and event listeners.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".input-field").focus();
  document.getElementById("commandInput").value = "";
  appendNewlines(init);

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    mobileFriendly = true;
  } else {
    const dark = document.querySelectorAll(".dark");
    for (let i = 0; i < dark.length; i++) {
      dark[i].classList.add("mf");
    }
  }

  // Event listeners for the input field
  document
    .querySelector(".input-field")
    .addEventListener("keydown", function (event) {

      // Change input value based on prior inputs
      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (currentIndex > 0) {
          currentIndex--;
          document.querySelector(".input-field").value =
            previousInputs[currentIndex];
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();

        if (currentIndex < previousInputs.length - 1) {
          currentIndex++;
          document.querySelector(".input-field").value =
            previousInputs[currentIndex];
        } else {
          // If at the end, clear the input field
          currentIndex = previousInputs.length;
          document.querySelector(".input-field").value = "";
        }
      }
    });

  // Add event listener for form submission
  document
    .querySelector(".input-container")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const inputValue = document.getElementById("commandInput").value;

      // Logic for adding element to the page
      if (inputValue.trim() !== "") {
        const outputElement = document.createElement("div");
        outputElement.textContent = "> " + inputValue;
        previousInputs.length === 0 ||
        previousInputs[previousInputs.length - 1] !== inputValue
          ? previousInputs.push(inputValue)
          : null;
        currentIndex = previousInputs.length;
        outputElement.classList.add("terminal-input");

        document.querySelector(".body").appendChild(outputElement);
        checkInput(inputValue);

        document.getElementById("commandInput").value = "";
        window.scrollTo(0, document.body.scrollHeight);
      }

      // Refocus input field
      document.querySelector(".input-field").focus();
    });
});

// Add encoding/decoding functionality
const cols = ['D', 'E', 'V'];
const rows = ['A', 'R', 'T'];
const coordList = [];
for (const row of rows) {
  for (const col of cols) {
    coordList.push(col + row);
  }
}
const mapping = {};
coordList.forEach((coord, i) => mapping[i] = coord);

function letterToNum(letter) {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
}

function numToLetter(num) {
  return String.fromCharCode(num + 'A'.charCodeAt(0) - 1);
}

function toBase9(n) {
  if (n === 0) return "0";
  let digits = [];
  while (n) {
    digits.push(String(n % 9));
    n = Math.floor(n / 9);
  }
  return digits.reverse().join("");
}

function decodeMessage(encodedMessage) {
  // Create reverse mapping dictionary
  const reverseMapping = {};
  Object.entries(mapping).forEach(([k, v]) => reverseMapping[v] = k);
  
  // Convert coordinate values back to base 9 numbers
  const base9Nums = [];
  for (const coord of encodedMessage) {
    // Split into pairs of coordinates
    const first = coord.substring(0, 2);
    const second = coord.substring(2, 4);
    // Convert each coordinate to its digit
    base9Nums.push(reverseMapping[first] + reverseMapping[second]);
  }
  
  // Convert base 9 numbers back to decimal
  const decimalNums = base9Nums.map(num => parseInt(num, 9));
  
  // Convert numbers back to letters
  const decoded = decimalNums.map(num => numToLetter(num));
  
  // Join letters into final message
  return decoded.join('');
}

function isEncodedPattern(text) {
  // Clean the input by removing any extra whitespace
  const cleanedText = text.trim().replace(/\s+/g, ' ');
  const pattern = /^([DEV][ART]){2}( ([DEV][ART]){2})*$/;
  return pattern.test(cleanedText);
}

// Modify the checkInput function to include automatic decoding
function checkInput(input) {
  const i = input.toLowerCase();

  if (mode == "") {
    // Check for encoded pattern before other commands
    if (isEncodedPattern(input)) {
      const decoded = decodeMessage(input.split(' '));
      appendNewlines(`${decoded}`);
      return;
    }

    if (isMathematicalOperator(i)) {
      performMath(i);
    } else if (i === "h") {
      appendNewlines(commands);
    } else if (i === "help") {
      appendNewlines(commands + "\n ​\n" + help);
    } else if (i === "weather" || i === "wttr" || i === "w") {
      getWeather();
    } else if (i === "projects" || i === "project" || i === "p") {
      appendNewlines(projects);
    } else if (i === "contacts" || i === "contact" || i === "co") {
      appendNewlines(contacts);
    } else if (i === "higher-or-lower" || i === "hl") {
      runMode("higher-or-lower");
    } else if (i === "rock-paper-scissors" || i === "rps") {
      runMode("rock-paper-scissors");
    } else if (i === "blackjack" || i === "b") {
      runMode("blackjack");
    } else if (i === "hangman" || i === "hm") {
      runMode("hangman");
    } else if (i === "tic-tac-toe" || i === "ttt") {
      runMode("tic-tac-toe");
    } else if (i.includes("generate")) {
      document.querySelector(".input-field").disabled = true;
      const userQuery = i.replace("generate ", "").trim();
      
      // Prepare the conversation history for context
      let contents = [];
      
      // Add previous conversation history if it exists
      if (generationHistory.length > 0) {
        contents = generationHistory.slice();
      }
      
      // Add the current user query
      contents.push({ role: "user", parts: [{ text: userQuery }] });
      
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: contents })
      }).then(response => response.json()).then(data => {
        const modelResponse = data.candidates[0].content.parts[0].text;
        appendNewlines(modelResponse, "lightblue");
        
        // Store the conversation history
        generationHistory.push({ role: "user", parts: [{ text: userQuery }] });
        generationHistory.push({ role: "model", parts: [{ text: modelResponse }] });
        
        // Limit conversation history to last 10 exchanges (5 turns)
        if (generationHistory.length > 10) {
          generationHistory = generationHistory.slice(generationHistory.length - 10);
        }
        
        document.querySelector(".input-field").disabled = false;
        document.querySelector(".input-field").focus();
      }).catch(error => {
        appendNewlines("Error generating response: " + error, "red");
        document.querySelector(".input-field").disabled = false;
        document.querySelector(".input-field").focus();
      });
    } else if (i === "invert" || i === "i") {
      invertPage();
    } else if (i === "mobile-friendly" || i === "mf") {
      switchMobileFriendly();
    } else if (i === "clear" || i === "c") {
      clearPage();
    } else {
      appendNewlines(error);
    }
  } else {
    runMode(input);
  }
}

// Run specific program which requires user feedback
let number = -1;
let secondaryNumber = 0;
let sentence = "";
let savedSentence = "";
let lettersUsed = [];
let deck = createDeck();
let hands = []
let ticTacToeState = [];

function runMode(input) {
  // Determine input or if user wishes to exit
  if (input === "exit") {
    mode = "";
    number = -1;
    appendNewlines("Exiting.");
  } else {
    if (mode === "") {
      switch (input) {
        case "higher-or-lower":
          mode = "higher-or-lower";
          break;
        case "rock-paper-scissors":
          mode = "rock-paper-scissors";
          break;
        case "blackjack":
          mode = "blackjack";
          break;
        case "hangman":
          mode = "hangman";
          break;
        case "tic-tac-toe":
          mode = "tic-tac-toe";
          break;
      }
    }

    // Run program based on mode
    switch (mode) {
      // Player Higher or Lower
      case "higher-or-lower":
        if (number == -1) {
          number = Math.floor(Math.random() * 100) + 1;
          secondaryNumber = 0;
          appendNewlines(
            "Playing Higher or Lower. Type \"exit\" to exit.\nGuess a number between 1 and 100."
          );
        } else {
          const value = parseInt(input, 10);
          if (!isNaN(value) && value >= 1 && value <= 100) {
            if (value > number) {
              secondaryNumber += 1;
              appendNewlines("The number is lower.");
            } else if (value < number) {
              secondaryNumber += 1;
              appendNewlines("The number is higher.");
            } else {
              if(secondaryNumber < getStoredScore("hl") || isNaN(getStoredScore("hl"))) {
                storeScore("hl", secondaryNumber);
                appendNewlines(`New High Score!`);
                appendNewlines(`You got the number in ${secondaryNumber} guesses!\nExiting.`);
              } else {
                appendNewlines(`You got the number in ${secondaryNumber} guesses!`);
              }
              number = -1;
              mode = "";
            }
          } else {
            appendNewlines("Please enter a number between 1 and 100.");
          }
        }
        break;

      // Play Rock Paper Scissors
      case "rock-paper-scissors":
        if(isNaN(getStoredScore("rps"))) {
          storeScore("rps", 0);
        }
        if (number == -1) {
          number = Math.floor(Math.random() * 3) + 1;
          appendNewlines(
            "Playing Rock, Paper, Scissors. Type \"exit\" to exit.\nRock (1), Paper (2), or Scissors (3)?"
          );
        } else {
          const value = parseInt(input, 10);
          if (!isNaN(value) && value >= 1 && value <= 3) {
            if (value == 1) {
              if (number == 1) {
                appendNewlines(`Rock vs. Rock\nIt's a tie!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else if (number == 2) {
                storeScore("rps", (getStoredScore("rps") - 1));
                appendNewlines(`Rock vs. Paper\nYou lose!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else {
                storeScore("rps", (getStoredScore("rps") + 1));
                appendNewlines(`Rock vs. Scissors\nYou win!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              }
            } else if (value == 2) {
              if (number == 1) {
                storeScore("rps", (getStoredScore("rps") + 1));
                appendNewlines(`Paper vs. Rock\nYou win!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else if (number == 2) {
                appendNewlines(`Paper vs. Paper\nIt's a tie!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else {
                storeScore("rps", (getStoredScore("rps") - 1));
                appendNewlines(`Paper vs. Scissors\nYou lose!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              }
            } else {
              if (number == 1) {
                storeScore("rps", (getStoredScore("rps") - 1));
                appendNewlines(`Scissors vs. Rock\nYou lose!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else if (number == 2) {
                storeScore("rps", (getStoredScore("rps") + 1));
                appendNewlines(`Scissors vs. Paper\nYou win!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              } else {
                appendNewlines(`Scissors vs. Scissors\nIt's a tie!\nScore: ${getStoredScore("rps")}\nRock (1), Paper (2), or Scissors (3)?`);
              }
            }
            number =  Math.floor(Math.random() * 3) + 1;
          } else {
            appendNewlines("Please enter a number between 1 and 3.");
          }
        }
        break;

      // Play Blackjack
      case "blackjack":
        if (number === -1) {
          if(isNaN(getStoredScore("b"))) {
            storeScore("b", 0);
          }
          number = 0;
          appendNewlines("Playing Blackjack.")
          deck = createDeck();
          shuffleArray(deck);
          hands = dealCards(deck, 2, 2);
          const dealerHand = hands[0];
          const playerHand = hands[1];

          const playerTotal = getHandTotal(playerHand);
          const dealerTotal = getHandTotal(dealerHand);
          if(playerTotal === 21 || dealerTotal === 21) {
            appendNewlines("Dealer hand: " + convertHandToString(dealerHand));
            appendNewlines("Player hand: " + convertHandToString(playerHand));
            if(playerTotal === 21 && dealerTotal !== 21) {
              storeScore("b", getStoredScore("b") + 1)
              appendNewlines(`Blackjack! You win!\nScore: ${getStoredScore("b")}\nPlay Again? (Y/N):`);
            } else if (playerHand !== 21 && dealerTotal === 21) {
              storeScore("b", getStoredScore("b") - 1)
              appendNewlines(`Dealer 21!\nScore: ${getStoredScore("b")}\nPlay Again? (Y/N):`);
            } else if (playerHand === 21 && dealerTotal === 21) {
              appendNewlines(`Dealer/Player Blackjack!\nScore: ${getStoredScore("b")}\nPlay Again? (Y/N):`);
            }
            number = 2;
          } else {
            appendNewlines(`Dealer showing: ${dealerHand[0].rank}`);
            appendNewlines(`Player hand: ${playerHand[0].rank}, ${playerHand[1].rank}`);
            appendNewlines("Hit (H) or Stand (S)?");
          }
        } else if (number === 0) {
          const dealerHand = hands[0];
          const playerHand = hands[1];
          if(input.toLowerCase() === "h") {
            const newCard = deck.pop();
            playerHand.push(newCard);
            const score = getHandTotal(playerHand);
            if(score === 21) {
              appendNewlines(`Dealer showing: ${dealerHand[0].rank}`);
              appendNewlines("Player hand: " + convertHandToString(playerHand));
              appendNewlines("Total 21, standing.");
              runMode("s");
            } else if(score > 21) {
              appendNewlines("Dealer hand: " + convertHandToString(dealerHand));
              appendNewlines("Player hand: " + convertHandToString(playerHand));
              storeScore("b", getStoredScore("b") - 1)
              appendNewlines(`Bust! You lose!\nScore : ${getStoredScore("b")}\nPlay Again? (Y/N)`);
              number = 2;
            } else {
              appendNewlines(`Dealer showing: ${dealerHand[0].rank}`);
              appendNewlines("Player hand: " + convertHandToString(playerHand));
              appendNewlines("Hit (H) or Stand (S)?")
            }
          } else if (input.toLowerCase() === "s") {
            let dealerScore = getHandTotal(dealerHand);
            while(dealerScore < 17) {
              const newCard = deck.pop();
              dealerHand.push(newCard);
              dealerScore = getHandTotal(dealerHand);
            }
            const playerScore = getHandTotal(playerHand);
            appendNewlines("Dealer Hand: " + convertHandToString(dealerHand));
            appendNewlines("Player Hand: " + convertHandToString(playerHand));
            if(dealerScore > 21) {
              storeScore("b", getStoredScore("b") + 1)
              appendNewlines(`Dealer bust! You win!\nScore : ${getStoredScore("b")}\nPlay Again? (Y/N)`);
              number = 2;
            } else if(dealerScore > playerScore) {
              storeScore("b", getStoredScore("b") - 1)
              appendNewlines(`Dealer wins!\nScore : ${getStoredScore("b")}\nPlay Again? (Y/N)`);
              number = 2;
            } else if(dealerScore < playerScore) {
              storeScore("b", getStoredScore("b") + 1)
              appendNewlines(`You win!\nScore : ${getStoredScore("b")}\nPlay Again? (Y/N)`);
              number = 2;
            } else {
              appendNewlines(`It's a tie!\nScore : ${getStoredScore("b")}\nPlay Again? (Y/N)`);
              number = 2;
            }
          } else {
            appendNewlines("Invalid input, Hit (H) or Stand (S)?")
          }
        } else if(number === 2) {
          if(input.toLowerCase() === "y") {
            number = -1;
            runMode("blackjack");
          } else if(input.toLowerCase() === "n") {
            number = -1;
            mode = "";
            appendNewlines("Exiting Blackjack.");
          } else {
            appendNewlines("Invalid input, Play Again? (Y/N)");
          }
        }
        break;
      case "hangman":
        if(isNaN(getStoredScore("hm"))) {
          storeScore("hm", 0);
        }
          if(number === -1) {
            number = 0;
            secondaryNumber = 0;
            sentence = "";
            lettersUsed = [];
            savedSentence = generateHangmanSentence();
            for (let i = 0; i < savedSentence.length; i++) {
              if(savedSentence[i] !== " ") {
                sentence += "_ ";
              } else {
                sentence += " ";
              }
            }
            appendNewlines("Playing Hangman. Type \"exit\" to exit.\n+---+\n |   |\n |    \n |    \n |    \n |    \n-\n" + sentence);
          } else if(number === 0) {
            const letter = input.toLowerCase();
            if(letter.length === 1) {
              if(lettersUsed.includes(letter)) {
                appendNewlines("You've already used this letter. Try again.");
              } else {
                lettersUsed.push(letter);
                if(savedSentence.includes(letter)) {
                  let newSentence = "";
                  for (let i = 0; i < savedSentence.length; i++) {
                    const currentChar = savedSentence[i];
                
                    if (lettersUsed.includes(currentChar.toLowerCase())) {
                      newSentence += currentChar + " ";
                    } else if (currentChar === ' ') {
                      newSentence += ' ';
                    } else {
                      newSentence += '_ ';
                    }
                  }
                  sentence = newSentence;
                  if(sentence.indexOf("_") === -1) {
                    storeScore("hm", getStoredScore("hm") + 1);
                    appendNewlines("You win!\n" + sentence + "\nScore: " + getStoredScore("hm") + "\nPlay again? (Y/N)");
                    number = 2;
                  } else {
                    appendNewlines("Correct!\n" + sentence);
                  }
                } else {
                  secondaryNumber += 1;
                  if(secondaryNumber === 1) {
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + "\n+---+\n |   |\n |   O\n |    \n |    \n |    \n-\n");
                  } else if(secondaryNumber === 2) {
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + "\n+---+\n |   |\n |   O\n |   |\n |    \n |    \n-\n");
                  } else if(secondaryNumber === 3) {
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + "\n+---+\n |   |\n |   O\n |  \\|\n |    \n |    \n-\n");
                  } else if(secondaryNumber === 4) {
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + "\n+---+\n |   |\n |   O\n |  \\|/\n |    \n |    \n-\n");
                  } else if(secondaryNumber === 5) {
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + "\n+---+\n |   |\n |   O\n |  \\|/\n |  /\n |    \n-\n");
                  } else if(secondaryNumber === 6) {
                    storeScore("hm", getStoredScore("hm") - 1);
                    appendNewlines("The sentence does not contain \"" + letter + "\"\n" + sentence + 
                    "\n+---+\n |   |\n |   O\n |  \\|/\n |  / \\\n |    \n-\nYou lose!\nScore: " + getStoredScore("hm") + "\nThe sentence was: " + 
                    savedSentence + "\nPlay again? (Y/N)");
                    number = 2;
                  }
                }
              }
            } else {
              appendNewlines("Please enter a single letter.");
            }
          } else if(number === 2) {
            if(input.toLowerCase() === "y") {
              number = -1;
              runMode("hangman");
            } else if(input.toLowerCase() === "n") {
              number = -1;
              mode = "";
              appendNewlines("Exiting Hangman.");
            } else {
              appendNewlines("Invalid input, Play Again? (Y/N)");
            }
          }
        break;

      case "tic-tac-toe":
        if(number === -1) {
          if(isNaN(getStoredScore("ttt"))) {
            storeScore("ttt", 0);
          }
          ticTacToeState = Array(9).fill('-');
          appendNewlines("Playing Tic-Tac-Toe.\n  | | \n-----\n  | | \n-----\n  | | \nYou are X.\nChoose the index to play (1-9).");
          number = 0;
        } else if(number === 0) {
          const index = parseInt(input) - 1;
          if(!isNaN(index) && index >= 0 && index < 9 && ticTacToeState[index] === "-") {
            ticTacToeState[index] = "X";
            
            let winner = checkWinner(ticTacToeState);
            let isBoardFull = !ticTacToeState.includes('-');
            
            if(isNaN(winner) && !isBoardFull) {
              // AI makes a move using minimax
              const nextActionIndex = findBestMove(ticTacToeState);
              ticTacToeState[nextActionIndex] = "O";
              
              let ticTacToeBoard = formatTicTacToeBoard(ticTacToeState);
              
              winner = checkWinner(ticTacToeState);
              if(isNaN(winner) && ticTacToeState.includes('-')) {
                appendNewlines("You chose index " + (index + 1) + ".\nThe AI chose index " + (nextActionIndex + 1) + "\n" + ticTacToeBoard + "\nChoose the index to play (1-9).");
              } else {
                let resultMessage = "";
                if(!isNaN(winner)) {
                  let icon = winner === 0 ? "X" : "O";
                  storeScore("ttt", getStoredScore("ttt") + (winner === 0 ? 1 : -1));
                  resultMessage = icon + " wins!\nScore: " + getStoredScore("ttt");
                } else {
                  resultMessage = "It's a draw!\nScore: " + getStoredScore("ttt");
                }
                appendNewlines("You chose index " + (index + 1) + ".\nThe AI chose index " + (nextActionIndex + 1) + "\n" + ticTacToeBoard + "\n" + resultMessage + "\nPlay again? (Y/N)");
                number = 1;
              }
            } else {
              let ticTacToeBoard = formatTicTacToeBoard(ticTacToeState);
              let resultMessage = "";
              if(!isNaN(winner)) {
                let icon = winner === 0 ? "X" : "O";
                storeScore("ttt", getStoredScore("ttt") + (winner === 0 ? 1 : -1));
                resultMessage = icon + " wins!\nScore: " + getStoredScore("ttt");
              } else {
                resultMessage = "It's a draw!\nScore: " + getStoredScore("ttt");
              }
              appendNewlines("You chose index " + (index + 1) + ".\n" + ticTacToeBoard + "\n" + resultMessage + "\nPlay again? (Y/N)");
              number = 1;
            }
          } else {
            appendNewlines("Invalid move. Please choose an empty position (1-9).");
          }
        } else if(number === 1) {
          if(input.toLowerCase() === "y") {
            number = -1;
            runMode("tic-tac-toe");
          } else if(input.toLowerCase() === "n") {
            number = -1;
            mode = "";
            appendNewlines("Exiting Tic-Tac-Toe.");
          } else {
            appendNewlines("Invalid input, Play Again? (Y/N)");
          }
        }
      default:
        break;
    }
  }
}

// Format the Tic-Tac-Toe board for display
function formatTicTacToeBoard(board) {
  let formattedBoard = "";
  for (let i = 0; i < board.length; i++) {
    if(i % 3 === 0) {
      if(i !== 0) {
        formattedBoard = formattedBoard.slice(0, -1); // Only remove the trailing pipe at end of row
        formattedBoard += "\n-----\n";
      }
    }
    if(board[i] !== "-") {
      formattedBoard += board[i] + "|";
    } else {
      formattedBoard += " |";
    }
  }
  return formattedBoard.slice(0, -1); // Remove the final trailing pipe
}

function checkWinner(board) {
  const winningCombinations = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== '-' && board[a] === board[b] && board[b] === board[c]) {
      if (board[a] === "X") {
        return 0
      } else {
        return 1
      } // Return the winning player symbol
    }
  }

  return NaN; // No winner yet
}

// Minimax algorithm for Tic-Tac-Toe
function minimax(board, depth, isMaximizing) {
  // Check for terminal states
  const winner = checkWinner(board);
  
  // If X wins (player)
  if (winner === 0) return -10 + depth;
  
  // If O wins (AI)
  if (winner === 1) return 10 - depth;
  
  // If draw
  if (!board.includes('-')) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '-') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '-';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '-') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '-';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Find the best move for the AI
function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = -1;
  
  // Add some randomness for first move to make game more interesting
  const emptySpaces = board.reduce((acc, cell, index) => {
    if (cell === '-') acc.push(index);
    return acc;
  }, []);
  
  // If it's the first move (8 or 9 empty spaces), choose randomly with 80% chance
  if (emptySpaces.length >= 8 && Math.random() < 0.8) {
    return emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
  }
  
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '-') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '-';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function generateHangmanSentence() {
  const subjects = ['The cat', 'A dog', 'My friend', 'The sun', 'A bird', 'A robot', 'The ocean', 'The moon', 'The woman', 'A man', 'The child', 'Superman', 'DevArtech', 'The student'];
  const verbs = ['runs', 'jumps', 'sleeps', 'flies', 'sings', 'dances', 'laughs', 'swims', 'studies', 'writes', 'plays', 'climbs', 'eats'];
  const objects = ['in the garden', 'on the roof', 'under the table', 'over the rainbow', 'through the forest', 'on the beach', 'in the sky', 'between the mountains', 'in the house', 'with the man', 'with the cat', 'with the dog', 'on the tree'];

  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];

  const sentence = subject + " " + verb + " " + object;
  return sentence;
}

function storeScore(index, integerValue) {
  // Check if localStorage is supported by the browser
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(index, integerValue);
  } else {
    console.log("localStorage is not supported in this browser.");
  }
}

function getStoredScore(index) {
  // Check if localStorage is supported by the browser
  if (typeof(Storage) !== "undefined") {
    // Retrieve the stored value, or set a default value if it doesn't exist
    let storedInteger = localStorage.getItem(index) || NaN;
    return parseInt(storedInteger);
  } else {
    console.log("localStorage is not supported in this browser.");
    return NaN;
  }
}

function convertHandToString(hand) {
  let handString = "";
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    handString += card.rank + ", ";
  }
  return handString;
}

function getHandTotal(hand) {
  let total = 0;
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      total += 10;
    } else if (card.rank === "A") {
      if(total + 11 > 21) {
        total += 1;
      } else {
        total += 11;
      }
    } else {
      total += parseInt(card.rank, 10);
    }
  }
  return total;
}

// Logic for Blackjack
// Create the unshuffled deck
function createDeck() {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }

  return deck;
}

// Shuffle the deck
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Deal cards to the players
function dealCards(deck, numPlayers, cardsPerPlayer) {
  const hands = [];

  // Initialize empty hands for each player
  for (let i = 0; i < numPlayers; i++) {
    hands.push([]);
  }

  // Deal cards to players
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      const card = deck.pop();
      hands[j].push(card);
    }
  }

  return hands;
}

// Determine if input is a mathematical expression
function isMathematicalOperator(input) {
  const expression = /^(?:\d|\()/;
  return expression.test(input);
}

// Perform math for a mathematical expression
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

// Enable/Disable effects for easier memory usage.
function switchMobileFriendly() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> mobile-friendly";
  outputElement.classList.add("terminal-input");
  previousInputs.length === 0 ||
  previousInputs[previousInputs.length - 1] !== "mobile-friendly"
    ? previousInputs.push("mobile-friendly")
    : null;
  currentIndex = previousInputs.length;
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

// Clear all terminal messages
function clearPage() {
  previousInputs = [];
  previousInputs.length = 0;
  const outputElements = document.querySelectorAll(".terminal-input");
  outputElements.forEach(function (element) {
    element.remove();
  });
  appendNewlines(init);
}

// Switch to "light mode"
function invertPage() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> invert";
  outputElement.classList.add("terminal-input");
  previousInputs.length === 0 ||
  previousInputs[previousInputs.length - 1] !== "invert"
    ? previousInputs.push("invert")
    : null;
  currentIndex = previousInputs.length;

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

// Call the weather API for the weather
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

// Print weather from the weather API to the page
function weather() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> weather";
  outputElement.classList.add("terminal-input");
  previousInputs.length === 0 ||
  previousInputs[previousInputs.length - 1] !== "weather"
    ? previousInputs.push("weather")
    : null;
  currentIndex = previousInputs.length;

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  getWeather();
}

// Print projects to the page
function getProjects() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> projects";
  outputElement.classList.add("terminal-input");
  previousInputs.length === 0 ||
  previousInputs[previousInputs.length - 1] !== "projects"
    ? previousInputs.push("projects")
    : null;
  currentIndex = previousInputs.length;

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  appendNewlines(projects);
}

// Print contact info to the page
function getContacts() {
  const outputElement = document.createElement("div");
  outputElement.textContent = "> contacts";
  outputElement.classList.add("terminal-input");
  previousInputs.length === 0 ||
  previousInputs[previousInputs.length - 1] !== "contacts"
    ? previousInputs.push("contacts")
    : null;
  currentIndex = previousInputs.length;

  // Append the element to the page
  document.querySelector(".body").appendChild(outputElement);
  window.scrollTo(0, document.body.scrollHeight);
  appendNewlines(contacts);
}

// Append a string to the terminal line-by-line
function appendNewlines(text, color = undefined) {
  document.querySelector(".input-field").disabled = true;
  let resultString = "";

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

    if (color !== undefined) {
      elements.forEach((element) => {
        element.style.color = color;
      });
    }

    outputElement.innerHTML = doc.documentElement.outerHTML;
    outputElement.classList.add("terminal-input");

    if (color !== undefined) {
      outputElement.style.color = color;
    }

    document.querySelector(".body").appendChild(outputElement);
  } else {
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

        if (color !== undefined) {
          outputElement.style.color = color;
        }

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
    if (resultString != "") {
      const outputElement = document.createElement("div");
      // Parse the resultString and add colorMode class
      const parser = new DOMParser();
      const doc = parser.parseFromString(resultString, "text/html");

      const elements = doc.querySelectorAll("*");

      elements.forEach((element) => {
        element.classList.add(colorMode);
      });

      if (color !== undefined) {
        elements.forEach((element) => {
          element.style.color = color;
        });
      }

      outputElement.innerHTML = doc.documentElement.outerHTML;
      outputElement.classList.add("terminal-input");

      if (color !== undefined) {
        outputElement.style.color = color;
      }

      setTimeout(() => {
        document.querySelector(".body").appendChild(outputElement);
        window.scrollTo(0, document.body.scrollHeight);
      }, text.length * 0.25);

      resultString = "";
    }
  }
  setTimeout(() => {
    document.querySelector(".input-field").disabled = false;
    document.querySelector(".input-field").focus();
  }, numChars * 0.25);
}

const currentYear = new Date().getFullYear();

// Premade messages
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

const commands = `
Available Commands (Pages):
 - <a href="javascript:void(0)" onclick="getProjects()">projects, p</a>: List the current projects DevArtech is working on or has worked on.
 - <a href="javascript:void(0)" onclick="getContacts()">contact, co</a>: Contact information for DevArtech.
 - <a href="javascript:void(0)" onclick="weather()">weather, wttr</a>: Get the current weather of your area.
 - <a href="javascript:void(0)" onclick="runMode('higher-or-lower')">higher-or-lower, hl</a>: Play Higher or Lower.
 - <a href="javascript:void(0)" onclick="runMode('rock-paper-scissors')">rock-paper-scissors, rps</a>: Play Rock, Paper, Scissors.
 - <a href="javascript:void(0)" onclick="runMode('blackjack')">blackjack, b</a>: Play Blackjack. (Note: Aces play 11 unless they exceed 21, then they are 1.)
 - <a href="javascript:void(0)" onclick="runMode('hangman')">hangman, hm</a>: Play Hangman.
 - <a href="javascript:void(0)" onclick="runMode('tic-tac-toe')">tic-tac-toe, ttt</a>: Play Tic-Tac-Toe against an AI.
 - <a href="javascript:void(0)" onclick="invertPage()">invert, i</a>: Invert the page's color.
 - <a href="javascript:void(0)" onclick="clearPage()">clear, c</a>: Clear the terminal.
 - <a href="javascript:void(0)" onclick="switchMobileFriendly()">mobile-friendly, mf</a>: Switch effects to mobile-friendly.
 - Math: Input any algebraic expression to be evaluated.
`

const help = `
Welcome to the portfolio page of DevArtech!
 ​
I am Artech, also known as DevArtech or Adam Haile, and I am a current computer science student at MSOE. 
I am a current Data Science Intern at <a href='https://directsupply.com/' target="_blank">Direct Supply</a> and about to start my senior year, 
along with my Masters of Machine Learning and AI. I love working on projects with big data, machine learning, 
LLMs, and more! I have also done work in game development, additive manufacturing, and more! 
Find out more about my work below!
​
<a href='https://drive.google.com/file/d/1mwnEEsgWM7klMTYQ4IlM21YeiIwUHYMd/view?usp=sharing' target="_blank">Resume</a>
Github: <a href='https://github.com/DevArtech' target="_blank">github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech' target="_blank">x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/' target="_blank">instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/' target="_blank">linkedin.com/in/devartech</a>
`;

const projects = `
Current Projects:
 - AI/ML/LLMs: <a href='https://github.com/DevArtech/llmflow-backend' target="_blank">LLMFlow</a>
    - LLMFlow is a service that utilizes the Osire microsystem platform at MSOE to provide a web interface for
      users to build their own LLM applications. The system uses a drag-and-drop node editor interface to allow
      non-technical users to learn the basics and build their own applications quickly and iteratively.
      This application is being developed as apart of my senior design project at MSOE along with 4 other students.
      This prototype version is an open-source tech feasibility study to test the viability of the system.
      The prototype is built with Python, React, NodeJS, LangChain, and more.
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
`;

const contacts = `
Email: <a href='mailto:iamhaile222@gmail.com' target="_blank">iamhaile222@gmail.com</a> or <a href='mailto:hailea@msoe.edu' target="_blank">hailea@msoe.edu</a>
Github: <a href='https://github.com/DevArtech' target="_blank">github.com/DevArtech</a>
Twitter/X: <a href='https://x.com/DevArtech' target="_blank">x.com/DevArtech</a>
Instagram: <a href='https://www.instagram.com/devartech/' target="_blank">instagram.com/devartech</a>
LinkedIn: <a href='https://www.linkedin.com/in/devartech/' target="_blank">linkedin.com/in/devartech</a>
`;

const error = `Unknown command. Type "help" to get started.`;
