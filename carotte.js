const { CarotteRuntimeBuilder, defaultMetrics } = require('@devcubyn/carotte-runtime') ;
const  env = require('./env') ;
const { generatePuid } = require('./helpers/generate-puid') ;
const { logger } = require('./logger') ;

const nodeJsVersionMetric = defaultMetrics.nodeJsVersion();
const carotteRuntimeVersionMetric = defaultMetrics.carotteRuntimeVersion();

const runtime = CarotteRuntimeBuilder({ logger });

async function invoke(
  qualifier,
  data,
  {
    userId,
    applicationId,
    user: { roles = [] } = {},
  } = {},
) {
  const options = {
    context: {
      permissions: {},
      transactionId: generatePuid(),
      debugToken: env.CAROTTE_DEBUG_TOKEN,
      application: { role: 'CLIENT', ...(applicationId && { id: applicationId }) },
      ...(userId && { user: { id: userId, roles } }),
    },
  };
  try {
    const result = await (runtime.amqp.invoke(qualifier, options, data));
    if (env.LOG_INVOKE_RESULT) console.log(JSON.stringify(result));

    return result;
  } catch (error) {
    if (env.LOG_INVOKE_RESULT) console.error(error);
    error.message = `${qualifier} [${options.context.transactionId}] failed with: ${
      error.stack ? error.stack : error
    }

Request: ${JSON.stringify(data)}`;
    throw error;
  }
}

const { subscribe } = runtime.amqp;

module.exports = {invoke}
