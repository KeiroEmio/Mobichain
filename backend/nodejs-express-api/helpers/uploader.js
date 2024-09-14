import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import mimetype from 'mime-types';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import config from '../config.js';

const publicDir = config.app.publicDir;
const tempDir = config.upload.tempDir;

class Uploader {
	uploadSettings = {};
	/**
	 * move uploaded file from temp directory to destination
	 * move files only if they are from temp directory
	 * @param files //file paths to temporary files
	 * @param fieldname //field name used to upload the file
	 * @return  file info object{filesize, filename, filetype, fileext}
	 */
	moveUploadedFiles(tempFilePaths, fieldname) {
		let fileInfo = {
			filepath: null,
			fileurl: null,
			filename: null,
			filetype: null,
			filesize: null,
			fileext: null
		};

		if (tempFilePaths && fieldname) {
			this.uploadSettings = config.upload[fieldname];
			let arrFiles = [];
			if (Array.isArray(tempFilePaths)) {
				arrFiles = tempFilePaths;
			}
			else {
				arrFiles = tempFilePaths.toString().split(",");
			}
			if (arrFiles.length) {
				let uploadedFilePaths = [];
				arrFiles.forEach(file => {
					if (file.indexOf(tempDir) > -1) {
						let tmpFile = path.join(publicDir, file);
						if (fs.existsSync(tmpFile)) {
							const filePathDetail = this.moveFile(tmpFile);
							uploadedFilePaths.push(filePathDetail);
						}
					} else {
						const filePathDetail = { fileurl: file, filepath: file };
						uploadedFilePaths.push(filePathDetail);
					}
				});

				if (this.uploadSettings.returnFullpath) {
					fileInfo.filepath = uploadedFilePaths.map(v => v.fileurl).join(",");
				}
				else {
					fileInfo.filepath = uploadedFilePaths.map(v => v.filepath).join(",");
				}

				if (uploadedFilePaths.length) {
					const filepath = uploadedFilePaths[0].filepath;
					let fileFullName = path.join(config.app.publicDir, filepath);
					if (fs.existsSync(fileFullName)) {
						fileInfo.filesize = String(fs.statSync(fileFullName).size);
						fileInfo.filename = path.basename(fileFullName) || '';
						fileInfo.filetype = mimetype.contentType(fileFullName) || '';
						fileInfo.fileext = mimetype.extension(fileInfo.filetype) || '';
					}
				}
			}
		}



		return fileInfo;
	}

	moveFile(filePath) {
		let fileName = path.basename(filePath);
		let newFile = path.join(publicDir, this.uploadSettings.uploadDir, fileName);
		fs.renameSync(filePath, newFile);

		if (this.isImage(newFile)) {
			this.resizeImage(newFile);
		}

		let filepath = path.join(this.uploadSettings.uploadDir, fileName);
		filepath = filepath.replace(/\\/g, "/");

		let fileurl = `${config.app.url}/${filepath}`;
		return { filepath, fileurl };
	}

	isImage(file) {
		let imgExtensions = ["jpg", "png", "gif", "jpeg"];
		let fileExt = path.extname(file).substr(1).toLowerCase();
		return imgExtensions.includes(fileExt);
	}

	resizeImage(filePath) {
		let resizeSettings = this.uploadSettings.imageResize || [];

		resizeSettings.forEach(resize => {

			let fileName = path.basename(filePath);
			var uploadDir = this.uploadSettings.uploadDir || '';
			let newFileDir = path.join(publicDir, uploadDir, resize.name);

			if (!fs.existsSync(newFileDir)) {
				fs.mkdirSync(newFileDir);
			}

			let newFileName = path.join(newFileDir, fileName);

			let mode = resize.mode || "cover";

			let size = {
				fit: mode,
			};

			if (resize.width) {
				size['width'] = resize.width
			}
			if (resize.height) {
				size['height'] = resize.height
			}

			sharp(filePath).resize(size).toFile(newFileName).then(function (newFileInfo) {
				//console.log("Success")
			}).catch(function (err) {
				console.error("Image Resize Error occured", err);
			});
		});
	}

