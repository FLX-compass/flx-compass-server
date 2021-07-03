const got = require('got');
const moment = require('moment');
const Attraction = require('../models/Attraction');
const Event = require('../models/Event');
const fs = require('fs');
const stream = require('stream');
const util = require('util')
const {
    promisify
} = require('util');
const { PAGE_KEY } = require('eventbrite');
const { rejects } = require('assert');
const pipeline = promisify(stream.pipeline);

const TICKETMASTER_KEY = process.env.TICKETMASTER_KEY;

//FILL UP REST ZIP CODES, THIS ONES ARE FOR TESTING PURPOSES
// const ZIP_CODES = [
//     '14410',
//     '14801',
//     '14413',
//     '14805',
//     '13732'
// ]

const ZIP_CODES = [
    '1',
    '2'
]

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * main - _embedded.events[]
 *          name
 *          url,
 *          images[]
 *              url,
 *              width,
 *              height
 *          sales
 *              public
 *                  startDateTime,
 *                  endDateTime
 *          dates
 *              start
 *                  localDate
 *              timezone
 *          classifications
 *              segment
 *                  name
 *              genre
 *                  name
 *          "_embedded"
 *              venues[]
 *                  name
 *                  postalCode
 *                  city
 *                      name
 *                  state
 *                      name
 *                      stateCode
 *                  country
 *                      name
 *                      countryCode
 *                  address
 *                      line1
 *                  location
 *                      longitude
 *                      latitude
 *              attractions[]
 *                  name
 *                  images[]
 * 
 * 
 * 
 * 
 */

//{"_links":{"self":{"href":"=*"}},"page":{"size":200,"totalElements":0,"totalPages":0,"number":0}}

exports.searchEvents = async (req, res, next) => {
    let resData = [];
    moment.updateLocale('en', {
        week: {
            dow: 1,
        },
    })
    let startOfTheWeek = moment().startOf('week').format('YYYY-MM-DDTHH:MM:ss[Z]').toString();
    let endOfTheWeek = moment().endOf('week').format('YYYY-MM-DDTHH:MM:ss[Z]').toString();

    console.log(`${startOfTheWeek} - ${endOfTheWeek}`)
    //max is 200 items per page
    let dataSize = 200
    for (let element in ZIP_CODES) {
        console.log(`parsed zip code ${ZIP_CODES[element]}`);
        
        let searchURL = `https://app.ticketmaster.com/discovery/v2/events?apikey=aEpwS5axaLcuZrHEfULWaG3LXeYhs6Lb&postalCode=${ZIP_CODES[element]}&locale=*&startDateTime=${startOfTheWeek}&endDateTime=${endOfTheWeek}&size=${dataSize}`;
        let {
            body,
            error
        } = await got(searchURL);
        if (error) {
            return res.json({
                error
            })
        }

        body = JSON.parse(body)


        const countData = parsePage(body);
        if(countData.totalElements === 0) {
            console.log(`countdata is ${countData}`)
            resData.push({
                zipCode: ZIP_CODES[element],
                message: `No data for ${ZIP_CODES[element]} for dates ${startOfTheWeek} - ${endOfTheWeek}`
            })
        }else {
            await parseEvent(body);
            // await parseAttraction(body);
        }
    };

    console.log('hitting res')
    res.json(resData)

    
}
/**
 * 
 * @param {*} eventsData 
 * 
 * 
 */
async function parseEvent(eventsData) {
    //events or attractions
    let events = eventsData["_embedded"]["attractions"];
    console.log(eventsData)
    // let resultsImages = [];

    // eventsData.name
    // eventsData.url
    // eventsData.images.map(image => {
    //     let imageData = imageParser(image);
    //     resultsImages.push({
    //         path: imageData
    //     })
    // })

    return {
        name: eventsData.name,
        url: eventsData.url,
        imagePath: resultsImages
    }


    // if (attractions.length != -1) {
    //     attractions.map(async attraction => {
    //         let savedPath = await parseAttraction(attraction)
    //         results.push({
    //             filepath: savedPath
    //         })

    //     })
    // }

}
async function parseAttraction(attractionData) {
    let {
        name,
        images
    } = attractionData;

    let attraction = await Attraction().findOne({
        name
    })
    if (!attraction) {
        images.map(async image => {
            await imageParser(image)
        })
    } else {
        console.log(`Attraction with name ${name} already exists, will not be inserted`)
    }
}

async function imageParser(opts) {
    let {
        url,
        width,
        height
    } = opts;
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

function parsePage(data) {
    let page = data.page;
    const size = page.size;
    const totalElements = page.totalElements;
    return {
        totalElements,
        size
    }
}