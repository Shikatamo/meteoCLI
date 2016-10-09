#!/usr/bin/env node
const program = require("commander");
const inquirer = require("inquirer");


program
  .version("1.0.0")
  .option("-q, --query", "Ask the weather for a location")
  .option("-f, --favourite", "Show favourite locations or save a new one")
  .option("-c, --compare, --compare [cityA] [cityB]", "Compare the weather between 2 cities");

program.parse(process.argv);

if (program.query) {
	inquirer.prompt([
		{
			type: "input",
			message: "Entrez le nom de la ville pour laquelle vous voulez conaître la météo ",
			name: "location"
		},
		{
			type: "list",
			message: "Quelle periode de temps voulez vous afficher ",
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
	compare();
}

function query(location, date){

}

function favourite(){
	inquirer.prompt([
		{
			type: "list",
			message: "Voulez vous afficher vos favoris ou en ajouter un ?",
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
					message: "Entrez le nom de la ville pour laquelle vous voulez conaître la météo ",
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

function getFavourites(){}
function addFavourite(){}
