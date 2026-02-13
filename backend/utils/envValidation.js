/**
 * Environment Variable Validation Utility
 * Validates required environment variables in production to prevent runtime errors
 */

/**
 * Validates required environment variables
 * @param {boolean} isProduction - Whether we're in production mode
 * @throws {Error} If required variables are missing in production
 */
export function validateEnvironmentVariables(isProduction = false) {
  // Only validate in production
  if (!isProduction) {
    console.log("🔧 Development mode: Skipping environment variable validation");
    return;
  }

  console.log("🔍 Validating environment variables for production...");

  const requiredVars = [
    {
      name: "MONGODB_URI",
      value: process.env.MONGODB_URI,
      description: "MongoDB connection string",
    },
    {
      name: "JWT_SECRET",
      value: process.env.JWT_SECRET,
      description: "JWT secret key for authentication",
      skipIf: (val) => val && val !== "your-super-secret-jwt-key-change-this-in-production",
    },
    {
      name: "ADMIN_JWT_SECRET",
      value: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      description: "Admin JWT secret key",
      skipIf: (val) => val && val !== "your-super-secret-admin-jwt-key-change-this-in-production",
    },
    {
      name: "GOOGLE_AI_API_KEY",
      value: process.env.GOOGLE_AI_API_KEY,
      description: "Google AI API key for content generation",
    },
    {
      name: "RAZORPAY_KEY_ID",
      value: process.env.RAZORPAY_KEY_ID,
      description: "Razorpay key ID for payments",
    },
    {
      name: "RAZORPAY_KEY_SECRET",
      value: process.env.RAZORPAY_KEY_SECRET,
      description: "Razorpay key secret for payments",
    },
    {
      name: "RAZORPAY_WEBHOOK_SECRET",
      value: process.env.RAZORPAY_WEBHOOK_SECRET,
      description: "Razorpay webhook secret",
    },
    {
      name: "FRONTEND_URL",
      value: process.env.FRONTEND_URL,
      description: "Frontend application URL",
    },
  ];

  const missingVars = [];
  const warnings = [];

  requiredVars.forEach(({ name, value, description, skipIf }) => {
    // Check if variable should be skipped (e.g., has default value that shouldn't be used in production)
    if (skipIf && skipIf(value)) {
      return; // Variable is valid
    }

    if (!value || value.trim() === "") {
      missingVars.push({ name, description });
    } else if (skipIf && !skipIf(value)) {
      warnings.push({
        name,
        description: `${description} - Using default/placeholder value which is insecure for production`,
      });
    }
  });

  if (warnings.length > 0) {
    console.warn("⚠️  Environment variable warnings:");
    warnings.forEach(({ name, description }) => {
      console.warn(`   - ${name}: ${description}`);
    });
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach(({ name, description }) => {
      console.error(`   - ${name}: ${description}`);
    });
    throw new Error(
      `Missing required environment variables: ${missingVars.map((v) => v.name).join(", ")}`
    );
  }

  console.log("✅ All required environment variables are set");
}

/**
 * Validates optional but recommended environment variables
 * Logs warnings but doesn't throw errors
 */
export function validateOptionalEnvironmentVariables() {
  const optionalVars = [
    {
      name: "RESEND_API_KEY",
      value: process.env.RESEND_API_KEY,
      description: "Resend API key for email functionality",
    },
    {
      name: "CORESIGNAL_API_KEY",
      value: process.env.CORESIGNAL_API_KEY,
      description: "CoreSignal API key for LinkedIn data",
    },
  ];

  const missingOptional = optionalVars.filter(({ value }) => !value || value.trim() === "");

  if (missingOptional.length > 0) {
    console.warn("⚠️  Optional environment variables not set (some features may be limited):");
    missingOptional.forEach(({ name, description }) => {
      console.warn(`   - ${name}: ${description}`);
    });
  }
}
