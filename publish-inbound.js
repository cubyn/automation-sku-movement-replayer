const { publishInbound } = require('./helpers/publishers.js');
const fs = require('fs');
const env = require('./env');
const { parseInboundEventsData } = require('./helpers/data-process.js');
const { getInput, getInputYesOrNo, logInfo } = require('./helpers/cli-inputs.js');
const chalk = require('chalk');
const { error } = require('console');

const publishEvents = async ({ events, allCount, logger }) => {
  let counter = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    counter++;
    const isSucces = await publishInbound({ event, counter, allCount, logger });
    isSucces ? successCount++ : errorCount++;
  }
  return { successCount, errorCount };
};

const launch = async () => {
  const inboundEventsRawData = fs.readFileSync('data/inboundEvents.csv', {
    encoding: 'utf8',
    flag: 'r',
  });
  const inboundEvents = parseInboundEventsData(inboundEventsRawData);

  console.clear();

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  const totalCount = inboundEvents.length;

  logInfo(`We have ${inboundEvents.length} inbound events to publish`);
  const wantToContinue = await getInputYesOrNo('Do you want to continue?');

  if (wantToContinue) {
    const resultWriter = fs.createWriteStream(
      `data/results/results-${new Date().toISOString()}.csv`,
      { flags: 'a' },
    );

    while (processedCount < totalCount) {
      const allCount = inboundEvents.length;

      console.log(chalk.bold.red('~~~~~~~~~~~~~~~~~NEW BATCH~~~~~~~~~~~~~~~~~'));

      logInfo(`We have ${allCount} unprocessed events out of ${totalCount}.\n`);

      const howManyToProcess = await getInput(
        `How many events do you want to process out of the ${allCount}? (type 'all' to process all events)`,
      );

      const numberToProcess = howManyToProcess === 'all' ? allCount : Number(howManyToProcess);
      const eventsToProcess = inboundEvents.splice(0, numberToProcess);

      logInfo(`Publishing ${numberToProcess} events...`);
      const results = await publishEvents({
        events: eventsToProcess,
        allCount,
        logger: resultWriter,
      });
      successCount += results.successCount;
      errorCount += results.errorCount;
      logInfo(`Finished publishing ${numberToProcess} events`);
      processedCount += numberToProcess;
    }

    console.log(chalk.bold.red('~~~~~~~~~~~~~~~~~END OF Process~~~~~~~~~~~~~~~~~'));
    logInfo(`We have processed all ${totalCount} events`);
    console.log(chalk.bold.bgGreen(`Successfully processed: ${successCount}`));
    console.log(chalk.bold.bgRed(`Finished with error: ${errorCount}`));
  } else {
    console.log(chalk.bold.red('~~~~~~~~~~~~~~~~~END OF Process~~~~~~~~~~~~~~~~~'));
    logInfo(`You are exiting`);
  }
};

launch();

// publishEvents(inboundEvents);
