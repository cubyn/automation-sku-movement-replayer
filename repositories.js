const { invoke } = require('./carotte.js');

const ENDPOINTS = {
  SKU_INBOUNDED: 'topic/service-storage-inventory-billing.inventory__product.inbounded:v1',
  SKU_OUTBOUNDED: 'topic/service-storage-inventory-billing.inventory__product.outbounded:v1',
  SKU_INCREMENTED:
    'topic/service-storage-inventory-billing.inventory__product.quantity-incremented:v1',
  SKU_DECREMENTED:
    'topic/service-storage-inventory-billing.inventory__product.quantity-decremented:v1',
  SKU_MISSING: 'topic/service-storage-inventory-billing.inventory__product.missing:v1',
  SKU_FOUND: 'topic/service-storage-inventory-billing.inventory__product.found:v1',
};

class PublishRepository {
  static async publishEvent(eventType, payload) {
    return invoke(ENDPOINTS[eventType], payload);
  }
}

module.exports = { PublishRepository };
