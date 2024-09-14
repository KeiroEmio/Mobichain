import { Router } from 'express';
import UsersMap from '../models/UsersMap.js';

const router = Router();

router.get('/get/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;
        const usersMap = await UsersMap.findOne({ owner: ownerId });

        if (!usersMap) {
            return res.status(404).json({ message: "No users map found for this owner." });
        }

        const uniqueUsers = {};
        usersMap.users.forEach(user => {
            uniqueUsers[user.id] = user;
        });

        // Convert the uniqueUsers object back to an array of users
        const users = Object.values(uniqueUsers);

        // Attach the unique users array back to the usersMap object
        const result = {
            ...usersMap.toObject(),  // Convert document to object if it's a Mongoose document
            users
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users map', error });
    }
});

router.post('/add/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { user } = req.body;
        let usersMap = await UsersMap.findOne({ owner: ownerId });

        if (usersMap) {
            // Deep comparison to check if the exact user object already exists
            const isUserExist = usersMap.users.some(u => JSON.stringify(u) === JSON.stringify(user));

            if (!isUserExist) {
                usersMap.users.push(user);
                await usersMap.save();
                res.status(201).json({ success: true, message: "User added to existing users map.", usersMap });
            } else {
                res.status(200).json({ success: false, message: "Identical user already exists in the users map." });
            }
        } else {
            const newUsersMap = new UsersMap({
                owner: ownerId,
                users: [user]
            });
            await newUsersMap.save();
            res.status(201).json({ success: true, message: "New users map created and user added.", usersMap: newUsersMap });
        }
    } catch (error) {
        console.error('Error adding user to users map:', error);
        res.status(500).json({ message: 'Error adding user to users map', error });
    }
});


router.put('/update/:usersMapId', async (req, res) => {
    try {
        const { usersMapId } = req.params;
        const { users } = req.body;
        const updatedUsersMap = await UsersMap.findByIdAndUpdate(
            usersMapId,
            { users },
            { new: true, runValidators: true }
        );
        res.json({ success: true, updatedUsersMap });
    } catch (error) {
        res.status(500).json({ message: 'Error updating users map', error });
    }
});

router.delete('/delete/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId);

        const results = await UsersMap.updateMany(
            { "users.id": userIdInt },
            { $pull: { users: { id: userIdInt } } }
        );

        if (results.modifiedCount > 0) {
            res.json({ success: true, message: "User removed from users maps." });
        } else {
            res.status(404).json({ message: "No users map found containing the user." });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing user from users maps', error });
    }
});


export default router;
