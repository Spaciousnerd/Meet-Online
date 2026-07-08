import { User } from "../models/userModel.js";
import { Meeting } from "../models/meetingModel.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";
import { historySchema } from "../schemas/chatSchema.js";
const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.issues,
    });
  }
  const { email, password } = parsed.data;
  if (!email) return res.status(400).json({ message: "no email" });
  if (!password) return res.status(400).json({ message: "No password" });
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        message: "Invalid email or password",
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    }
    let token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    console.log(`Logged : ${user.username}`);
    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
const register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.issues,
    });
  }
  const { name, email, username, password } = parsed.data;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error : Could Register User" });
  }
};
const getUserHistory = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const meetings = await Meeting.find({ user_id: user.username }).sort({
      createdAt: -1,
    });
    res.json(meetings);
  } catch (e) {
    res.json({ message: "Error while fetching history" });
  }
};
const addToHistory = async (req, res) => {
  const parsed = historySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.issues,
    });
  }
  const { token, meetingCode } = parsed.data;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meetingCode,
    });
    await newMeeting.save();
    res.status(httpStatus.CREATED).json({ message: "Meeting History updated" });
  } catch (e) {
    console.log(e);
    res
      .status(httpStatus.NOT_MODIFIED)
      .json({ message: "Failed to update history" });
  }
};
const clearHistory = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    await Meeting.deleteMany({ user_id: user.username });
    res.status(200).json({
      message: "History cleared successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Failed to clear history",
    });
  }
};
export { login, register, getUserHistory, addToHistory, clearHistory };
