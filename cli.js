#!/usr/bin/env node
import minimist from 'minimist';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

function showhelp(){
    console.log(" Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE");
    console.log("\t-h            Show this help message and exit.");
    console.log("\t-n, -s        Latitude: N positive; S negative.");
    console.log("\t-e, -w        Longitude: E positive; W negative.");
    console.log("\t-z            Time zone: uses tz.guess() from moment-timezone by default.");
    console.log("\t-d 0-6        Day to retrieve weather: 0 is today; defaults to 1.");
    console.log("\t-j            Echo pretty JSON from open-meteo API and exit.");
}

function getData(){
}

async function main(){
    const options = ["_", "h", "n", "s", "w", "e", "z", "d", 'j'];
    const argv = minimist(process.argv.slice(2));

    const timezone = moment.tz.guess();
    const verbose = argv['v'];
    const showJSON = argv['j'];

    //check for invalid options
    for(const key in argv){
        if(!options.includes(key)){
            console.log(`Invalid option: ${key}`);
            return 1;
        }
    }

    //show the hellp message if requested and exit
    if(argv['h']){ 
        showhelp();
        return 0;
    }
    
    //get longitude data from command line args
    let longitude = 0;
    if(argv['w']){
        longitude = -1*argv['w']; 
    }        
    else if(argv['e']){
        if(longitude){
            console.log("Cannot specify LONGITUDE twice");
            return 1;
        }
        longitude = argv['e'];
    }
    else{
        console.log("LONGITUDE must be included");
        return 1;
    }

    //Get latitude data from command line args
    let latitude = 0;
    if(argv['s']){
        latitude = -1*argv['w']; 
    }        
    else if(argv['n']){
        if(latitude){
            console.log("Cannot specify LATITUDE twice");
            return 1;
        }
        latitude = argv['n'];
    }
    else{
        console.log("LATITUDE must be included");
        return 1;
    }

    console.log(longitude);
    console.log(latitude);
    const query_params = "daily=temperature_2m_max,temperature_2m_min,"+
                                "sunrise,sunset,precipitation_sum,precipitation_hours,"+
                                "windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant"+
                                "&current_weather=true"+
                                "&temperature_unit=fahrenheit"+
                                "&windspeed_unit=mph"+
                                "&precipitation_unit=inch";

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}`+
                                                               `&longitude=${longitude}`+
                                                               `&${query_params}`+
                                                               `&timezone=${timezone}`);

    console.log(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}`+
                                                               `&longitude=${longitude}`+
                                                               `&${query_params}`+
                                                               `&timezone=${timezone}`);

    const data = await response.json(); 

    console.log(data);
}

main();
