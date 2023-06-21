// const {publishOutbound}=require('./helpers/publishers.js');
const fs = require('fs');
const env = require('./env');
const { parseOutboundEventsData } = require('./helpers/data-process.js');
const { publishOutbound } = require('./helpers/publishers.js');
const { getInput, getInputYesOrNo, logInfo } = require('./helpers/cli-inputs.js');
const chalk = require('chalk');

const publishEvents = async ({ events, allCount, logger }) => {
  let counter = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    counter++;
    const isSucces = await publishOutbound({ event, counter, allCount, logger });
    isSucces ? successCount++ : errorCount++;
  }
  return { successCount, errorCount };
};

const launch = async () => {
  const outboundEventsRawData = fs.readFileSync('data/outboundEvents.csv', {
    encoding: 'utf8',
    flag: 'r',
  });
  const outboundEvents = parseOutboundEventsData(outboundEventsRawData);

  console.clear();

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  const totalCount = outboundEvents.length;

  logInfo(`We have ${totalCount} outbound events to publish`);
  const wantToContinue = await getInputYesOrNo('Do you want to continue?');

  if (wantToContinue) {
    const resultWriter = fs.createWriteStream(
      `data/results/results-outbound-${new Date().toISOString()}.csv`,
      { flags: 'a' },
    );

    while (processedCount < totalCount) {
      const allCount = outboundEvents.length;

      console.log(chalk.bold.red('~~~~~~~~~~~~~~~~~NEW BATCH~~~~~~~~~~~~~~~~~'));

      logInfo(`We have ${allCount} unprocessed events out of ${totalCount}.\n`);

      const howManyToProcess = await getInput(
        `How many events do you want to process out of the ${allCount}? (type 'all' to process all events)`,
      );

      const numberToProcess = howManyToProcess === 'all' ? allCount : Number(howManyToProcess);
      const eventsToProcess = outboundEvents.splice(0, numberToProcess);

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
