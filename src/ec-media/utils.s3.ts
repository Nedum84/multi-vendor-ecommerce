import config from "../ec-config/config";
import { S3 } from "aws-sdk";
import { once } from "lodash";
import { isLocal, isTest } from "../ec-utils/env.utils";
import { bucketName } from "./constants";

const cloudfrontUrl = config.AWS_S3_DISTRIBUTION;

export const uploadFile = async (
  key: string,
  data: Buffer,
  ACL: "public-read" | "private" = "public-read"
): Promise<string> => {
  const storage = await getStorageInstance();
  await storage
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: data,
      ACL,
    })
    .promise();

  return generateBaseUrl(key);
};

export const duplicateFile = async (sourceKey: string, newKey: string): Promise<string> => {
  const storage = await getStorageInstance();

  storage
    .copyObject({
      Bucket: bucketName,
      Key: newKey,
      CopySource: `${bucketName}/${sourceKey}`,
    })
    .promise();

  return generateBaseUrl(newKey);
};

export const generateBaseUrl = (key: string) => {
  if (isLocal() || isTest()) return `${config.MINIO_BASE_URL}/${bucketName}/${key}`;

  const domain = cloudfrontUrl || `s3.${config.AWS_REGION}.amazonaws.com/${bucketName}`;
  return `https://${domain}/${key}`;
};

export async function getStorageInstance(bucket: string = bucketName) {
  const storage = createOrGetStorageInstance();

  // ONLY DO THIS FOR LOCAL/TEST SINCE I CREATE BUCKET
  // NAME/CLOUDFRONT NAME FROM SERVERLESS DEPLOYMET FILE(serverless.yml) FOR OTHER ENVIRONMENTS
  if (isLocal() || isTest()) {
    await createBucketIfNotExist(bucket, storage);
  }

  return storage;
}

const createOrGetStorageInstance = once((): S3 => {
  if (isLocal() || isTest()) {
    // MinIO
    return new S3({
      endpoint: config.MINIO_BASE_URL,
      s3ForcePathStyle: true,
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.MINIO_USERNAME,
        secretAccessKey: config.MINIO_PASSWORD,
      },
    });
  }

  // AWS S3
  return new S3({
    region: config.AWS_REGION,
    // credentials: {
    //   accessKeyId: config.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    // },
  });
});

async function createBucketIfNotExist(bucket: string, storage: S3): Promise<void> {
  try {
    await storage.createBucket({ Bucket: bucket }).promise();

    await storage
      .putBucketPolicy({
        Bucket: bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicRead",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject", "s3:GetObjectVersion"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }),
      })
      .promise();
  } catch (error) {
    const code = error.code || error.Code;
    if (code === "BucketAlreadyOwnedByYou") {
      return;
    }

    throw error;
  }
}
