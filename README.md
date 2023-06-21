# automation-sku-movement-replayer
Tool to replay SKU_INBOUNDED and SKU_INBOUNDED events in order to pouplate the billing inventory with automation items

There is a TEST.csv you can use to test the tool.
- First run `parse-data.js` --> this will parses the test.csv, map the events to the correct product and saves the events in the data folder
- Then you can run `publish-inbound.js` to test the script. The results are saved in the result folder
