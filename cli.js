#!/usr/bin/env node
import minimist from 'minimist';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const query_params = "daily=temperature_2m_max,temperature_2m_min,"+
                            "sunrise,sunset,precipitation_sum,precipitation_hours,"+
                            "windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant"+
                            "&current_weather=true"+
                            "&temperature_unit=fahrenheit"+
                            "&windspeed_unit=mph"+
                            "&precipitation_unit=inch";

function showhelp(){
    console.log(" Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE");
    console.log("\t-h            Show this help message and exit.");
    console.log("\t-n, -s        Latitude: N positive; S negative.");
    console.log("\t-e, -w        Longitude: E positive; W negative.");
    console.log("\t-z            Time zone: uses tz.guess() from moment-timezone by default.");
    console.log("\t-d 0-6        Day to retrieve weather: 0 is today; defaults to 1.");
    console.log("\t-j            Echo pretty JSON from open-meteo API and exit.");
    return 0;
}


async function main(){
    //list of options used for checking invalid options
    const options = ["_", "h", "n", "s", "w", "e", "t", "d", 'j'];
    const argv = minimist(process.argv.slice(2));

    let timezone = moment.tz.guess(); //set timezone by default
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
    }

    //set user specified timezone
    if(argv['t']){
        timezone = argv['t'];
    }
    
    //Get latitude data from command line args
    let latitude = 0;
    if(argv['s']){
        latitude = -1*argv['s']; 
    }        
    if(argv['n']){
        if(latitude){
            console.log("Cannot specify LATITUDE twice");
            return 1;
        }
        latitude = argv['n'];
    }
    if(!argv['s'] && !argv['n']){
        console.log("Latitude must be included");
        return 1
    }
    if(latitude > 90 ||  latitude < -90){
        console.log("Latitude must be in range");
        return 1;
    }

    //get longitude data from command line args
    let longitude = 0;
    if(argv['w']){
        longitude = -1*argv['w']; 
    }        
    if(argv['e']){
        if(longitude){
            console.log("Cannot specify Longitude twice");
            return 1;
        }
        longitude = argv['e'];
    }
    if(!argv['e'] && !argv['w']){
        console.log("Longitude must be included");
        return 1;
    }
    if(longitude > 90 || longitude < -90){
        console.log("Longitude must be in range");
        return 1;
    }
    
    //ensure lat and lon are only difined to 2 decimal places
    latitude = Math.round(latitude*100)/100;
    longitude = Math.round(longitude*100)/100;

   // console.log(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}`+
   //                                                            `&longitude=${longitude}`+
   //                                                            `&${query_params}`+
   //                                                            `&timezone=${timezone}`);

    //query the api
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}`+
                                                               `&longitude=${longitude.toFixed(2)}`+
                                                               `&${query_params}`+
                                                               `&timezone=${timezone}`);

    //parse response json
    const data = await response.json(); 
    
    //output json
    if(argv['j']){
        console.log(data);
        return 0;
    }

    let days = argv['d'];

    //checks if user specified days is out of bounds
    if(days == undefined){
        days = 1;
    }else if(days > 6){
        dump("Must request weather within the week");
    }
    
    //console.log(days);
    //console.log(data.daily.precipitation_sum[days]);
    
    //default output logic
    if(data.daily.precipitation_hours[days] > 0){
        process.stdout.write("You might need galoshes ");
    } else{
        process.stdout.write("You will not need your galoshes ");
    }

    if(days == 0){
        console.log("today.");
    } else if(days > 1){
        console.log(`in &{days} days`);
    } else{
        console.log("tomorrow.");
    }

}

main();
