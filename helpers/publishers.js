const env = require('../env');
const chalk = require('chalk');
const { PublishRepository } = require('../repositories.js');
const { logInfo, logDivider } = require('./cli-inputs.js');

const formatPayload = (event) => {
  if (event.type === 'SKU_INBOUNDED') {
    return {
      productId: event.productId,
      quantity: Number(event.quantity),
      inboundOrderId: event.inboundOrderId,
      happenedAt: event.happenedAt,
      skuId: event.skuId,
    };
  }

  return {
    productId: event.productId,
    quantity: Number(event.quantity),
    warehouseId: Number(event.warehouseId),
    skuId: event.skuId,
    happenedAt: event.happenedAt,
  };
};

const publishOneEvent = async (event) => {
  const payload = formatPayload(event);

  try {
    await await PublishRepository.publishEvent(event.type, payload);
    return { isSuccess: true };
  } catch (e) {
    return { isSuccess: false, errorType: e.type };
  }
};

const publishEvents = async ({ events, totalCount, logger, numberToProcess }) => {
  let counter = 0;
  let successCount = 0;
  let errorCount = 0;
  const results = {
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

  for (const event of events) {
    counter++;

    logDivider('NEW EVENT', '-');
    logInfo(`Processing event: ${event.eventId}`);

    const { isSuccess, errorType } = await publishOneEvent(event);

    isSuccess
      ? successCount++ && results[`${event.type}_SUCCESS`]++
      : errorCount++ && results[`${event.type}_ERROR`]++;

    const status = isSuccess ? chalk.bgGreen('SUCCESS') : chalk.bgRed('ERROR');
    logger.write(
      `${event.eventId},${event.type},${isSuccess ? 'success' : 'error'},${
        isSuccess ? '' : `error: ${errorType}`
      }\n`,
    );
    logInfo(
      `Processed:${counter}/${numberToProcess} in this batch (total is ${totalCount}), eventId:${event.eventId}, status:  ${status}`,
    );
  }
  return { successCount, errorCount, detailedResults: results };
};

module.exports = { publishEvents };
