import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Persona from "../models/Persona.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../middleware/validation.js";
import { config } from "../config/index.js";
import subscriptionService from "../services/subscriptionService.js";
import emailService from "../services/emailService.js";

const router = express.Router();

// Register new user
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, persona, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
    };

    // Add profile data if provided
    if (profile) {
      userData.profile = {
        jobTitle: profile.jobTitle || null,
        company: profile.company || null,
        industry: profile.industry || null,
        experience: profile.experience || null,
        linkedinUrl: profile.linkedinUrl || null,
      };
    }

    // Add persona data if provided
    if (persona) {
      userData.persona = {
        name: persona.name || null,
        writingStyle: persona.writingStyle || null,
        tone: persona.tone || null,
        expertise: persona.expertise || null,
        targetAudience: persona.targetAudience || null,
        goals: persona.goals || null,
        contentTypes: persona.contentTypes || [],
        postingFrequency: persona.postingFrequency || null,
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Create trial subscription for new user
    const subscription = await subscriptionService.createTrialSubscription(
      user._id
    );
    console.log("✅ Trial subscription created for new user:", user._id);

    // Create Persona document if persona data was provided
    let createdPersona = null;
    if (persona) {
      try {
        createdPersona = await Persona.create({
          userId: user._id,
          name: persona.name || `${name}'s Persona`,
          description: persona.expertise || `Professional persona for ${name}`,
          tone: persona.tone || "professional",
          industry: profile?.industry || "Professional Services",
          experience: profile?.experience || "mid",
          writingStyle: persona.writingStyle || "Clear and professional",
          isDefault: true,
          isActive: true,
        });
        console.log("✅ Persona document created for new user:", user._id);
      } catch (personaError) {
        console.error(
          "⚠️ Failed to create persona document:",
          personaError.message
        );
        // Don't fail registration if persona creation fails
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    // Send welcome email (non-blocking)
    emailService
      .sendWelcomeEmail(user)
      .then(() => {
        console.log(`✅ Welcome email sent to ${user.email}`);
      })
      .catch((error) => {
        console.error(`⚠️ Failed to send welcome email to ${user.email}:`, error.message);
        // Don't fail registration if email fails
      });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          trialEndDate: subscription.trialEndDate,
          limits: subscription.limits,
        },
        persona: createdPersona
          ? {
              id: createdPersona._id,
              name: createdPersona.name,
              tone: createdPersona.tone,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// Login user
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
});

export default router;
