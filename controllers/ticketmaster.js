const got = require('got');
const moment = require('moment');
const Attraction = require('../models/Attraction');
const Event = require('../models/Event');
const fs = require('fs');
const stream = require('stream');
const {promisify} = require('util');
const pipeline = promisify(stream.pipeline);

// TICKETMASTER_KEY=mp4iGYMNgm6NczKJayY2RJHTNLUoGOIW
// TICKETMASTER_SECRET=UBnvAtAGepMEB85T
const TICKETMASTER_KEY = process.env.TICKETMASTER_KEY;
const TICKETMASTER_SECRET = process.env.TICKETMASTER_SECRET;

exports.searchEvents = async (req, res, next) => {
    let zipCodes = [];
    let startOfTheWeek = moment().startOf('week');
    let endOfTheWeek = moment().endOf('week');
    let dataSize = 1000

    zipCodes.map(async zipCode => {
        let searchURL = `https://app.ticketmaster.com/discovery/v2/events.json`
        let {body} = await got.get(searchURL, {
            searchParams: {
                apiKey: TICKETMASTER_KEY,
                zipCode,
                startDateTime: startOfTheWeek,
                endDateTime: endOfTheWeek,
                size: dataSize
            }
        });
        if (body.data && body.data["_embedded"]){
            let events = body.data["_embedded"]["events"];
            await parseEvents(evets)

        }else {
            console.log(`No data for the search zip code ${zipCode}, timeline: ${startOfTheWeek} - ${endOfTheWeek}`)
        }

    })

}
/**
 * 
 * @param {*} eventsData 
 * 
 * 
 */
async function parseEvents(eventsData) {
    let attractions = eventsData["_embedded"]["attractions"];
    let results = [];

    if(attractions.length != -1) {
     attractions.map(async attraction => {
         let savedPath = await parseAttraction(attraction)
         results.push({
             filepath: savedPath
         })

     })
    }
    
}
async function parseAttraction(attractionData) {
    let {name, images} = attractionData;

    let attraction = await Attraction().findOne({name})
    if(!attraction){ 
        images.map(async image => {
            await imageParser(image)
        })
    }else {
        console.log(`Attraction with name ${name} already exists, will not be inserted`)
    }
}

async function imageParser(opts){
    let { url, width, height} = opts;
    const filename = url.match(/[\w\.\$]+(?=png|jpg|jpeg)\w+/g);
    console.log(`matched filename from url is ${filename}`)
    let saveFilePath = `${process.env.FILE_UPLOAD_PATH}/${filename}`
    await pipeline(
		got.stream(url),
		fs.createWriteStream(filename)
	).then(() => {
        console.log(`finished writing ${filename} to disk`)
    });

    return saveFilePath;
}