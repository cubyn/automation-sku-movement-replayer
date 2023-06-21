require('dotenv').config();
const TrustEnv = require('trust-env').default;

module.exports = TrustEnv([
    { key: 'CAROTTE_AMQP_HOST', type: 'string', required: false, preset: 'rabbitmq:5672' },
  { key: 'CAROTTE_AMQP_PREFETCH', type: 'integer' },
  { key: 'CAROTTE_GRACEFUL_SHUTDOWN_TIMEOUT', type: 'integer' },
  { key: 'CAROTTE_TEARDOWN_AMQP_CLOSE_TIMEOUT', type: 'integer' },
  { key: 'LOG_INVOKE_RESULT', type: 'boolean', required: false, preset: 'true' },

  { key: 'DEFAULT_WAREHOUSE_ID', type: 'integer', required: false, preset: '3628042' },
  { key: 'DEFAULT_OPERATOR_ID', type: 'integer' },
  { key: 'DEFAULT_ADMIN_ID', type: 'integer' },
  { key: 'DEFAULT_CUSTOMER_RESOLUTION_OPERATOR_ID', type: 'integer' },
  { key: 'DEFAULT_SCUB_ID', type: 'string' },
  { key: 'DEFAULT_SHIPPER_ID', type: 'integer' },
  { key: 'DEFAULT_APPLICATION_ID', type: 'integer', required: false, preset: '852114779' },
  { key: 'TRANSFERRED_TO_SCUB_ID', type: 'string' },
  { key: 'CAROTTE_DEBUG_TOKEN', type: 'string', required: false, preset: 'zsolth' },
    /* Your other keys */
]);