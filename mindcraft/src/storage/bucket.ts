import { Storage } from '@google-cloud/storage';
import { getEnv } from '../utils';

const storage = new Storage({
  keyFilename: getEnv('PATH_TO_SERVICEACCOUNTKEY'),
});

const bucket = storage.bucket(getEnv('BUCKET_NAME'));

export function isUploadFileSuccess(
  result: UploadFileResult
): result is { url: string } {
  return 'url' in result;
}
import { unlink } from 'node:fs/promises';
type UploadFileResult = { error: string } | { url: string };

export async function uploadFile(
  file: File,
  userId: number
): Promise<UploadFileResult> {
  try {
    const baseDir = `${__dirname}/uploads`;
    const tempFilePath = `${baseDir}/${userId}.${file.name}`;

    await Bun.write(tempFilePath, file);

    const [result] = await bucket.upload(tempFilePath, {
      destination: `images/profiles/${userId}.${file.name}`,
    })

    await unlink(tempFilePath);

    return {
      url: result.publicUrl(),
    };
  } catch (error) {
    return {
      error: `Failed to upload file to bucket: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}
