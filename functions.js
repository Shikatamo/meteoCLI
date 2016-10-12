const fs = require("fs");
const db = require("sqlite");
const inquirer = require("inquirer");
const questions = require("./questions.json");
//Params of OpenWeatherMap API calls
const weather = require('node-openweather')({
  key: "bdaf14209c7443ae1c46f1bae34a6332",
  accuracy: "like",
  units: "metric",
  language: "en",
  country: "France"
});

db.open("meteo.db");

//Export of functions in order to use them in CLI program
module.exports = {
  query: function(location, date){
    query(location, date);
  },
  favourite: function(){
    favourite();
  },
  compare: function(locations){
    compare(locations);
  }
}

//Get weatherr for a location on a time delta given in parameters
function query(location, date){
  switch (date) {
    case "aujourd'hui":
      console.log("\nAPI call : ")
      weather.city(location).now().then((result) => {
        console.log("\nAujourd'hui il fait " + Math.round(result.main.temp_min) + "°C à " + location);
        writeLog("Call to API for " + result.name + " weather today.\n")
        }).catch((err) =>{
        console.log("Problem on the API call. Error: ", err);
      })
      break;

    case "demain":
      console.log("\nAPI call : ")
      weather.city(location).forecast(5).then((result) => {
        var avgTemp = 0;
        //API returns 8 values for a day (one every 3 hours)
        for(var i = 8; i < 16; i++){
          avgTemp += result.list[i].main.temp_min;
        }
        //Doing an average of all the values for the day
        avgTemp = Math.round(avgTemp/8);
        console.log("\nDemain il fera en moyenne " + avgTemp + "°C à " + location);
        writeLog("Call to API for " + result.list[0].name + " weather tomorrow.\n")
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
        //Doing an average on min and max temp for each day of the week
        avgTemp = Math.round(avgTemp/14);
        console.log("\nCette semaine il fera en moyenne " + avgTemp + "°C à " + location);
        writeLog("Call to API for " + result.list[0].name + " weather this week.\n")
      }).catch((err) =>{
        console.log("Problem on the API call. Error: ", err);
      })
      break;
    default:
      console.error("You ! What have you done? You shouldn't be there !")
  }
}

//Add or remove favourites from DB
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
				questions.cityName
			]).then((answer) =>{
				db.run("INSERT INTO favourite VALUES(NULL,?)", answer.location)
        writeLog("Add " + answer.location + " to favourites.\n");
      });
		} else {
      db.all("SELECT name FROM favourite").then((answers) => {
        //Display favourite list
        inquirer.prompt([
  				{
  					type: "list",
  					message: "Séléctionnez le favoris à supprimer\n ",
  					name: "favoris",
            choices: answers
  				}
  			]).then((answer) =>{
  				db.run("DELETE FROM favourite WHERE name = ?", answer.favoris)
          writeLog("Delete " + answer.favoris + " from favourites.\n")
        })
      })
		}
	})
}

//Compare weather for multiple locations
function compare(locations){
  var thisLocations = [];
  console.log("API calls : ");
  let i = 0;
  let maxTemp = -273;
  let citiesNames = "";
  locations.forEach(function(index){
    weather.city(index).now().then((result) => {
      thisLocations[i++] = result;
      citiesNames += index + ", ";
      if (i == locations.length) {
        for(j=thisLocations.length; j--; ){
          maxTemp = thisLocations[j].main.temp_max > maxTemp ? thisLocations[j].main.temp_max : maxTemp;
        }
        console.log(maxTemp);
        writeLog("Call to API for " + citiesNames.slice(0, -2) + " for weather comparaison.\n")
      }
    })
  })
}

//Write logs for each actions
function writeLog(logData){
  var now = new Date(Date.now());
  fs.appendFile("logs.txt", now + " : " + logData);
}
