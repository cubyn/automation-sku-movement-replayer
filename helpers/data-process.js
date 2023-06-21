const sayHi = () => {console.log("hi");}

const parseEventsData = (data) => {
    rows = data.toString().split('\r\n');

    return rows.map((row) => {
        const rowFields = row.split(';');
    
        const payload = rowFields[6]?.replaceAll('""', '"');
    
            return  {
                id:rowFields[0],
                source:rowFields[1],
                sourceEventId:rowFields[2],
                happenedAt:rowFields[3],
                processedAt:rowFields[4],
                warehouseId:rowFields[5],
                payload:payload? JSON.parse(payload.substring(1,payload.length-1)): null,
                aggregateType:rowFields[7],
            };
    })
}
const parseInboundEventsData = (data) => {
    rows = data.toString().trim().split('\n');
    let headerFields=rows.shift().split(',');

    return rows.map((row,index) => {
        const rowFields = row.split(',');
        let event= {};
        headerFields.forEach((column,index)=>{
            event[column]=rowFields[index];
        })
        return event;
        
        
    })
}
const parseOutboundEventsData = (data) => {
    rows = data.toString().trim().split('\n');
    let headerFields=rows.shift().split(',');

    return rows.map((row) => {
        const rowFields = row.split(',');
        let event= {};
        headerFields.forEach((column,index)=>{
            event[column]=rowFields[index];
        })
        return event;        
    })
}

const parseSkuProductMappingData = (skuMappingData) => {
    return skuMappingData.toString().split('\r\n').reduce((allMappings,mappingRow)=>{
        const mappingFields = mappingRow.split(';');
        allMappings[mappingFields[0]] = mappingFields[1];
        return allMappings;
    },{})
}

const formatInboundedEvents = (skuInboundedEvents,skuMapping) => {
    return skuInboundedEvents.map(event => {
        return {
            type:"SKU_INBOUNDED",
            eventId:event.id,
            skuId:event.payload.data.sku.id,
            quantity: event.payload.data.quantity,
            inboundOrderId: event.payload.data.inboundOrderId,
            productId: skuMapping[event.payload.data.sku.id],
            happenedAt: event.payload.happenedAt,
        }
    }).sort((a,b) => {
        const happenedAtB= new Date(b.happenedAt);
        const happenedAtA= new Date(a.happenedAt);
        return happenedAtA-happenedAtB;
    })
}
const formatOutboundedEvents = (skuInboundedEvents,skuMapping) => {
    return skuInboundedEvents.map(event => {
        return {
            type:"SKU_OUTBOUNDED",
            eventId:event.id,
            skuId:event.payload.data.sku.id,
            quantity: event.payload.data.quantity,
            warehouseId: event.payload.warehouseId,
            productId: skuMapping[event.payload.data.sku.id],
            happenedAt: event.payload.happenedAt,
        }
    }).sort((a,b) => {
        const happenedAtB= new Date(b.happenedAt);
        const happenedAtA= new Date(a.happenedAt);
        return happenedAtA-happenedAtB;
    })
}

module.exports = {
    parseEventsData,
    parseSkuProductMappingData,
    formatInboundedEvents,
    formatOutboundedEvents,
    parseInboundEventsData,
    parseOutboundEventsData
}