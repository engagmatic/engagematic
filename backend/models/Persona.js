import mongoose from "mongoose";

const personaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Persona name is required"],
      trim: true,
      maxlength: [50, "Persona name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Persona description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    tone: {
      type: String,
      required: [true, "Tone is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      maxlength: [100, "Industry cannot exceed 100 characters"],
    },
    experience: {
      type: String,
      required: [true, "Experience level is required"],
    },
    writingStyle: {
      type: String,
      required: [true, "Writing style is required"],
      maxlength: [300, "Writing style cannot exceed 300 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
personaSchema.index({ userId: 1, isActive: 1 });

const Persona = mongoose.model("Persona", personaSchema);

export default Persona;
