import AWS = require("aws-sdk");
import sharp = require("sharp");

const s3 = new AWS.S3();

export const handler = async (event: any, context: any): Promise<any> => {
    try {
        const bucket = "mr-big-bucket";
        const key = "collectpoint-photos/20e52973-0f7d-45f0-9bdb-3546b91b52fe/1.jpeg";

        // Get the image from S3
        const image = await s3.getObject({ Bucket: bucket, Key: key }).promise();

        // Convert image to WebP
        const webpBuffer = await sharp(image.Body as any)
            .webp({ quality: 80 }) // Adjust quality if needed
            .toBuffer();

        // Upload WebP image back to S3
        const outputKey = key.replace(/\.[^.]+$/, ".webp"); // Change file extension
        await s3.putObject({
            Bucket: "your-destination-bucket", // Change if needed
            Key: outputKey,
            Body: webpBuffer,
            ContentType: "image/webp",
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Image converted successfully!", key: outputKey }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process image" }),
        };
    }
}