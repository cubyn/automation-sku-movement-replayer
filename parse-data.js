const fs = require('fs');
const {
  parseEventsData,
  parseSkuProductMappingData,
  formatInboundedEvents,
  formatOutboundedEvents,
} = require('./helpers/data-process.js');
const { deleteFile } = require('./helpers/file-manipulation.js');

const eventsData = fs.readFileSync('data/TEST.csv', { encoding: 'utf8', flag: 'r' });

const events = parseEventsData(eventsData);
const WMSevents = events.filter((event) => event.source === 'WMS');
const skuInboundedEvents = WMSevents.filter((event) => event.payload.type === 'SKU_INBOUNDED');
const skuOutboundedEvents = WMSevents.filter((event) => event.payload.type === 'SKU_OUTBOUNDED');

const skuMappingData = fs.readFileSync('data/sku-mapping2.csv', { encoding: 'utf8', flag: 'r' });
const skuMapping = parseSkuProductMappingData(skuMappingData);

const SkuInboundedEventsFormatted = formatInboundedEvents(skuInboundedEvents, skuMapping);
const SkuOutboundedEventsFormatted = formatOutboundedEvents(skuOutboundedEvents, skuMapping);

deleteFile('data/inboundEvents.csv');
deleteFile('data/outboundEvents.csv');

const inboundWriter = fs.createWriteStream('data/inboundEvents.csv', { flags: 'a' });
const outboundWriter = fs.createWriteStream('data/outboundEvents.csv', { flags: 'a' });

// headers
inboundWriter.write('eventId,skuId,quantity,inboundOrderId,productId,happenedAt\n');
outboundWriter.write('eventId,skuId,quantity,warehouseId,productId,happenedAt\n');

SkuInboundedEventsFormatted.forEach((event) => {
  inboundWriter.write(
    `${event.eventId},${event.skuId},${event.quantity},${event.inboundOrderId},${event.productId},${event.happenedAt}\n`,
  );
});

console.log(`Inbound events written to file: ${SkuInboundedEventsFormatted.length} events`);

SkuOutboundedEventsFormatted.forEach((event) => {
  outboundWriter.write(
    `${event.eventId},${event.skuId},${event.quantity},${event.warehouseId},${event.productId},${event.happenedAt}\n`,
  );
});

console.log(`Outbound events written to file: ${SkuOutboundedEventsFormatted.length} events`);
