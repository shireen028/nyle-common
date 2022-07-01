const fs = require('fs');
const {
    AWS,
} = require('./aws');

class NyleS3 {
    constructor() {
        Object.defineProperties(this, {
            s3Client: {
                value: new AWS.S3({ apiVersion: '2006-03-01' }),
                writable: false,
            },
        });
    }

    getItems(bucketName) {
        return this.s3Client.listObjects({
            Bucket: bucketName,
        }).promise();
    }

    async putItem(objectName, filePath, bucketName) {
        const fileContent = await fs.promises.readFile(filePath);

        // Setting up S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: objectName,
            Body: fileContent,
        };

        await this.s3Client.upload(params).promise();
    }
}

module.exports = {
    NyleS3,
};
