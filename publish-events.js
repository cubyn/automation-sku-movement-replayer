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
const { sumResults } = require('./helpers/sum-results.js');
const { publishEvents } = require('./helpers/publishers.js');

const launch = async () => {
  // We load in the events from the file we generated running the parse-data.js script
  const eventsRawData = fs.readFileSync('data/relevantEvents.csv', {
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
      `data/results/results-events-${new Date().toISOString()}.csv`,
      { flags: 'a' },
    );

    while (processedCount < totalCount) {
      const allCount = events.length;

      logDivider('NEW BATCH', '~');
      logInfo(`We have ${allCount} unprocessed events out of ${totalCount}.\n`);

      const howManyToProcess = await getInput(
        `How many events do you want to process out of the ${allCount}? (type 'all' to process all events)`,
      );
      // Lazy
      if (howManyToProcess !== 'all' && isNaN(Number(howManyToProcess))) {
        break;
      }

      const numberToProcess = howManyToProcess === 'all' ? allCount : Number(howManyToProcess);
      const eventsToProcess = events.splice(0, numberToProcess);

      logInfo(`Publishing ${numberToProcess} events...`);
      const results = await publishEvents({
        events: eventsToProcess,
        totalCount,
        numberToProcess,
        logger: resultWriter,
      });
      successCount += results.successCount;
      errorCount += results.errorCount;
      processedCount += numberToProcess;

      globalResults = sumResults(globalResults, results.detailedResults);
      logInfo(`Finished publishing ${numberToProcess} events`);
    }

    logDivider('END of PRocess', '~');
    logInfo(`We have processed ${processedCount} out of ${totalCount} events`);
    logBgGreen(`Successfully processed: ${successCount}`);
    logBgRed(`Finished with error: ${errorCount}`);
    Object.keys(globalResults).forEach((key) => {
      logInfo(`${key}: ${globalResults[key]}`);
    });
  }
  logDivider('END of PRocess', '~');
  logInfo(`You are exiting`);
};

launch();
