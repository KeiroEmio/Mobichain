import { Router } from 'express';
import { body } from 'express-validator';
import uploader from '../helpers/uploader.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';

const router = Router();

/**
 * Route to add a new message
 * @POST /messages/add
 */
router.post('/send', [
    body('fromId').isNumeric(),
    body('toId').isNumeric(),
    body('msg').isLength({ min: 1 })
], validateFormData, async (req, res) => {
    try {
        console.log('body:',)
        let messageData = req.getValidFormData();
        console.log('messageData:', messageData)
        // Process file upload if included
        if (req.files && req.files.image) {
            const fileInfo = uploader.moveUploadedFiles(req.files.image.path, 'imagepath');
            messageData.imagepath = fileInfo.filepath;
        }

        const message = await DB.Message.create(messageData);
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Route to view messages by fromId
 * @GET /messages/bySender/:fromId
 */
router.get('/bySender/:fromId/:toId', async (req, res) => {
    try {
        const { fromId, toId } = req.params;
        const messages = await DB.Message.findAll({
            where: {
                [DB.op.or]: [
                    { fromId: fromId, toId: toId },
                    { fromId: toId, toId: fromId }
                ]
            },
            // order: [['createdAt', 'ASC']],  // Assuming 'createdAt' is the timestamp column
            raw: true
        });
        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: 'No messages found' });
        }
        return res.json(messages);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Route to update a message
 * @PUT /messages/update/:id
 */
router.put('/update/:id', async (req, res) => {
    try {
        const { msg } = req.body;
        const { id } = req.params;
        const updated = await DB.Message.update({ msg }, {
            where: { id }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Message not found' });
        }
        return res.json({ message: 'Message updated' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Route to delete a message
 * @DELETE /messages/delete/:id
 */
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await DB.Message.destroy({
            where: { id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Message not found' });
        }
        return res.json({ message: 'Message deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
