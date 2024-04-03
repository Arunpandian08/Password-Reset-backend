import User from "../Models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from 'nodemailer'

dotenv.config();

export const registerUser = async (request, response) => {
  try {
    //get user data from request body
    const { name, contactNumber, email, password } = request.body;
    // check if user with the provided email already exits
    const checkExistingUser = await User.findOne({ email });

    // if the existing user
    if (checkExistingUser) {
      return response.status(409).json({ message: "User already exists" });
    }
    //if new user make password as hashed
    const hashPassword = await bcrypt.hash(password, 10);

    //create a new user document
    const newUser = new User({
      name,
      contactNumber,
      email,
      password: hashPassword,
    });
    // save the new users to the database
    const savedUser = await newUser.save();

    // send success response
    response.status(200).json({
      message: "Register Successful",
      registeredUser: {
        name: savedUser.name,
        contactNumber: savedUser.contactNumber,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.log("Internal server Error", error);
    response.status(500).json({ message: "Internal server Error" });
  }
};

export const userLogin = async (request, response) => {
  try {
    //get email and password through request body
    const { email, password } = request.body;

    //check if the existing user is registered
    const checkExistingUser = await User.findOne({ email });

    //if user not found return error
    if (!checkExistingUser)
      return response.status(404).json({ message: "User Not Found" });

    //check if the password matches
    const matchingPassword = await bcrypt.compare(
      password,
      checkExistingUser.password
    );
    if (!matchingPassword) {
      return response.status(400).json({ message: "Invalid Password" });
    }
    response.status(200).json({ message: "Login Successful" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server error" });
  }
};

export const forgetPassword = async (request, response) => {
  try {
    //get Email from request body
    const { email } = request.body;

    //check if the email is exists in the db
    if (!email) {
      response.status(404).json({ message: "User Not Found" });
    }

    //Generating RandomString using crypto
    const token = crypto.randomBytes(10).toString("hex");

    //update token to the User in database 
    await User.updateOne({ email }, { resetCode: token });

    const resetURL = `http://localhost:5173/passwordreset/${encodeURIComponent(token)}`;

    //Construct Email message
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Reset Password",
      html: `<p>Click  This Link <a href="${resetURL}">${resetURL}</a> to reset your password</p>`,
    };

    //create a transporter object using SMTP transport
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Send mail
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending mail:", error);
        return response.status(500).json({ message: "Failed to send mail" });
      }
      console.log("Email sent:", info.response);
      response.status(200).json({ message: "Please check your email" });
    });
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    response.status(500).send("Internal Server Error");
  }
};

export const validateResetToken = async (request, response) => {
  let token = request.params.token;
  try {
      const records = await User.findOne({ resetCode: token });
      // Has records ?
      if (records && records._doc) {
          response.status(200).json({ valid: true, msg: "Valid Reset" });
      } else {
          response.status(404).json({ valid: false, msg: "Invalid token" });
      }
  } catch (error) {
      console.log("Internal Server Error", error);
      response.status(500).json({ message: "Internal Server Error" });
  }
}


export const passwordReset = async (request, response) => {
    // Receive needed keys from request body
    const { email, newPassword, confirmPassword } = request.body;
    try {
      // Find user by email
      const existingUser = await User.findOne({ email });
  
      // If user not found, return error
      if (!existingUser) {
        return response.status(404).json({ message: "User not found" });
      }
  
      // Check if newPassword and confirmPassword match and are not empty
      if (
        newPassword !== confirmPassword ||
        newPassword === "" ||
        confirmPassword === ""
      ) {
        return response
          .status(400)
          .json({ message: "New password and confirm password do not match" });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await User.updateOne({ email }, { password: hashedPassword });
  
      // Response message
      response.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  };