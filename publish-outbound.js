// const {publishOutbound}=require('./helpers/publishers.js');
const fs = require('fs');
const  env = require('./env') ;
const {parseOutboundEventsData} = require('./helpers/data-process.js')

const outboundEventsRawData = fs.readFileSync('data/outboundEvents.csv', {encoding:'utf8', flag:'r'});
// console.log(inboundEventsRawData);
const outboundEvents = parseOutboundEventsData(outboundEventsRawData);
console.log(outboundEvents);


const publishEvents = async (events)=>{
    let counter=0
    const allCount=events.length;
    let publishPromises = [];
    events.forEach(event => {
        counter++
        publishPromises.push(publishOutbound(event,counter,allCount));
    })

    const res = await publishPromises.reduce(async (memo, currPromise) => {
        await memo;
        return [...await memo,currPromise];
    }, []);
}

// publishEvents(inboundEvents);

