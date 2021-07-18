const got = require('got');
const moment = require('moment');
const Attraction = require('../models/Attraction');
const Event = require('../models/Event');
const fs = require('fs');
const stream = require('stream');
const util = require('util');
const path = require('path')
const {
    promisify
} = require('util');
const {
    PAGE_KEY
} = require('eventbrite');
const {
    rejects
} = require('assert');
const pipeline = promisify(stream.pipeline);

const TICKETMASTER_KEY = process.env.TICKETMASTER_KEY;
const ZIPCODE_FILE = path.resolve(__dirname, '../_data/zipcodes.json')
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 */


exports.searchEvents = async (req, res, next) => {

    const rawData = fs.readFileSync(ZIPCODE_FILE);
    const zipCodeData = JSON.parse(rawData);
    const ZIP_CODES = zipCodeData.zipCodes;
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
    let resData = [];
    for (let element in ZIP_CODES) {
        console.log(`parsed zip code ${ZIP_CODES[element]}`);

        // let searchURL = `https://app.ticketmaster.com/discovery/v2/events?apikey=aEpwS5axaLcuZrHEfULWaG3LXeYhs6Lb&postalCode=${ZIP_CODES[element]}&locale=*&startDateTime=${startOfTheWeek}&endDateTime=${endOfTheWeek}&size=${dataSize}`;
        let searchURL = `https://app.ticketmaster.com/discovery/v2/events?apikey=aEpwS5axaLcuZrHEfULWaG3LXeYhs6Lb&postalCode=${ZIP_CODES[element]}&locale=*`;
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
        if (countData.totalElements === 0) {
            
            console.log(`countdata is ${countData}`)
            resData.push({
                zipCode: ZIP_CODES[element],
                message: `No data for ${ZIP_CODES[element]} for dates ${startOfTheWeek} - ${endOfTheWeek}`
            })
        } else {
            try {
                await parseEvent(body["_embedded"]["events"]);
                res.json({success: true})
            }catch(error){
                res.json({success: false, error})
            }
            
        }
    };
    return res.json(resData)


}
/**
 * 
 * @param {*} eventsData 
 * 
 * 
 */
async function parseEvent(eventsData) {
    await eventsData.map(async data => {
        let event = new Event({
            title: data.name,
            url: data.url,
            source: "Ticketmaster",
            startTime: data.dates.start.dateTime,
            priceLow: (data.priceRanges ? data.priceRanges[0].min : 0),
            priceHigh: (data.priceRanges ? data.priceRanges[0].max : 0),
            category: data.classifications[0].segment.name || "unknown"
        })

        if (data.images) {
            await Promise.all(data.images.map(async image => {
                let savedImage = await imageParser({
                    url: image.url,
                    height: image.height,
                    width: image.width
                });
                if (!event.image) {
                    event.image = []
                }
                if (savedImage != null) {
                    event.image.push(savedImage)
                }
            })).catch(err => {
                console.log(err)
            })
        }

        try {
            await event.save();
        } catch (err) {
            console.log(`error on event save occured\n${err}`)
        }

        Promise.all(data["_embedded"]["venues"].map(async venue => {
            await parseAttraction(venue, event.id);
        })).catch(err => {
            console.log(`error on parse attraction occured:\$${err}`)
        })
    })


}
async function parseAttraction(data, eventID) {

    let attraction

    try {
        attraction = await Attraction.findOne({
            ticketMasterID: data.id
        }).exec();
    } catch (err) {
        console.log(`error on finding attraction with ticketmaster id: ${data.id}, reason:\n${err}`)
    }

    if (!attraction) {
        attraction = new Attraction({
            name: (data.name ? data.name : 'No Name'),
            ticketMasterID: data.id,
            description: "/",
            website: data.url,
            address: (data.address ? data.address.line1 : ''),
            location: {
                coordinates: [data.location.longitude, data.location.latitude],
                street: (data.address ? data.address.line1 : ''),
                city: (data.city ? data.city.name : ''),
                state: (data.state ? data.state.name : ''),
                zipcode: data.postalCode,
                country: (data.country ? data.country.name : '')
            }
        })

        if (Array.isArray(data.images) && data.images !== undefined) {
            Promise.all(data.images.map(async imageData => {
                let savedPath = await imageParser({
                    url: imageData.url,
                    width: imageData.width,
                    height: imageData.height
                })

                if(savedPath){
                    
                    attraction.photos.push({
                        savedPath
                    })
                }
            }))

        }else {
            console.log(`data image is not array its ${typeof(data.images)}, ${data.images}`)
        }

        try {
            await attraction.save();
        } catch (err) {
            console.log(`error on save attraction:\n${err}`)
        }
    }

    try {
        let event = await Event.findById(eventID).exec()
        if (event) {
            event.attraction.push(attraction.id);
            await event.save();
        }
    } catch (err) {
        console.log(`error on finding or saving event, reason:\n${err}`)
    }
}

async function imageParser(opts) {
    let {
        url,
        width,
        height
    } = opts;
    const filename = url.match(/[\w\.\$]+(?=png|jpg|jpeg)\w+/g);
    let saveFilePath = path.resolve(`${process.env.FILE_UPLOAD_PATH}/${filename[0]}`);
    try {
        let response = await got.get(url);
        if (response.statusCode !== 200) {
            return null
        }
        fs.writeFileSync(saveFilePath, response.body)
        return filename[0];
    }catch(error) {
        console.log(`error on request \n${error}`)
    }
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