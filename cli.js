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
}

function dump(msg){
    console.log(`ERROR: ${msg}`);
    return 1;
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

    //set user timezone
    if(argv['t']){
        timezone = argv['t'];
    }
    
    //get longitude data from command line args
    let longitude = 0;
    if(argv['w']){
        longitude = -1*argv['w']; 
    }        
    if(argv['e']){
        if(longitude){
            dump("Cannot specify LONGITUDE twice");
        }
        longitude = argv['e'];
    }
    if(!argv['e'] && !argv['w']){
        dump("LONGITUDE must be included");
    }

    //Get latitude data from command line args
    let latitude = 0;
    if(argv['s']){
        latitude = -1*argv['s']; 
    }        
    if(argv['n']){
        if(latitude){
            dump("Cannot specify LATITUDE twice");
        }
        latitude = argv['n'];
    }
    if(!argv['s'] && !argv['n']){
        dump("LATITUDE must be included");
    }

    console.log(longitude);
    console.log(latitude);

//    console.log(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}`+
//                                                               `&longitude=${longitude}`+
//                                                               `&${query_params}`+
//                                                               `&timezone=${timezone}`);

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}`+
                                                               `&longitude=${longitude}`+
                                                               `&${query_params}`+
                                                               `&timezone=${timezone}`);

    const data = await response.json(); 
     
    if(argv['j']){
        console.log(data);
        return 0;
    }

    let days = argv['d'];

    if(days == undefined){
        days = 0;
    } else if(days > 6){
        dump("Must request weather within the week");
    }
    
    console.log(days);
    console.log(data.daily.precipitation_sum[days]);
    if(data.daily.precipitation_sum[days] > 0){
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