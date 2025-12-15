/**
 * PDF Export Service for LinkedIn Profile Analysis Reports
 * Creates beautiful, world-class PDF reports
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a beautiful PDF report from analysis data
 * @param {Object} analysisData - Analysis result data
 * @param {Object} profileData - Profile data (name, headline, etc.)
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateAnalysisPDF(analysisData, profileData = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: "LinkedIn Profile Analysis Report",
          Author: "LinkedInPulse",
          Subject: "Profile Optimization Report",
        },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Colors
      const primaryColor = "#6366f1"; // Indigo
      const secondaryColor = "#8b5cf6"; // Purple
      const textColor = "#1f2937"; // Dark gray
      const lightGray = "#f3f4f6";
      const borderColor = "#e5e7eb";

      // Header
      doc
        .fillColor(primaryColor)
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("LinkedIn Profile Analysis", 50, 50, { align: "center" });

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font("Helvetica")
        .text("World-Class Profile Optimization Report", 50, 85, { align: "center" });

      // Profile Information Section
      let yPos = 130;
      doc
        .fillColor(primaryColor)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Profile Overview", 50, yPos);

      yPos += 30;
      doc
        .fillColor(textColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Name:", 50, yPos);
      doc
        .font("Helvetica")
        .text(profileData.name || "Not provided", 120, yPos);

      yPos += 20;
      doc
        .font("Helvetica-Bold")
        .text("Headline:", 50, yPos);
      doc
        .font("Helvetica")
        .text(profileData.headline || "Not provided", 120, yPos, {
          width: 450,
          ellipsis: true,
        });

      // Overall Score
      yPos += 40;
      const score = analysisData.score || 0;
      const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
      
      doc
        .fillColor(scoreColor)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(`Overall Score: ${score}/100`, 50, yPos, { align: "center" });

      // Score Breakdown
      yPos += 50;
      doc
        .fillColor(primaryColor)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Score Breakdown", 50, yPos);

      yPos += 25;
      const sections = [
        { name: "Headline", score: analysisData.headline_feedback?.score || 0 },
        { name: "About Section", score: analysisData.about_feedback?.score || 0 },
        { name: "Experience", score: analysisData.experience_feedback?.score || 0 },
        { name: "Education", score: analysisData.education_feedback?.score || 0 },
        { name: "Skills", score: analysisData.skills_feedback?.score || 0 },
        { name: "Persona Alignment", score: analysisData.persona_alignment?.score || 0 },
      ];

      sections.forEach((section) => {
        const barWidth = 400;
        const barHeight = 20;
        const fillWidth = (section.score / 100) * barWidth;
        const sectionColor = section.score >= 80 ? "#10b981" : section.score >= 60 ? "#f59e0b" : "#ef4444";

        // Background bar
        doc
          .fillColor(lightGray)
          .rect(50, yPos, barWidth, barHeight)
          .fill();

        // Filled bar
        doc
          .fillColor(sectionColor)
          .rect(50, yPos, fillWidth, barHeight)
          .fill();

        // Text
        doc
          .fillColor(textColor)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(section.name, 55, yPos + 4);
        doc
          .font("Helvetica")
          .text(`${section.score}/100`, 460, yPos + 4, { align: "right" });

        yPos += 30;
      });

      // Headline Feedback
      if (analysisData.headline_feedback) {
        yPos += 20;
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Headline Analysis", 50, yPos);

        yPos += 25;
        doc
          .fillColor(textColor)
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Current Headline:", 50, yPos);
        yPos += 18;
        doc
          .font("Helvetica")
          .text(profileData.headline || "Not provided", 50, yPos, {
            width: 500,
            ellipsis: true,
          });

        yPos += 25;
        doc
          .font("Helvetica-Bold")
          .text("Optimized Headline:", 50, yPos);
        yPos += 18;
        doc
          .fillColor(secondaryColor)
          .font("Helvetica")
          .text(analysisData.headline_feedback.rewritten_example || "Not available", 50, yPos, {
            width: 500,
          });

        if (analysisData.headline_feedback.strengths?.length > 0) {
          yPos += 30;
          doc
            .fillColor(textColor)
            .font("Helvetica-Bold")
            .text("Strengths:", 50, yPos);
          yPos += 18;
          analysisData.headline_feedback.strengths.forEach((strength) => {
            doc
              .font("Helvetica")
              .text(`• ${strength}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }

        if (analysisData.headline_feedback.improvements?.length > 0) {
          yPos += 15;
          doc
            .font("Helvetica-Bold")
            .text("Improvements:", 50, yPos);
          yPos += 18;
          analysisData.headline_feedback.improvements.forEach((improvement) => {
            doc
              .font("Helvetica")
              .text(`• ${improvement}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }
      }

      // About Section Feedback
      if (analysisData.about_feedback) {
        yPos += 30;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("About Section Analysis", 50, yPos);

        yPos += 25;
        doc
          .fillColor(textColor)
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Optimized About Section:", 50, yPos);
        yPos += 18;
        doc
          .font("Helvetica")
          .text(analysisData.about_feedback.optimized_about || "Not available", 50, yPos, {
            width: 500,
            align: "justify",
          });

        // Calculate how much space the about section takes
        const aboutText = analysisData.about_feedback.optimized_about || "";
        const estimatedLines = Math.ceil(aboutText.length / 80);
        yPos += estimatedLines * 15;

        if (analysisData.about_feedback.strengths?.length > 0) {
          yPos += 20;
          doc
            .font("Helvetica-Bold")
            .text("Strengths:", 50, yPos);
          yPos += 18;
          analysisData.about_feedback.strengths.forEach((strength) => {
            doc
              .font("Helvetica")
              .text(`• ${strength}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }

        if (analysisData.about_feedback.improvements?.length > 0) {
          yPos += 15;
          doc
            .font("Helvetica-Bold")
            .text("Improvements:", 50, yPos);
          yPos += 18;
          analysisData.about_feedback.improvements.forEach((improvement) => {
            doc
              .font("Helvetica")
              .text(`• ${improvement}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }
      }

      // Experience Feedback
      if (analysisData.experience_feedback) {
        yPos += 30;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Experience Section", 50, yPos);

        yPos += 25;
        if (analysisData.experience_feedback.content_strategy) {
          doc
            .fillColor(secondaryColor)
            .fontSize(11)
            .font("Helvetica-Bold")
            .text("Content Strategy Tip:", 50, yPos);
          yPos += 18;
          doc
            .fillColor(textColor)
            .font("Helvetica")
            .text(analysisData.experience_feedback.content_strategy, 50, yPos, {
              width: 500,
            });
          yPos += 30;
        }

        if (analysisData.experience_feedback.strengths?.length > 0) {
          doc
            .font("Helvetica-Bold")
            .text("Strengths:", 50, yPos);
          yPos += 18;
          analysisData.experience_feedback.strengths.forEach((strength) => {
            doc
              .font("Helvetica")
              .text(`• ${strength}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }

        if (analysisData.experience_feedback.improvements?.length > 0) {
          yPos += 15;
          doc
            .font("Helvetica-Bold")
            .text("Improvements:", 50, yPos);
          yPos += 18;
          analysisData.experience_feedback.improvements.forEach((improvement) => {
            doc
              .font("Helvetica")
              .text(`• ${improvement}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }
      }

      // Education & Skills
      yPos += 30;
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      if (analysisData.education_feedback) {
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Education Section", 50, yPos);
        yPos += 25;
        if (analysisData.education_feedback.improvements?.length > 0) {
          doc
            .fillColor(textColor)
            .fontSize(11)
            .font("Helvetica-Bold")
            .text("Recommendations:", 50, yPos);
          yPos += 18;
          analysisData.education_feedback.improvements.forEach((improvement) => {
            doc
              .font("Helvetica")
              .text(`• ${improvement}`, 60, yPos, { width: 480 });
            yPos += 18;
          });
        }
        yPos += 20;
      }

      if (analysisData.skills_feedback?.optimized_skills_list?.length > 0) {
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Optimized Skills List", 50, yPos);
        yPos += 25;
        doc
          .fillColor(textColor)
          .fontSize(11)
          .font("Helvetica")
          .text(analysisData.skills_feedback.optimized_skills_list.join(" • "), 50, yPos, {
            width: 500,
          });
        yPos += 30;
      }

      // Top Priorities
      if (analysisData.top_3_priorities?.length > 0) {
        yPos += 20;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Top 3 Priorities", 50, yPos);
        yPos += 25;
        analysisData.top_3_priorities.forEach((priority, index) => {
          doc
            .fillColor(secondaryColor)
            .fontSize(14)
            .font("Helvetica-Bold")
            .text(`${index + 1}.`, 50, yPos);
          doc
            .fillColor(textColor)
            .font("Helvetica")
            .text(priority, 80, yPos, { width: 470 });
          yPos += 25;
        });
      }

      // Keywords
      if (analysisData.keywords?.length > 0) {
        yPos += 20;
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Recommended Keywords", 50, yPos);
        yPos += 25;
        doc
          .fillColor(textColor)
          .fontSize(11)
          .font("Helvetica")
          .text(analysisData.keywords.join(" • "), 50, yPos, {
            width: 500,
          });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fillColor("#9ca3af")
          .fontSize(8)
          .font("Helvetica")
          .text(
            `LinkedInPulse Profile Analysis Report | Page ${i + 1} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`,
            50,
            doc.page.height - 30,
            { align: "center" }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
