import LinkedInScraper from "./services/linkedinScraper.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testLinkedInScraper() {
  console.log("🧪 Testing LinkedIn Scraper...");

  const scraper = new LinkedInScraper();

  try {
    // Initialize scraper
    console.log("1. Initializing scraper...");
    const initialized = await scraper.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize scraper");
      return;
    }

    console.log("✅ Scraper initialized successfully");

    // Test with a sample LinkedIn profile URL
    const testProfileUrl = "https://www.linkedin.com/in/williamhgates";

    console.log("2. Testing profile scraping...");
    console.log(`   Profile URL: ${testProfileUrl}`);

    // Test basic scraping first
    const profileData = await scraper.scrapeProfile(testProfileUrl);

    console.log("✅ Profile data scraped successfully");
    console.log("📊 Scraped Data:");
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

    // Test AI analysis
    console.log("3. Testing AI analysis...");
    const analysis = await scraper.generateProfileAnalysis(profileData);

    console.log("✅ AI analysis generated successfully");
    console.log("🤖 Analysis Results:");
    console.log(`   Profile Strength: ${analysis.profileStrength || "N/A"}`);
    console.log(`   Analysis Type: ${typeof analysis}`);

    // Test persona context generation
    console.log("4. Testing persona context generation...");
    const personaContext = await scraper.generatePersonaContext(
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

    // Test full analysis
    console.log("5. Testing full analysis workflow...");
    const fullResult = await scraper.analyzeProfile(testProfileUrl);

    if (fullResult.success) {
      console.log("✅ Full analysis workflow completed successfully");
      console.log("📈 Final Results:");
      console.log(`   Success: ${fullResult.success}`);
      console.log(`   Profile Data Available: ${!!fullResult.profileData}`);
      console.log(`   Analysis Available: ${!!fullResult.analysis}`);
      console.log(
        `   Persona Context Available: ${!!fullResult.personaContext}`
      );
      console.log(`   Timestamp: ${fullResult.timestamp}`);
    } else {
      console.error("❌ Full analysis workflow failed:", fullResult.error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    console.log("6. Cleaning up...");
    await scraper.close();
    console.log("✅ Cleanup completed");
  }

  console.log("🏁 Test completed");
}

// Run the test
testLinkedInScraper().catch(console.error);
