import { Client } from 'basic-ftp';
import { Readable } from 'stream';
import crypto from 'crypto';
import config from '../config/config.js';

/**
 * @typedef {Object} UploadResult
 * @property {boolean} success - Whether the upload was successful
 * @property {string} [url] - The public URL of the uploaded file
 * @property {string} [fileName] - The name of the uploaded file
 * @property {string} [error] - Error message if upload failed
 */

/**
 * @typedef {Object} DeleteResult
 * @property {boolean} success - Whether the deletion was successful
 * @property {string} [error] - Error message if deletion failed
 */

/**
 * Service class for handling FTP file operations.
 * Provides methods for uploading and deleting files on the FTP server.
 * @class FtpService
 */
class FtpService {
  /**
   * Creates an FTP client connection with configured credentials.
   * @private
   * @async
   * @returns {Promise<Client>} Connected FTP client
   */
  async #createConnection() {
    const client = new Client();

    await client.access({
      host: config.ftpConfig.host,
      port: parseInt(config.ftpConfig.port) || 21,
      user: config.ftpConfig.user,
      password: config.ftpConfig.password,
      secure: false
    });

    return client;
  }

  /**
   * Generates a unique filename using timestamp and random bytes.
   * @private
   * @param {string} extension - The file extension (e.g., 'png', 'jpg')
   * @returns {string} Unique filename
   */
  #generateUniqueFileName(extension) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomBytes}.${extension}`;
  }

  /**
   * Extracts the MIME type and raw data from a base64 data URL.
   * @private
   * @param {string} base64String - The base64 data URL string
   * @returns {{ mimeType: string, extension: string, buffer: Buffer }} Parsed data
   * @throws {Error} If the base64 string format is invalid
   */
  #parseBase64Image(base64String) {
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

    if (!matches) {
      throw new Error('Invalid base64 image format. Expected format: data:image/[type];base64,[data]');
    }

    const extension = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    return { mimeType: `image/${extension}`, extension, buffer };
  }

  /**
   * Uploads a file from a base64 string to the FTP server.
   * @async
   * @param {string} base64String - The base64 encoded file data (with data URL prefix)
   * @param {string} remotePath - The remote directory path on the FTP server
   * @returns {Promise<UploadResult>} Result of the upload operation
   */
  async uploadFromBase64(base64String, remotePath = config.ftpConfig.remotePath) {
    const client = await this.#createConnection();

    try {
      const { extension, buffer } = this.#parseBase64Image(base64String);
      const fileName = this.#generateUniqueFileName(extension);
      const fullRemotePath = `${remotePath}/${fileName}`;

      const readableStream = Readable.from(buffer);
      await client.uploadFrom(readableStream, fullRemotePath);

      const publicUrl = `${config.ftpConfig.publicUrlBase}/${fileName}`;

      return {
        success: true,
        url: publicUrl,
        fileName
      };
    } catch (error) {
      console.error('FTP upload error:', error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      client.close();
    }
  }

  /**
   * Uploads a file from a Buffer to the FTP server.
   * @async
   * @param {Buffer} buffer - The file data as a Buffer
   * @param {string} extension - The file extension (e.g., 'png', 'jpg')
   * @param {string} remotePath - The remote directory path on the FTP server
   * @returns {Promise<UploadResult>} Result of the upload operation
   */
  async uploadFromBuffer(buffer, extension, remotePath = config.ftpConfig.remotePath) {
    const client = await this.#createConnection();

    try {
      const fileName = this.#generateUniqueFileName(extension);
      const fullRemotePath = `${remotePath}/${fileName}`;

      const readableStream = Readable.from(buffer);
      await client.uploadFrom(readableStream, fullRemotePath);

      const publicUrl = `${config.ftpConfig.publicUrlBase}/${fileName}`;

      return {
        success: true,
        url: publicUrl,
        fileName
      };
    } catch (error) {
      console.error('FTP upload error:', error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      client.close();
    }
  }

  /**
   * Deletes a file from the FTP server.
   * @async
   * @param {string} fileName - The name of the file to delete
   * @param {string} remotePath - The remote directory path on the FTP server
   * @returns {Promise<DeleteResult>} Result of the delete operation
   */
  async deleteFile(fileName, remotePath = config.ftpConfig.remotePath) {
    const client = await this.#createConnection();

    try {
      const fullRemotePath = `${remotePath}/${fileName}`;
      await client.remove(fullRemotePath);

      return { success: true };
    } catch (error) {
      console.error('FTP delete error:', error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      client.close();
    }
  }

  /**
   * Extracts the filename from a public URL.
   * @param {string} url - The public URL of the file
   * @returns {string} The filename
   */
  extractFileNameFromUrl(url) {
    return url.split('/').pop();
  }

  /**
   * Deletes a file from the FTP server using its public URL.
   * @async
   * @param {string} url - The public URL of the file to delete
   * @param {string} remotePath - The remote directory path on the FTP server
   * @returns {Promise<DeleteResult>} Result of the delete operation
   */
  async deleteFileByUrl(url, remotePath = config.ftpConfig.remotePath) {
    const fileName = this.extractFileNameFromUrl(url);
    return this.deleteFile(fileName, remotePath);
  }

  /**
   * Checks if the FTP connection can be established.
   * @async
   * @returns {Promise<boolean>} True if connection is successful
   */
  async checkConnection() {
    let client;
    try {
      client = await this.#createConnection();
      return true;
    } catch (error) {
      console.error('FTP connection check failed:', error.message);
      return false;
    } finally {
      client?.close();
    }
  }
}

export default new FtpService();
