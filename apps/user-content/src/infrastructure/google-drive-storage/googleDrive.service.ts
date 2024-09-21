import { Inject, Injectable } from '@nestjs/common';
import googleApisConfig from '@libs/config/googleApis.config.service';
import { ConfigType } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { Readable } from 'node:stream';

@Injectable()
export class GoogleDriveService {
  private readonly driveClient: drive_v3.Drive;

  constructor(
    @Inject(googleApisConfig.KEY)
    private readonly googleApisConf: ConfigType<typeof googleApisConfig>,
  ) {
    const clientEmail = this.googleApisConf.CLIENT_EMAIL;
    const privateKey = this.googleApisConf.PRIVATE_KEY;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth,
    });
  }

  async upload(file: Express.Multer.File): Promise<{
    uploadedFileId: string;
    directLink: string;
  }> {
    try {
      const bufferToStream = (buffer: Buffer) => {
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null); // передача null означает конец потока
        return readable;
      };

      const response = await this.driveClient.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
        },
        media: {
          mimeType: file.mimetype,
          body: bufferToStream(file.buffer),
        },
      });

      const fileId: string = response.data.id;

      // настройка разрешений для общего доступа личному аккаунту
      await this.driveClient.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: 'dhorizondev@gmail.com',
        },
      });

      // Настройка разрешений для общего доступа всем
      await this.driveClient.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // const uploadedFile = await this.driveClient.files.get({
      //   fileId,
      //   fields: 'id, webViewLink, webContentLink',
      // });

      // Генерация прямой ссылки для отображения изображения
      const imageLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

      // web view link позволяет посмотреть картинку с google интерфейсом
      // console.log('Web View Link:', uploadedFile.data.webViewLink);
      // web content link позволяет скачать картинку (сразу запускает загрузку файла)
      // console.log('Web Content Link:', uploadedFile.data.webContentLink);
      // direct link для фронтендеров
      // console.log('Direct Image Link:', imageLink);

      return {
        uploadedFileId: fileId,
        directLink: imageLink,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async deleteFile(googleFileId: string) {
    try {
      await this.driveClient.files.delete({
        fileId: googleFileId,
      });
      // console.log(
      //   `File with ID ${googleFileId} has been deleted successfully.`,
      // );
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  async deleteAllFiles() {
    try {
      const response = await this.driveClient.files.list({
        pageSize: 1000,
        fields: 'files(id, name)',
      });

      const files = response.data.files;

      if (files.length) {
        console.log('Deleting files:');
        for (const file of files) {
          await this.driveClient.files.delete({
            fileId: file.id,
          });
          console.log(`Deleted file: ${file.name} (${file.id})`);
        }
      } else {
        console.log('No files to delete.');
      }
    } catch (err) {
      console.error('Error deleting files:', err);
    }
  }

  async listAllFiles() {
    try {
      const response = await this.driveClient.files.list({
        pageSize: 1000,
        fields: 'files(id, name)',
      });

      const files = response.data.files;

      if (files.length) {
        console.log('Files:');
        files.forEach((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
      }
    } catch (err) {
      console.error('Error listing files:', err);
    }
  }

  async getDriveUsage() {
    try {
      const response = await this.driveClient.about.get({
        fields: 'storageQuota',
      });

      console.log('Storage Quota:', response.data.storageQuota);
    } catch (err) {
      console.error('Error getting storage quota:', err);
    }
  }
}
