import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { config } from "../config/index.js";

class PDFExportService {
  /**
   * Generate a professional PDF report for LinkedIn Profile Analysis
   */
  async generateProfileAnalysisPDF(analysisData) {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: "LinkedIn Profile Analysis Report",
            Author: "Engagematic",
            Subject: "Professional Profile Optimization Report",
          },
        });

        // Create stream to collect PDF data
        const stream = new PassThrough();
        const chunks = [];

        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);

        doc.pipe(stream);

        // Extract data
        const { scores, recommendations, profileData, analyzedAt } =
          analysisData;
        const date = new Date(analyzedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // === PAGE 1: HEADER & OVERVIEW ===
        this.addHeader(doc, "LinkedIn Profile Analysis Report");
        this.addSubheader(doc, `Generated on ${date}`, 60);

        // Profile Info Box
        doc.moveDown(1);
        this.addSectionBox(doc, {
          title: "📊 Profile Overview",
          content: [
            `Name: ${profileData.fullName || "Not provided"}`,
            `Industry: ${profileData.industry || "Not specified"}`,
            `Location: ${profileData.location || "Not specified"}`,
            `Headline: ${profileData.headline || "Missing"}`,
          ],
        });

        // Overall Score - BIG AND BOLD
        doc.moveDown(1.5);
        this.addScoreCircle(doc, scores.overall, "Overall Profile Score");

        // Individual Scores
        doc.moveDown(1);
        doc
          .fontSize(14)
          .fillColor("#333")
          .text("Detailed Scores", { underline: true });
        doc.moveDown(0.5);

        const scoreItems = [
          { label: "Headline Quality", score: scores.headline },
          { label: "About Section", score: scores.about },
          { label: "Profile Completeness", score: scores.completeness },
          { label: "Keyword Optimization", score: scores.keywords },
          { label: "Engagement Potential", score: scores.engagement },
        ];

        scoreItems.forEach((item) => {
          this.addScoreBar(doc, item.label, item.score);
        });

        // === PAGE 2: RECOMMENDED HEADLINES ===
        doc.addPage();
        this.addHeader(doc, "Recommended Headlines");
        doc.moveDown(1);

        if (recommendations.headlines && recommendations.headlines.length > 0) {
          recommendations.headlines.forEach((headline, index) => {
            doc
              .fontSize(11)
              .fillColor("#0077B5")
              .text(`Option ${index + 1}:`, { continued: false });
            doc
              .fontSize(10)
              .fillColor("#333")
              .text(headline, { align: "left", indent: 20 });
            doc.moveDown(0.8);
          });
        } else {
          doc
            .fontSize(10)
            .fillColor("#666")
            .text("No headline suggestions available.");
        }

        // Suggested Skills
        doc.moveDown(1.5);
        this.addHeader(doc, "Top Skills to Add");
        doc.moveDown(0.5);

        if (recommendations.skills && recommendations.skills.length > 0) {
          const skillsText = recommendations.skills
            .map((skill, i) => `${i + 1}. ${skill}`)
            .join("\n");
          doc.fontSize(10).fillColor("#333").text(skillsText);
        } else {
          doc
            .fontSize(10)
            .fillColor("#666")
            .text("No skill recommendations available.");
        }

        // === PAGE 3: OPTIMIZED ABOUT SECTION ===
        doc.addPage();
        this.addHeader(doc, "Optimized About Section");
        doc.moveDown(1);

        if (recommendations.aboutSection) {
          doc
            .fontSize(10)
            .fillColor("#333")
            .text(recommendations.aboutSection, {
              align: "justify",
              lineGap: 4,
            });
        } else {
          doc
            .fontSize(10)
            .fillColor("#666")
            .text("No about section rewrite available.");
        }

        // === PAGE 4: ACTIONABLE IMPROVEMENTS ===
        doc.addPage();
        this.addHeader(doc, "Actionable Improvements");
        doc.moveDown(1);

        if (
          recommendations.improvements &&
          recommendations.improvements.length > 0
        ) {
          recommendations.improvements.forEach((improvement, index) => {
            // Priority badge
            const priorityColor =
              improvement.priority === "high" ||
              improvement.priority === "critical"
                ? "#DC2626"
                : improvement.priority === "medium"
                ? "#F59E0B"
                : "#10B981";

            doc
              .fontSize(12)
              .fillColor(priorityColor)
              .text(`${index + 1}. ${improvement.category.toUpperCase()}`, {
                continued: true,
              })
              .fontSize(9)
              .fillColor("#666")
              .text(` (${improvement.priority})`, { continued: false });

            doc.moveDown(0.3);

            doc
              .fontSize(10)
              .fillColor("#333")
              .text(improvement.suggestion, { indent: 15, align: "left" });

            if (improvement.expectedImpact) {
              doc.moveDown(0.2);
              doc
                .fontSize(9)
                .fillColor("#0077B5")
                .text(`💡 Expected Impact: ${improvement.expectedImpact}`, {
                  indent: 15,
                  italic: true,
                });
            }

            doc.moveDown(1);
          });
        } else {
          doc
            .fontSize(10)
            .fillColor("#666")
            .text("No improvement suggestions available.");
        }

        // === PAGE 5: INDUSTRY INSIGHTS ===
        doc.addPage();
        this.addHeader(doc, "Industry Insights & Trends");
        doc.moveDown(1);

        if (recommendations.industryInsights) {
          const insights = recommendations.industryInsights;

          // Trends
          if (insights.trends && insights.trends.length > 0) {
            doc
              .fontSize(12)
              .fillColor("#333")
              .text("🔥 Current Trends:", { underline: true });
            doc.moveDown(0.5);
            insights.trends.forEach((trend) => {
              doc
                .fontSize(10)
                .fillColor("#333")
                .text(`• ${trend}`, { indent: 15 });
              doc.moveDown(0.3);
            });
            doc.moveDown(1);
          }

          // Opportunities
          if (insights.opportunities) {
            doc
              .fontSize(12)
              .fillColor("#333")
              .text("🎯 Opportunities:", { underline: true });
            doc.moveDown(0.5);
            doc
              .fontSize(10)
              .fillColor("#333")
              .text(insights.opportunities, { align: "justify" });
            doc.moveDown(1);
          }

          // Competitive Edge
          if (insights.competitiveEdge) {
            doc
              .fontSize(12)
              .fillColor("#333")
              .text("🚀 Competitive Edge:", { underline: true });
            doc.moveDown(0.5);
            doc
              .fontSize(10)
              .fillColor("#333")
              .text(insights.competitiveEdge, { align: "justify" });
          }
        }

        // === FOOTER ON LAST PAGE ===
        doc.moveDown(2);
        this.addFooter(doc);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header to page
   */
  addHeader(doc, title) {
    doc
      .fontSize(20)
      .fillColor("#0077B5")
      .text(title, { align: "center", bold: true });
  }

  /**
   * Add subheader
   */
  addSubheader(doc, text, yPosition) {
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(text, 50, yPosition, { align: "center" });
  }

  /**
   * Add section box with border
   */
  addSectionBox(doc, { title, content }) {
    const startY = doc.y;
    const boxPadding = 10;

    // Draw box
    doc
      .rect(50, startY, doc.page.width - 100, 80)
      .strokeColor("#0077B5")
      .stroke();

    // Add title
    doc
      .fontSize(12)
      .fillColor("#0077B5")
      .text(title, 60, startY + boxPadding, { bold: true });

    // Add content
    doc.moveDown(0.5);
    content.forEach((line) => {
      doc.fontSize(9).fillColor("#333").text(line, { indent: 10 });
    });

    doc.moveDown(2);
  }

  /**
   * Add large score circle
   */
  addScoreCircle(doc, score, label) {
    const centerX = doc.page.width / 2;
    const centerY = doc.y + 50;
    const radius = 40;

    // Determine color based on score
    const scoreColor =
      score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#DC2626";

    // Draw circle
    doc
      .circle(centerX, centerY, radius)
      .strokeColor(scoreColor)
      .lineWidth(5)
      .stroke();

    // Draw score
    doc
      .fontSize(28)
      .fillColor(scoreColor)
      .text(`${score}`, centerX - 25, centerY - 15, {
        width: 50,
        align: "center",
      });

    // Draw label
    doc
      .fontSize(12)
      .fillColor("#333")
      .text(label, 50, centerY + radius + 15, {
        width: doc.page.width - 100,
        align: "center",
      });

    doc.moveDown(4);
  }

  /**
   * Add score bar
   */
  addScoreBar(doc, label, score) {
    const barWidth = 200;
    const barHeight = 15;
    const startX = 200;
    const startY = doc.y;

    // Label
    doc.fontSize(10).fillColor("#333").text(label, 50, startY);

    // Background bar
    doc.rect(startX, startY, barWidth, barHeight).fillColor("#E5E7EB").fill();

    // Filled bar (based on score out of 10)
    const fillWidth = (score / 10) * barWidth;
    const fillColor =
      score >= 7 ? "#10B981" : score >= 4 ? "#F59E0B" : "#DC2626";

    doc.rect(startX, startY, fillWidth, barHeight).fillColor(fillColor).fill();

    // Score text
    doc
      .fontSize(10)
      .fillColor("#333")
      .text(`${score}/10`, startX + barWidth + 10, startY);

    doc.moveDown(0.8);
  }

  /**
   * Add footer
   */
  addFooter(doc) {
    doc
      .fontSize(9)
      .fillColor("#999")
      .text(
        "Generated by Engagematic - Your AI-Powered LinkedIn Growth Partner",
        {
          align: "center",
        }
      );
    doc
      .fontSize(8)
      .fillColor("#BBB")
      .text(config.FRONTEND_URL.replace(/^https?:\/\//, ''), {
        align: "center",
        link: config.FRONTEND_URL,
      });
  }
}

export default new PDFExportService();
