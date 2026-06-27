import { S3Client } from "@aws-sdk/client-s3";

const getS3Client = () => {
  const region = process.env.AWS_REGION;
  console.log("🪣 S3 Client using region:", region);

  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    }
  });
};

export default getS3Client;