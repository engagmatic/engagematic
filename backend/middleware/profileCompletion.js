import User from "../models/User.js";
import Persona from "../models/Persona.js";

/**
 * Middleware to check if user has completed their profile setup
 * Required fields: name, email, linkedinUrl, and at least one persona
 */
export const requireProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user details
    const user = await User.findById(userId).select(
      "name email linkedinUrl persona"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has completed basic profile
    const hasBasicProfile = user.name && user.email;

    if (!hasBasicProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile completion required",
        code: "PROFILE_INCOMPLETE",
        missingFields: {
          name: !user.name,
          email: !user.email,
          linkedinUrl: !user.linkedinUrl,
        },
        redirectTo: "/profile-setup",
      });
    }

    // Check if user has at least one persona
    const personaCount = await Persona.countDocuments({
      userId: userId,
      isActive: true,
    });

    if (personaCount === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one AI persona is required",
        code: "PERSONA_REQUIRED",
        redirectTo: "/personas",
      });
    }

    // Profile is complete, proceed
    req.userProfile = user;
    next();
  } catch (error) {
    console.error("Profile completion check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to check profile completion status without blocking
 * Returns profile completion info in response
 */
export const checkProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user details
    const user = await User.findById(userId).select(
      "name email linkedinUrl persona"
    );

    if (!user) {
      req.profileComplete = false;
      req.profileStatus = {
        hasBasicProfile: false,
        hasPersona: false,
        missingFields: ["name", "email", "linkedinUrl"],
      };
      return next();
    }

    // Check basic profile completion
    const hasBasicProfile = user.name && user.email && user.linkedinUrl;
    const missingFields = [];

    if (!user.name) missingFields.push("name");
    if (!user.email) missingFields.push("email");
    if (!user.linkedinUrl) missingFields.push("linkedinUrl");

    // Check if user has at least one persona
    const personaCount = await Persona.countDocuments({
      userId: userId,
      isActive: true,
    });

    const hasPersona = personaCount > 0;

    req.profileComplete = hasBasicProfile && hasPersona;
    req.profileStatus = {
      hasBasicProfile,
      hasPersona,
      missingFields,
      personaCount,
    };

    next();
  } catch (error) {
    console.error("Profile completion check error:", error);
    req.profileComplete = false;
    req.profileStatus = {
      hasBasicProfile: false,
      hasPersona: false,
      missingFields: ["name", "email", "linkedinUrl"],
    };
    next();
  }
};
