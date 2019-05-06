const faker = require('faker')
const fs = require('fs');

const moment = require('moment');

var stringify = require('csv-stringify');

const turf = require('turf');
const booleanPointinPolygon = require('@turf/boolean-point-in-polygon');
const { randomPoint } = require('@turf/random')

const { Parser } = require('json2csv')
const oceansGeoJSON = require('./oceans.json');

const tracks = [];


// const minutes = process.env.MINUTES;
const minutes = 1
const the_interval = minutes * 60 * 1000;
// const batchSize = process.env.BATCH_SIZE;
const batchSize = 20;
// Run first batch
buildCSV();
// Run in an interval 
setInterval(buildCSV, the_interval)

function buildCSV(){
    for (let i = 1; i <= batchSize; i++) {
        tracks.push({
            geometry: getOceanTrack(),
            name: faker.company.companyName(),
            timeOfIntercept: faker.date.past(),
            captureTime: moment().format('LT'),
            vesselType: getAIS(),
            id: faker.random.uuid()
        })
    }

    stringify(tracks, { header: true, columns: ['geometry', 'name', 'timeOfIntercept', 'vesselType'] }, function (err, output) {
        fs.writeFile('tracks.csv', output, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else {

                fs.writeFileSync('tracks.json', JSON.stringify({tracks}, null, '\t'));
                console.log('It\'s saved!');
            }
        });
    });
}



function getOceanTrack() {
    // Usage Example.

    // Generates 100 points that is in a 1km radius from the given lat and lng point.
    const points = randomPoint(10000, { bbox: [-180, -90, 180, 90] })

    const multiPoly = turf.multiPolygon(oceansGeoJSON.features[0].geometry.coordinates);
    const oceanPoint = points.features.find(point => booleanPointinPolygon.default(point, multiPoly))
    console.log('dingo oceanpoint', oceanPoint);
    return oceanPoint.geometry.coordinates;

}

function getAIS() {
    const tags = [10, 30, 55, 60, 80]
    return tags[Math.floor(Math.random() * tags.length - 1)]
}