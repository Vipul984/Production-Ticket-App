const router = require('express').Router();
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.send({
                message: 'User already exists',
                success: false,
                data: null,
            });
        }
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedpassword;
        const newUser = new User(req.body);
        await newUser.save();
        res.send({
            message: 'User created successfully',
            success: true,
            data: null,
        });


    } catch (error) {
        res.send({
            message: error.message,
            success: false,
            data: null
        });

    }
});

router.post("/login", async (req, res) => {
    try {
        const userExist = await User.findOne({ email: req.body.email });
        if (!userExist) {
            return res.send({
                message: "User Does not exist",
                success: false,
                data: null,
            });
        }
        if (userExist.isBlocked) {
            return res.send({
                message: "Your Account is Blocked, Please Contact Admin!",
                success: false,
                data: null,
            })

        }
        const compare = await bcrypt.compare(req.body.password, userExist.password);
        if (!compare) {
            return res.send({
                message: "Incorrect Password",
                success: false,
                data: null,
            });

        }
        const token = jwt.sign(
            { userId: userExist._id },
            process.env.jwt_secret,
            { expiresIn: "1d" }
        );
        res.send({
            message: "User logged In successfully",
            success: true,
            data: token
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false,
            data: null,
        });

    }
});

router.post('/get-user-by-id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        res.send({
            message: "User fetched successfully",
            success: true,
            data: user,
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false,
            data: null,
        });

    }
});

router.post("/get-all-users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({});
        res.send({
            message: "Users fetched successfully",
            success: true,
            data: users,
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false,
            data: null,
        });
    }
});
router.post("/update-user-permissions", authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.body._id, req.body);
        res.send({
            message: "User permissions updated successfully",
            success: true,
            data: null,
        });
    } catch {
        res.send({
            message: error.message,
            success: false,
            data: null,
        });
    }
});

module.exports = router;