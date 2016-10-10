const inquirer = require("inquirer");
const db = require("sqlite");
const weather = require('node-openweather')({
  key: "bdaf14209c7443ae1c46f1bae34a6332",
  accuracy: "like",
  units: "metric",
  language: "en",
  country: "France"
});

db.open("meteo.db");

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
        inquirer.prompt([
  				{
  					type: "list",
  					message: "Séléctionnez le favoris à supprimer\n ",
  					name: "favoris",
            choices: answers
  				}
  			]).then((answer) =>{
  				db.run("DELETE FROM favourite WHERE name = ?", answer.favoris)
  			})
      })
		}
	})
}

function compare(locations){
  var thisLocations = [];
  console.log("API calls : ");
  let i = 0;
  let maxTemp = -273;
  locations.forEach(function(index){
    weather.city(index).now().then((result) => {
      thisLocations[i++] = result;
      if (i == locations.length) {
        for(j=thisLocations.length; j--; ){
          maxTemp = thisLocations[j].main.temp_max > maxTemp ? thisLocations[j].main.temp_max : maxTemp;
          console.log(maxTemp);
        }
        console.log(maxTemp);
      }
    })
  })
}