	/**
	 * delete record files when record is deleted
	 * also delete variant of the files if they are images
	 * @param filePath //file path
	 * @param fieldname //field name used to upload the file
	 */
	async deleteRecordFiles(filePath, fieldname) {
		try {
			let filesToBeDeleted = filePath.split(",");
			let imgThumbDirs = ["small", "medium", "large"];
			let uploadSettings = config.upload[fieldname];
			if (uploadSettings) {
				imgThumbDirs = uploadSettings["imageResize"].map(a => a.name);
			}
			let imgExts = ["jpg", "png", "jpeg"];
			filesToBeDeleted.forEach(async (file) => {
				let fullPath = "assets/" + file;
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath);
					let fileExt = path.extname(fullPath).substr(1).toLowerCase();
					if (imgExts.includes(fileExt)) {
						imgThumbDirs.forEach(async (thumbDir) => {
							let paths = fullPath.split("/")
							let lastpath = paths.length - 1;
							paths.splice(lastpath, 0, thumbDir);
							let thumbFullPath = paths.join("/");
							if (fs.existsSync(thumbFullPath)) {
								fs.unlinkSync(thumbFullPath);
							}
						})
					}
				}
			})
		}
		catch (err) {
			console.error(err)
		}
	}

	removeTempFile(tempFilePath) {
		const tmpDir = config.upload.tempDir;
		const filename = path.basename(tempFilePath);
		let fullname = path.join(publicDir, tmpDir, filename);
		if (fs.existsSync(fullname)) {
			fs.unlinkSync(fullname);
		}
	}

	getFileName(file) {
		var newFilename = "";
		var filenameType = this.uploadSettings.filenameType || 'random';
		if (filenameType == 'date') {
			//save file in date format e.g 2018-09-24-02-30-40.jpg
			newFilename = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/\:/g, '-')
		}
		else if (filenameType == 'timestamp') {
			//save file in unix timestamp e.g 20180924023040.jpg
			const ticks = Number(new Date());
			newFilename = Math.floor(ticks / 1000).toString();
		}
		else if (filenameType == 'original') {
			//save file with original filename form the user computer e.g mycv.docx
			newFilename = path.parse(file.originalname).name
		}
		else {
			newFilename = crypto.randomBytes(16).toString("hex");
		}
		//adding prefix to file name example profile_pic_20.jpg
		const filenamePrefix = this.uploadSettings.filenamePrefix || ''
		const fileExt = path.extname(file.originalname).substring(1).toLowerCase();
		newFilename = `${filenamePrefix}${newFilename}.${fileExt}`;
		return newFilename;
	}

	isAllowedExt(file) {
		if (this.uploadSettings.extensions) {
			const fileExt = path.extname(file.originalname).substring(1).toLowerCase();
			const allowed = this.uploadSettings.extensions.replace(/\s/g, '').split(',');
			return allowed.includes(fileExt)
		}
		return true;
	}
	
	upload(fieldName, formName = 'file') {
		this.uploadSettings = config.upload[fieldName];
		const storage = multer.diskStorage({
			destination: (req, file, callback) => {
				const dir = path.join(publicDir, tempDir);
				callback(null, dir);
			},
			filename: (req, file, callback) => {
				const newFilename = this.getFileName(file);
				callback(null, newFilename);
			}
		});
		const upload = multer({
			storage: storage,
			fileFilter: (req, file, callback) => {
				if (!this.isAllowedExt(file)) {
					return callback(new Error('file extension not allowed'));
				}
				callback(null, true);
			},
			limits: {
				fileSize: Number(this.uploadSettings.maxFileSize) * 1024 * 1024,
				files: Number(this.uploadSettings.maxFiles)
			}
		}).array(formName);
		return upload;
	}

	s3upload(fieldName, formName = 'file') {
		this.uploadSettings = config.upload[fieldName];
		const s3 = new S3Client({
			credentials: {
				accessKeyId: config.s3.accessKeyId,
				secretAccessKey: config.s3.secretAccessKey,
			},
			region: config.s3.region,
		});
		const limits = {
			fileSize: Number(this.uploadSettings.maxFileSize) * 1024 * 1024,
			files: Number(this.uploadSettings.maxFiles)
		}

		const upload = multer({
			limits,
			fileFilter: (req, file, callback) => {
				if (!this.isAllowedExt(file)) {
					return callback(new Error('file extension not allowed'));
				}
				callback(null, true);
			},
			storage: multerS3({
				s3: s3,
				bucket: config.s3.bucket,
				metadata: (req, file, callback) => {
					callback(null, { fieldName: file.fieldname });
				},
				key: (req, file, callback) => {
					let fileName = this.getFileName(file);
					callback(null, fileName);
				}
			})
		});
		return upload.array(formName);
	}
}

const uploader = new Uploader();
export default uploader;