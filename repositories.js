const { invoke } = require('./carotte.js');

class PublishRepository {
  static async publishOutbound(event) {
    return invoke('topic/service-storage-inventory-billing.inventory__product.outbounded:v1', {
      productId: event.productId,
      quantity: event.quantity,
      warehouseId: event.warehouseId,
      happenedAt: event.happenedAt,
    });
  }
  static async publishInbound(event) {
    return invoke('topic/service-storage-inventory-billing.inventory__product.inbounded:v1', {
      productId: event.productId,
      quantity: event.quantity,
      inboundOrderId: event.inboundOrderId,
      happenedAt: event.happenedAt,
      skuId: event.skuId,
    });
  }
}

module.exports = { PublishRepository };
