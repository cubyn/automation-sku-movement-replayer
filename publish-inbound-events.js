const fs = require('fs');
const env = require('./env');
const { parseRelevantEvents } = require('./helpers/data-process.js');
const {
  getInput,
  getInputYesOrNo,
  logInfo,
  logDivider,
  logBgRed,
  logBgGreen,
} = require('./helpers/cli-inputs.js');
const { publishInboundEvents } = require('./helpers/publishers.js');
const { chunk } = require('lodash');

const launch = async () => {
  // We load in the events from the file we generated running the parse-data.js script
  const eventsRawData = fs.readFileSync('data/relevantInboundEvents.csv', {
    encoding: 'utf8',
    flag: 'r',
  });
  // We parse the events into Objects
  const events = parseRelevantEvents(eventsRawData);

  console.clear();

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let globalResults = {
    SKU_INBOUNDED_SUCCESS: 0,
    SKU_INBOUNDED_ERROR: 0,
    SKU_OUTBOUNDED_SUCCESS: 0,
    SKU_OUTBOUNDED_ERROR: 0,
    SKU_INCREMENTED_SUCCESS: 0,
    SKU_INCREMENTED_ERROR: 0,
    SKU_DECREMENTED_SUCCESS: 0,
    SKU_DECREMENTED_ERROR: 0,
    SKU_MISSING_SUCCESS: 0,
    SKU_MISSING_ERROR: 0,
    SKU_FOUND_SUCCESS: 0,
    SKU_FOUND_ERROR: 0,
  };
  const totalCount = events.length;

  logInfo(`We have ${totalCount} events to publish`);
  const wantToContinue = await getInputYesOrNo('Do you want to continue?');

  if (wantToContinue) {
    // WE want to save the results of the publishes into a file. (events, status(success/error), error message)
    const resultWriter = fs.createWriteStream(
      `data/results/results-inbound-events-${new Date().toISOString()}.csv`,
      { flags: 'a' },
    );

    const allCount = events.length;

    console.log(allCount);

    logDivider('NEW BATCH', '~');
    logInfo(`We have ${allCount} unprocessed events out of ${totalCount}.\n`);

    const howManyToProcessAtOnce = await getInput(
      `How many events do you want to process in one batch?`,
    );
    const numberInABatch =
      howManyToProcessAtOnce === 'all' ? allCount : Number(howManyToProcessAtOnce);

    const eventsInBatches = chunk(events, numberInABatch || 20);

    logInfo(`Publishing events...`);
    const results = await publishInboundEvents({
      eventsInBatches,
      totalCount,
      numberInABatch,
      logger: resultWriter,
    });

    logInfo(`Finished publishing the events`);
    logDivider('END of PRocess', '~');
    logInfo(`We have processed ${totalCount} events`);
    logBgGreen(`Successfully processed: ${results.successCount}`);
    logBgRed(`Finished with error: ${results.errorCount}`);
    Object.keys(results.detailedResults).forEach((key) => {
      logInfo(`${key}: ${results.detailedResults[key]}`);
    });
  }
  logDivider('END of PRocess', '~');
  logInfo(`You are exiting`);
};

launch();
