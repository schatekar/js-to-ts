import * as p from "prompt-sync"
import * as calc from "./calculator"
let prompt = p();

function readInput() {
  console.log("Welcome to the calculator. Choose one of the following options");
  console.log("1. add");
  console.log("2. subtract");
  console.log("3. multiply");
  console.log("4. divide");
  console.log("5. exit");

  var option = prompt(">> ");

  if (option !== "5") {
    console.log("Enter the first number");
    let a = parseInt(prompt(">> "));

    console.log("Enter the second number");
    let b = parseInt(prompt(">> "));

    let c;
    switch(option){
      case "1": {
        c = calc.add(a, b);
        console.log(`a + b = ${c}`);
      }
      break;

      case "2": {
        c = calc.subtract(a, b);
        console.log(`a - b = ${c}`);
      }
      break;

      case "3": {
        c = calc.multiply(a, b);
        console.log(`a * b = ${c}`);
      }
      break;

      case "4": {
        c = calc.divide(a, b);
        console.log(`a / b = ${c}`);
      }
      break;
    }    

    readInput();
  }
}

readInput();

console.log("Thank you for using calculator. Good Bye");