#!/usr/bin/env node
const db = require("sqlite");
const program = require("commander");
const inquirer = require("inquirer");
//Import functions
const fct = require("./functions.js");
//Import questions data
const questions = require("./questions.json");


//CLI program parameters
program
  .version("1.0.0")
  .option("-q, --query", "Ask the weather for a location")
  .option("-f, --favourite", "Add or save a new favourite location")
  .option("-c, --compare", "Compare the weather between 2 cities");

program.parse(process.argv);

//DB initialisation
db.open("meteo.db").then(() => {
  return db.run("CREATE TABLE IF NOT EXISTS favourite (id PRIMARY KEY, name UNIQUE)");
}).then(() => {
  if (program.query) {
    inquirer.prompt([
  		questions.methode
    ]).then((answer) => {
      //New city
      if (answer.choice == "nouveau") {
        inquirer.prompt([
      		questions.cityName,
          questions.deltaTime
      	]).then((answers) => {
      		fct.query(answers.location, answers.date);
      	})
        //City from Favourites
      } else if(answer.choice == "favoris"){
          db.all("SELECT name FROM favourite").then((answers) => {
          //Check if favourite list contains enought favourites
          if(answers.length == 0) {
            console.log("Vous n'avez pas de favoris");
            inquirer.prompt([
          		questions.cityName,
              questions.deltaTime
         	  ]).then((answers) => {
          		fct.query(answers.location, answers.date);
          	})
          } else {
            inquirer.prompt([
      				{
      					type: "list",
      					message: "Séléctionnez le favoris à afficher\n ",
      					name: "location",
                choices: answers
      				},
          		questions.deltaTime
      			]).then((answer) =>{
        				fct.query(answer.location, answer.date);
      			})
          }
        })
      }
    })
  } else if (program.favourite) {
  	fct.favourite();
  } else if (program.compare) {
    inquirer.prompt([
  		questions.methode
    ]).then((answer) => {
  		if (answer.choice == "favoris")
      {
        db.all("SELECT name FROM favourite").then((answers) => {
          //Check if favourite list contains enought favourites
          if(answers.length < 2) {
            console.log("Vous n'avez pas assez de favoris");
            inquirer.prompt([
          		questions.cityName,
              questions.cityNameTwo
            ]).then((answers) => {
                fct.compare([answers.location, answers.locationTwo]);
            })
          } else {
            //User selection on city to compare (can be 2 or more)
            inquirer.prompt([
          		{
                type: "checkbox",
          			message: "Choississez les villes à comparer \n",
          			name: "locations",
          			choices: answers
              }
            ]).then((answers) => {
                fct.compare(answers.locations);
            })
          }
        })
      } else {
        inquirer.prompt([
      		questions.cityName,
          questions.cityNameTwo
        ]).then((answers) => {
            fct.compare([answers.location, answers.locationTwo]);
        })
      }
    })
  } else {
    program.help();
  }
})
