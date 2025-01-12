import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export const getS3ObjectUrl = async (key: string): Promise<string | null> => {
  try {
    const params = {
      Bucket: process.env.REACT_APP_AWS_S3_BUCKET!,
      Key: key,
    };

    // Generate a pre-signed URL for accessing the object
    const url = s3.getSignedUrl("getObject", params);
    return url;
  } catch (error) {
    console.error("Error fetching S3 object URL:", error);
    return null;
  }
};
