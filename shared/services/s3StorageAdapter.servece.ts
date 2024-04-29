import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import appConfig from '@app/config/app.config.service';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class S3StorageAdapter {
  private readonly s3Client: S3Client;

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {
    this.s3Client = new S3Client({
      region: this.config.YANDEX_REGION,
      endpoint: this.config.YANDEX_ENDPOINT,
      credentials: {
        accessKeyId: this.config.YANDEX_ACCESS_KEY_ID,
        secretAccessKey: this.config.YANDEX_SECRET_ACCESS_KEY,
      },
    });
  }

  getBucketUrl() {
    return `https://${this.config.YANDEX_S3_BUCKET}.storage.yandexcloud.net/`;
  }

  async upload({
    file,
    folder,
  }: {
    file: Express.Multer.File;
    folder: string;
  }) {
    const key = `${folder}/${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.config.YANDEX_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      return { url: `${this.getBucketUrl()}${key}`, path: key };
    } catch (err) {
      console.error(err);
    }
  }

  async delete(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.YANDEX_S3_BUCKET,
      Key: path,
    });

    try {
      await this.s3Client.send(command);

      return { ok: true };
    } catch (err) {
      console.error(err);
    }
  }
}
