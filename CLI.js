#!/usr/bin/env node
const program = require("commander");
const inquirer = require("inquirer");
const weather = require('node-openweather')({
  key: "bdaf14209c7443ae1c46f1bae34a6332",
  accuracy: "like",
  unit: "metric",
  language: "en"
});

program
  .version("1.0.0")
  .option("-q, --query", "Ask the weather for a location")
  .option("-f, --favourite", "Show favourite locations or save a new one")
  .option("-c, --compare", "Compare the weather between 2 cities");

program.parse(process.argv);

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
}

function query(location, date){
  switch (date) {
    case "aujourd'hui":

      weather.city(location).now().then((result) => {
        console.log("Aujourd'hui il fait " + Math.round(result.main.temp_min - 273.15) + "°C à " + location);
      })
      break;

    case "demain":
      weather.city(location).forecast(5).then((result) => {
        var avgTemp = 0;
        for(var i = 8; i < 16; i++){
          avgTemp += result.list[i].main.temp_min;
        }
        avgTemp = Math.round((avgTemp/8) - 273.15);
        console.log("Demain il fera en moyenne " + avgTemp + "°C à " + location);
      })
      break;

    case "cette semaine":
      weather.city(location).forecast(16).then((result) => {
        var avgTemp = 0;
        for(var i = 0; i < 7; i++){
          avgTemp += result.list[i].temp.min + result.list[i].temp.max;
        }
        avgTemp = Math.round((avgTemp/14) - 273.15);
        console.log("Cette semaine il fera en moyenne " + avgTemp + "°C à " + location);
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
			message: "Voulez vous afficher vos favoris ou en ajouter un ?\n",
			name: "choice",
			choices: [
				"afficher",
				"ajouter"
			]
		}
	]).then((answer) => {
		if(answer.choices == "afficher"){
			getFavourites();
		} else {
			inquirer.prompt([
				{
					type: "input",
					message: "Entrez le nom de la ville pour laquelle vous voulez connaître la météo\n ",
					name: "location"
				}
			]).then((answer) =>{
				addFavourite(answer.location);
			});
		}
	});
}

function compare(){

}

function getFavourites(){ return [];}
function addFavourite(){}
