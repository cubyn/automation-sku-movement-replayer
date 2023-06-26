const INBOUNDED_SKELETEON = {
  type: '',
  eventId: '',
  skuId: '',
  quantity: '',
  inboundOrderId: '',
  productId: '',
  happenedAt: '',
};
const GENERAL_SKELETEON = {
  type: '',
  eventId: '',
  skuId: '',
  quantity: '',
  warehouseId: '',
  productId: '',
  happenedAt: '',
};

const parseEventsData = (data) => {
  rows = data.toString().split('\r\n');

  return rows.map((row) => {
    const rowFields = row.split(';');

    const payload = rowFields[6]?.replaceAll('""', '"');

    return {
      id: rowFields[0].replaceAll('"', ''),
      source: rowFields[1],
      sourceEventId: rowFields[2],
      happenedAt: rowFields[3],
      processedAt: rowFields[4],
      warehouseId: rowFields[5],
      payload: payload ? JSON.parse(payload.substring(1, payload.length - 1)) : null,
      aggregateType: rowFields[7],
    };
  });
};

const parseRelevantEvents = (data) => {
  rows = data.toString().trim().split('\n');
  let eventKeysInbound = Object.keys(INBOUNDED_SKELETEON);
  let eventKeysGeneral = Object.keys(GENERAL_SKELETEON);

  return rows.map((row) => {
    const rowFields = row.split(',');
    let event = {};
    const headerFields = rowFields[0] === 'SKU_INBOUNDED' ? eventKeysInbound : eventKeysGeneral;
    headerFields.forEach((column, index) => {
      event[column] = rowFields[index];
    });
    return event;
  });
};

const parseSkuProductMappingData = (skuMappingData) => {
  return skuMappingData
    .toString()
    .split('\r\n')
    .reduce((allMappings, mappingRow) => {
      const mappingFields = mappingRow.split(';');
      allMappings[mappingFields[0]] = mappingFields[1];
      return allMappings;
    }, {});
};

const formatEvents = (events, skuMapping) => {
  const results = {
    SKU_INBOUNDED: 0,
    SKU_OUTBOUNDED: 0,
    SKU_INCREMENTED: 0,
    SKU_DECREMENTED: 0,
    SKU_MISSING: 0,
    SKU_FOUND: 0,
  };
  const formattedEvents = events
    .map((event) => {
      results[event.payload.type]++;
      if (event.payload.type === 'SKU_INBOUNDED') {
        return {
          type: event.payload.type,
          eventId: event.id,
          skuId: event.payload.data.sku.id,
          quantity: event.payload.data.quantity,
          inboundOrderId: event.payload.data.inboundOrderId,
          productId: skuMapping[event.payload.data.sku.id],
          happenedAt: event.payload.happenedAt,
        };
      }
      return {
        type: event.payload.type,
        eventId: event.id,
        skuId: event.payload.data.sku.id,
        quantity: event.payload.data.quantity,
        warehouseId: event.payload.warehouseId,
        productId: skuMapping[event.payload.data.sku.id],
        happenedAt: event.payload.happenedAt,
      };
    })
    .sort((a, b) => {
      const happenedAtB = new Date(b.happenedAt);
      const happenedAtA = new Date(a.happenedAt);
      return happenedAtA - happenedAtB;
    });

  return {
    events: formattedEvents,
    results,
  };
};

module.exports = {
  parseRelevantEvents,
  parseEventsData,
  parseSkuProductMappingData,
  formatEvents,
};
