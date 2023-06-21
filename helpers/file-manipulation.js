const fs = require('fs');

const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        // The file exists, so you can proceed with deleting it
        try {
            fs.unlinkSync(filePath)
            console.log('File deleted successfully',filePath)
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = { deleteFile };