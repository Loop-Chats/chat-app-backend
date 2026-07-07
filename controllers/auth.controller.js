import { generateToken, generateVerificationToken } from "../lib/utils.js";
import { sendVerificationEmail } from "../services/email/email.service.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({email});

        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User ({
            username,
            email,
            password: hashedPassword,
            isVerified: false
        });

        if (newUser) {
            await newUser.save();

            generateToken(newUser._id, res);

            sendWelcomeEmail(newUser.email, newUser.username);

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                isVerified: newUser.isVerified
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in register controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
   
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired verification link" });
        }

        if (decoded.purpose !== 'email_verification') {
            return res.status(403).json({ message: "Unauthorized token use case" });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Your account is already verified." });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Email verified successfully! Connection established." });

    } catch (error) {
        console.log("Error in verifyEmail controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const user = req.user;

        if (user.isVerified) {
            return res.status(400).json({ message: "Your account is already verified." });
        }

        const emailToken = generateVerificationToken(user._id);

        sendVerificationEmail(user.email, user.username, emailToken);

        res.status(200).json({ message: "A new verification link has been sent to your email." });

    } catch (error) {
        console.log("Error in resendVerificationEmail controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};