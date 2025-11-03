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
import referralService from "../services/referralService.js";

const router = express.Router();

// Register new user
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, persona, profile, referralCode } = req.body;

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

    // Add interests if provided
    if (req.body.interests && Array.isArray(req.body.interests)) {
      userData.interests = req.body.interests;
    }

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

    // Process referral if referral code was provided
    let referralResult = null;
    if (referralCode) {
      referralResult = await referralService.processReferralSignup(
        user,
        referralCode
      );
      if (referralResult.success) {
        console.log(
          `✅ Referral processed for ${user.email} via ${referralCode}`
        );
      }
    }

    // Generate referral code for new user
    try {
      await referralService.generateReferralCode(user);
    } catch (error) {
      console.error("Error generating referral code:", error);
      // Non-blocking - continue registration
    }

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
        console.error(
          `⚠️ Failed to send welcome email to ${user.email}:`,
          error.message
        );
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
        referral: referralResult?.success
          ? {
              extendedTrial: true,
              trialDays: 14,
              referredBy: referralResult.referrer?.name,
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
    const { name, avatar, profile, persona, interests } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    
    // Update nested profile object
    if (profile && typeof profile === 'object') {
      updateData.profile = {};
      if (profile.jobTitle !== undefined) updateData.profile.jobTitle = profile.jobTitle;
      if (profile.company !== undefined) updateData.profile.company = profile.company;
      if (profile.industry !== undefined) updateData.profile.industry = profile.industry;
      if (profile.experience !== undefined) updateData.profile.experience = profile.experience;
      if (profile.linkedinUrl !== undefined) updateData.profile.linkedinUrl = profile.linkedinUrl;
      if (profile.onboardingCompleted !== undefined) updateData.profile.onboardingCompleted = profile.onboardingCompleted;
      if (profile.postFormatting !== undefined) updateData.profile.postFormatting = profile.postFormatting;
    }
    
    // Update nested persona object
    if (persona && typeof persona === 'object') {
      updateData.persona = {};
      if (persona.name !== undefined) updateData.persona.name = persona.name;
      if (persona.writingStyle !== undefined) updateData.persona.writingStyle = persona.writingStyle;
      if (persona.tone !== undefined) updateData.persona.tone = persona.tone;
      if (persona.expertise !== undefined) updateData.persona.expertise = persona.expertise;
      if (persona.targetAudience !== undefined) updateData.persona.targetAudience = persona.targetAudience;
      if (persona.goals !== undefined) updateData.persona.goals = persona.goals;
      if (persona.contentTypes !== undefined) updateData.persona.contentTypes = persona.contentTypes;
      if (persona.trainingPostIds !== undefined && Array.isArray(persona.trainingPostIds)) {
        updateData.persona.trainingPostIds = persona.trainingPostIds;
      }
    }
    
    // Update interests array
    if (interests && Array.isArray(interests)) {
      updateData.interests = interests;
    }

    // Use $set operator for nested updates to merge with existing data
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

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
