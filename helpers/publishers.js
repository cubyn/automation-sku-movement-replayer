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
    await PublishRepository.publishEvent(event.type, payload);
    return { id: event.eventId, type: event.type, isSuccess: true };
  } catch (e) {
    return { id: event.eventId, type: event.type, isSuccess: false, errorType: e.type };
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
    if (isSuccess) {
      successCount++;
      results[`${event.type}_SUCCESS`]++;
    } else {
      errorCount++;
      results[`${event.type}_ERROR`]++;
    }

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
const publishInboundEvents = async ({ eventsInBatches, totalCount, logger, numberInABatch }) => {
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

  // here events are in batches. We want to launch concurrently each batches

  for (let i = 0; i < eventsInBatches.length; i++) {
    logDivider('NEW BATCH', '-');
    logInfo(
      `Processing ${i * numberInABatch + 1}-${(i + 1) * numberInABatch}/${totalCount} events`,
    );
    const eventsToPublishInBatch = eventsInBatches[i];
    const publishes = eventsToPublishInBatch.map((event) => publishOneEvent(event));

    const results = await Promise.all(publishes);

    for (const result of results) {
      const { id, isSuccess, errorType, type } = result;
      if (isSuccess) {
        successCount++;
        results[`${type}_SUCCESS`]++;
      } else {
        errorCount++;
        results[`${type}_ERROR`]++;
      }
      const status = isSuccess ? chalk.bgGreen('SUCCESS') : chalk.bgRed('ERROR');
      logger.write(
        `${id},${type},${isSuccess ? 'success' : 'error'},${
          isSuccess ? '' : `error: ${errorType}`
        }\n`,
      );
    }

    logInfo(
      `Processed: ${i * numberInABatch + 1}-${(i + 1) * numberInABatch}/${totalCount} events`,
    );
  }

  return { successCount, errorCount, detailedResults: results };
};

module.exports = { publishEvents, publishInboundEvents };
