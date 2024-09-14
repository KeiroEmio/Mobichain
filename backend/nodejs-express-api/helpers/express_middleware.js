
import { RecordNotFound, BadRequest, AccessForbbiden, UnauthorizedAccess, ServerError } from "./constants.js";
import { launch } from 'puppeteer';
import writeToDBLog from './auditlog.js';
import sanitizeInput from './sanitizeinput.js';

let browserPage = null;

export default function (app) {

	app.use((req, res, next) => {
		if (req.body) {
			req.formData = req.body;
			sanitizeInput(req.body);
		};
		next();
	});

	app.response.ok = function (message) {
		return this.send(message)
	}

	app.response.notFound = function (message) {
		message = message || RecordNotFound;
		return this.status(404).send(message)
	}

	app.response.badRequest = function (message) {
		message = message || BadRequest;
		return this.status(400).send(message)
	}

	app.response.forbidden = function (message) {
		message = message || AccessForbbiden;
		return this.status(403).send(message)
	}

	app.response.unauthorized = function (message) {
		message = message || UnauthorizedAccess;
		return this.status(401).send(message)
	}

	app.response.serverError = function (message) {
		console.log("\n\n-------------------------- Exception Stack Trace --------------------------\n\n")
		console.error("Server Request Error", message);
		console.log("\n\n-------------------------- End of Exception Stack Trace --------------------------\n\n")
		return this.status(500).send(ServerError)
	}

	app.response.generatePdf = async function (html, fileName, puppeteerConfig, mediaType = 'screen') {

		const browser = await launch();
		const pages = await browser.pages();
		
		// reuse page if already opened.
		browserPage = pages.length ? pages[0] : await browser.newPage();

		try {
			await browserPage.setContent(html, { waitUntil: 'domcontentloaded' });
			if (mediaType) {
				// To reflect CSS used for screen instead of print
				await browserPage.emulateMediaType(mediaType);
			}

			// generate the PDF
			const pdf = await browserPage.pdf(puppeteerConfig);
			
			await browserPage.close();
			// Close the browser instance
			await browser.close();

			this.attachment(`${fileName}.pdf`);
			this.contentType("application/pdf");
			return this.send(pdf);
		}
		catch (err) {
			console.error(err.message);
		} 
		finally {
			await browserPage?.close().catch((err) => console.error(err.message));
			await browser?.close().catch((err) => console.error(err.message));
		}
		return this.status(500).send("Error generating pdf..");
	}

	app.request.writeToAuditLog = function (record) {
		const req = this;
		writeToDBLog(req, record);
	}

}
