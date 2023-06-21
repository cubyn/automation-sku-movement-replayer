const env = require('../env');
const chalk = require('chalk');
const { PublishRepository } = require('../repositories.js');
const { logInfo } = require('./cli-inputs.js');

const publishInbound = async ({ event, counter, allCount, logger }) => {
  console.log(chalk.red('------------------------------NEW EVENT------------------'));
  logInfo(`Processing event: ${event.eventId}`);
  try {
    await PublishRepository.publishInbound({
      productId: event.productId,
      quantity: Number(event.quantity),
      inboundOrderId: event.inboundOrderId,
      skuId: event.skuId,
      happenedAt: event.happenedAt,
    });
    logger.write(`${event.eventId},success\n`);
    logInfo(
      `Processed:${counter}/${allCount}, eventId:${event.eventId}, status:  ${chalk.bgGreen(
        'SUCCESS',
      )}`,
    );
    return true;
  } catch (e) {
    logger.write(`${event.eventId},error\n`);
    logInfo(
      `Processed:${counter}/${allCount}, eventId:${event.eventId} , status: ${chalk.bgRed(
        'ERROR',
      )}`,
    );
    return false;
  }
};

const publishOutbound = async ({ event, counter, allCount, logger }) => {
  console.log(chalk.red('------------------------------NEW EVENT------------------'));
  logInfo(`Processing event: ${event.eventId}`);
  try {
    await PublishRepository.publishOutbound({
      productId: event.productId,
      quantity: Number(event.quantity),
      warehouseId: event.warehouseId,
      happenedAt: event.happenedAt,
    });
    logger.write(`${event.eventId},success\n`);
    logInfo(
      `Processed:${counter}/${allCount}, eventId:${event.eventId}, status:  ${chalk.bgGreen(
        'SUCCESS',
      )}`,
    );
    return true;
  } catch (e) {
    logger.write(`${event.eventId},error\n`);
    logInfo(
      `Processed:${counter}/${allCount}, eventId:${event.eventId} , status: ${chalk.bgRed(
        'ERROR',
      )}`,
    );
    return false;
  }
};

module.exports = { publishInbound, publishOutbound };
