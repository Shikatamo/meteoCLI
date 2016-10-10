#!/usr/bin/env node
const db = require("sqlite");
const program = require("commander");
const inquirer = require("inquirer");
const weather = require('node-openweather')({
  key: "bdaf14209c7443ae1c46f1bae34a6332",
  accuracy: "like",
  units: "metric",
  language: "en",
  country: "France"
});

//CLI program parameters
program
  .version("1.0.0")
  .option("-q, --query", "Ask the weather for a location")
  .option("-f, --favourite", "Show favourite locations or save a new one")
  .option("-c, --compare", "Compare the weather between 2 cities");

program.parse(process.argv);

//DB initialisation
db.open("meteo.db").then(() => {
  return db.run("CREATE TABLE IF NOT EXISTS favourite (id PRIMARY KEY, name UNIQUE)");
}).then(() => {
  if (program.query) {
  	inquirer.prompt([
  		{
  			type: "input",
  			message: "Entrez le nom de la ville pour laquelle vous voulez connaître la météo \n",
  			name: "location"
  		},
  		{
  			type: "list",
  			message: "Quelle periode de temps voulez vous afficher \n",
  			name: "date",
  			choices: [
  				"aujourd'hui",
  				"demain",
  				"cette semaine"
  			]
  		}
  	]).then((answers) => {
  		query(answers.location, answers.date);
  	});
  } else if (program.favourite) {
  	favourite();
  } else if (program.compare) {
    inquirer.prompt([
  		{
        type: "list",
  			message: "Voulez vous utiliser vos favoris ou séléctionner deux nouvelles villes? \n",
  			name: "date",
  			choices: [
  				"Favoris",
          "Libre"
  			]
  		}
    ]).then((answer) => {
    		if (answer == "Favoris")
        {
          inquirer.prompt([
        		{
              type: "checkbox",
        			message: "Voulez vous utiliser vos favoris ou séléctionner deux nouvelles villes? \n",
        			name: "date",
        			choices: getFavourites()
            }
          ]).then((answers) => {
              compare(answers);
          })
        } else {
          inquirer.prompt([
        		{
        			type: "input",
        			message: "Entrez le nom de la première ville à comparer\n",
        			name: "location"
        		},
            {
        			type: "input",
        			message: "Entrez le nom de la seconde ville à comparer\n",
        			name: "location"
        		}
          ]).then((answers) => {
              compare(answers);
          })
        }
      })
  }
})

function query(location, date){
  switch (date) {
    case "aujourd'hui":
      console.log("\nAPI call : ")
      weather.city(location).now().then((result) => {
        console.log("\nAujourd'hui il fait " + Math.round(result.main.temp_min) + "°C à " + location);
      }).catch((err) =>{
        console.log("Problem on the API call. Error: ", err);
      })
      break;

    case "demain":
      console.log("\nAPI call : ")
      weather.city(location).forecast(5).then((result) => {
        var avgTemp = 0;
        for(var i = 8; i < 16; i++){
          avgTemp += result.list[i].main.temp_min;
        }
        avgTemp = Math.round(avgTemp/8);
        console.log("\nDemain il fera en moyenne " + avgTemp + "°C à " + location);
      }).catch((err) =>{
        console.log("Problem on the API call. Error: ", err);
      })
      break;

    case "cette semaine":
      console.log("\nAPI call : ")
      weather.city(location).forecast(16).then((result) => {
        var avgTemp = 0;
        for(var i = 0; i < 7; i++){
          avgTemp += result.list[i].temp.min + result.list[i].temp.max;
        }
        avgTemp = Math.round(avgTemp/14);
        console.log("\nCette semaine il fera en moyenne " + avgTemp + "°C à " + location);
      }).catch((err) =>{
        console.log("Problem on the API call. Error: ", err);
      })
      break;
    default:
      console.error("You ! What have you done? You shouldn't be there !")
  }
}

function favourite(){
	inquirer.prompt([
		{
			type: "list",
			message: "Voulez vous ajouter ou supprimer un favoris ?\n",
			name: "choice",
			choices: [
				"ajouter",
        "supprimer"
			]
		}
	]).then((answer) => {
		if(answer.choice == "ajouter"){
      inquirer.prompt([
				{
					type: "input",
					message: "Entrez le nom de la ville pour laquelle vous voulez connaître la météo\n ",
					name: "location"
				}
			]).then((answer) =>{
				db.run("INSERT INTO favourite VALUES(NULL,?)", answer.location)
			});
		} else {
      db.all("SELECT name FROM favourite").then((answers) => {
        console.log(answers);
        inquirer.prompt([
  				{
  					type: "list",
  					message: "Séléctionnez le favoris à supprimer\n ",
  					name: "favoris",
            choices: answers
  				}
  			]).then((answer) =>{
  				db.run("DELETE FROM favourite WHERE name = ?", answer.favoris)
  			});
      })
		}
	});
}

function compare(){

}
