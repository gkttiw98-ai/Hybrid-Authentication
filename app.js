import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
 app.use(cookieParser());

// Middlewares
app.use(express.json());
app.use(cors({
    origin: "https://hybrid-authentication.onrender.com",  // your frontend port, change if needed
    credentials: true
}));

// MongoDB Connection
const uri = "mongodb+srv://gaurav:231217@cluster0.84uezai.mongodb.net/userdata";
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Error:", err));

/* ---------------------------------------------
   USER SCHEMA
--------------------------------------------- */
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model("User", userSchema);

/* ---------------------------------------------
   SESSION SCHEMA
--------------------------------------------- */
const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: String,
    valid: { type: Boolean, default: true }
}, {
    timestamps: true   // automatically adds createdAt & updatedAt
});

const Session = mongoose.model("Session", sessionSchema);

var authenticate = async (req, res, next) => {
    var accessToken = req.cookies.accessToken;
var refreshToken = req.cookies.refreshToken;


    if (accessToken) {
        try {
            jwt.verify(accessToken, "MY_SECRET_KEY")
            return next();
        }
        catch (err) {

        }
    }
     if (refreshToken) {

        try {
            var data = jwt.verify(refreshToken, "MY_Refresh_SECRET_KEY");
            var userdata = await User.findById(data.userId);


            await Session.deleteOne({ userId: data.userId });
            await Session.create({
                userId: data.userId,
                ip: req.ip,
                valid: true
            })
            var newAccessToken = jwt.sign(
                {
                    _id: userdata._id,
                    name: userdata.name,
                    email: userdata.email

                },
                "MY_SECRET_KEY",
                { expiresIn: "2m" }
            );
            var newRefreshToken = jwt.sign(
                {
                    userId: userdata._id,
                    ip: req.ip,
                    valid: true
                },     // payload
                "MY_Refresh_SECRET_KEY",         // secret key
                { expiresIn: "7d" }
            )
            res.cookie("accessToken", newAccessToken)
            res.cookie("refreshToken", newRefreshToken)
            return next();

        }
        catch (err) {

        }
    }
    return res.status(401).json({ message: "Unauthorized" });
}

/* ---------------------------------------------
   ROUTES
--------------------------------------------- */

// Serve signup page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

// Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check existing email
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.json({ success: false, message: "Email already exists!" });
        }

        // Create user
        const newUser = new User({ name, email, password });
        const savedUser = await newUser.save();
        const accessToken = jwt.sign(
            {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email

            },
            "MY_SECRET_KEY",
            { expiresIn: "2m" }
        );


        // Create session
        var sessionUser = await Session.create({
            userId: savedUser._id,
            ip: req.ip,
            valid: true
        });

        const refreshToken = jwt.sign(
            {
                userId: savedUser._id,
                ip: req.ip,
                valid: true
            },     // payload
            "MY_Refresh_SECRET_KEY",         // secret key
            { expiresIn: "7d" }      // token validity
        );
        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });
        return res.json({
            success: true,
            message: "Signup successful",
        });

    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Signup failed" });
    }
});

app.use(authenticate);
app.get("/home.html", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
})
app.get("/about.html", (req, res) => {
    res.sendFile(path.join(__dirname, "about.html"));
})



// Start Server
app.listen(8000, () => {
    console.log("Server running on PORT 8000");
});
