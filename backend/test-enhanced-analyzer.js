import LinkedInProfileAnalyzer from "./services/linkedinProfileAnalyzer.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testLinkedInProfileAnalyzer() {
  console.log("🧪 Testing Enhanced LinkedIn Profile Analyzer...");

  const analyzer = new LinkedInProfileAnalyzer();

  try {
    // Initialize analyzer
    console.log("1. Initializing analyzer...");
    const initialized = await analyzer.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize analyzer");
      return;
    }

    console.log("✅ Analyzer initialized successfully");

    // Test with a sample LinkedIn profile URL
    const testProfileUrl = "https://www.linkedin.com/in/williamhgates";

    console.log("2. Testing comprehensive profile scanning...");
    console.log(`   Profile URL: ${testProfileUrl}`);

    // Test comprehensive scanning
    const profileData = await analyzer.scanProfile(testProfileUrl);

    console.log("✅ Profile data scanned successfully");
    console.log("📊 Scanned Data:");
    console.log(`   Name: ${profileData.name}`);
    console.log(`   Headline: ${profileData.headline}`);
    console.log(`   Location: ${profileData.location}`);
    console.log(
      `   About: ${
        profileData.about ? profileData.about.substring(0, 100) + "..." : "N/A"
      }`
    );
    console.log(`   Experience Count: ${profileData.experience?.length || 0}`);
    console.log(`   Education Count: ${profileData.education?.length || 0}`);
    console.log(`   Skills Count: ${profileData.skills?.length || 0}`);
    console.log(
      `   Profile Completeness: ${
        profileData.profileCompleteness?.completenessScore || 0
      }%`
    );

    // Test comprehensive AI analysis
    console.log("3. Testing comprehensive AI analysis...");
    const analysis = await analyzer.generateComprehensiveAnalysis(profileData);

    console.log("✅ Comprehensive AI analysis generated successfully");
    console.log("🤖 Analysis Results:");
    console.log(`   Profile Strength: ${analysis.profileStrength || "N/A"}`);
    console.log(`   Analysis Type: ${analysis.analysisType || "N/A"}`);
    console.log(`   Generated At: ${analysis.generatedAt || "N/A"}`);

    // Test persona context generation
    console.log("4. Testing persona context generation...");
    const personaContext = await analyzer.generatePersonaContext(
      profileData,
      analysis
    );

    console.log("✅ Persona context generated successfully");
    console.log("🎭 Persona Context:");
    console.log(
      `   Professional Identity: ${
        personaContext.professionalIdentity || "N/A"
      }`
    );
    console.log(`   Industry: ${personaContext.industry || "N/A"}`);
    console.log(`   Generated At: ${personaContext.generatedAt || "N/A"}`);

    // Test full analysis workflow
    console.log("5. Testing full analysis workflow...");
    const fullResult = await analyzer.analyzeProfile(testProfileUrl);

    if (fullResult.success) {
      console.log("✅ Full analysis workflow completed successfully");
      console.log("📈 Final Results:");
      console.log(`   Success: ${fullResult.success}`);
      console.log(`   Profile Data Available: ${!!fullResult.profileData}`);
      console.log(`   Analysis Available: ${!!fullResult.analysis}`);
      console.log(
        `   Persona Context Available: ${!!fullResult.personaContext}`
      );
      console.log(`   Analysis Type: ${fullResult.analysisType || "N/A"}`);
      console.log(`   Timestamp: ${fullResult.timestamp}`);

      // Display key metrics
      if (fullResult.profileData) {
        console.log("\n📊 Profile Metrics:");
        console.log(
          `   Profile Completeness: ${
            fullResult.profileData.profileCompleteness?.completenessScore || 0
          }%`
        );
        console.log(
          `   Has Profile Image: ${fullResult.profileData.profileCompleteness?.hasProfileImage}`
        );
        console.log(
          `   Has About Section: ${fullResult.profileData.profileCompleteness?.hasAbout}`
        );
        console.log(
          `   Has Experience: ${fullResult.profileData.profileCompleteness?.hasExperience}`
        );
        console.log(
          `   Has Skills: ${fullResult.profileData.profileCompleteness?.hasSkills}`
        );
      }

      if (fullResult.analysis) {
        console.log("\n🎯 Analysis Insights:");
        console.log(
          `   Profile Strength Score: ${
            fullResult.analysis.profileStrength || "N/A"
          }/100`
        );
        console.log(
          `   Analysis Type: ${fullResult.analysis.analysisType || "N/A"}`
        );
      }
    } else {
      console.error("❌ Full analysis workflow failed:", fullResult.error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    console.log("6. Cleaning up...");
    await analyzer.close();
    console.log("✅ Cleanup completed");
  }

  console.log("🏁 Enhanced LinkedIn Profile Analyzer test completed");
}

// Run the test
testLinkedInProfileAnalyzer().catch(console.error);
