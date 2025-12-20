/**
 * Test script for Profile Analyzer
 * Tests the profile analyzer with a LinkedIn profile URL
 * 
 * Usage: node test-profile-analyzer.js
 */

import profileAnalyzer from "./services/profileAnalyzer.js";
import dotenv from "dotenv";

dotenv.config();

async function testProfileAnalyzer() {
  console.log("🧪 Testing Profile Analyzer...\n");
  
  const testUrl = "https://www.linkedin.com/in/riteshagar/";
  console.log(`📋 Test URL: ${testUrl}\n`);
  
  try {
    console.log("🔍 Starting profile analysis...\n");
    
    // Extract username
    const username = profileAnalyzer.extractUsernameFromUrl(testUrl);
    if (!username) {
      console.error("❌ Failed to extract username from URL");
      process.exit(1);
    }
    
    // Test fetching profile data (without DB save)
    console.log("📡 Step 1: Fetching profile data from SerpApi...\n");
    const profileDataResult = await profileAnalyzer.fetchProfileFromSerpApi(username);
    
    if (!profileDataResult.success) {
      console.error("❌ Failed to fetch profile:", profileDataResult.message);
      process.exit(1);
    }
    
    const profileData = profileDataResult.data;
    console.log("✅ Profile data fetched successfully!\n");
    
    // Calculate scores
    console.log("📊 Step 2: Calculating scores...\n");
    const scores = profileAnalyzer.calculateScores(profileData);
    
    // Generate recommendations
    console.log("🤖 Step 3: Generating AI recommendations...\n");
    const recommendations = await profileAnalyzer.generateRecommendations(profileData, scores);
    
    // Build result object (without DB save)
    const result = {
      success: true,
      data: {
        scores,
        recommendations,
        profileData: {
          fullName: profileData.name || "",
          headline: profileData.headline || "",
          about: profileData.summary || "",
          location: profileData.location || "",
          industry: profileData.industry || "",
          experience: profileData.experience || [],
          education: profileData.education || [],
          skills: profileData.skills || [],
        },
      },
    };
    
    if (result.success) {
      console.log("✅ SUCCESS! Profile analysis completed.\n");
      console.log("=".repeat(80));
      console.log("📊 ANALYSIS REPORT");
      console.log("=".repeat(80));
      
      const { data } = result;
      
      // Profile Data
      console.log("\n👤 PROFILE DATA:");
      console.log(`   Name: ${data.profileData?.fullName || data.profileData?.name || "N/A"}`);
      console.log(`   Headline: ${data.profileData?.headline || "N/A"}`);
      console.log(`   Location: ${data.profileData?.location || "N/A"}`);
      console.log(`   Industry: ${data.profileData?.industry || "N/A"}`);
      console.log(`   About Length: ${data.profileData?.about?.length || 0} characters`);
      console.log(`   Experience Items: ${data.profileData?.experience?.length || 0}`);
      console.log(`   Education Items: ${data.profileData?.education?.length || 0}`);
      console.log(`   Skills: ${data.profileData?.skills?.length || 0}`);
      
      // Scores
      if (data.scores) {
        console.log("\n📈 SCORES:");
        console.log(`   Overall Score: ${data.scores.overall}/100`);
        console.log(`   Headline: ${data.scores.headline}/10`);
        console.log(`   About: ${data.scores.about}/10`);
        console.log(`   Completeness: ${data.scores.completeness}/10`);
        console.log(`   Keywords: ${data.scores.keywords}/10`);
        console.log(`   Engagement: ${data.scores.engagement}/10`);
      }
      
      // Recommendations
      if (data.recommendations) {
        const recs = data.recommendations;
        
        if (recs.headlines && recs.headlines.length > 0) {
          console.log("\n💡 RECOMMENDED HEADLINES:");
          recs.headlines.forEach((headline, index) => {
            console.log(`   ${index + 1}. ${headline}`);
          });
        }
        
        if (recs.aboutSection) {
          console.log("\n📝 RECOMMENDED ABOUT SECTION:");
          console.log(`   ${recs.aboutSection.substring(0, 200)}...`);
        }
        
        if (recs.skills && recs.skills.length > 0) {
          console.log("\n🎯 RECOMMENDED SKILLS:");
          console.log(`   ${recs.skills.slice(0, 10).join(", ")}`);
        }
        
        if (recs.keywords && recs.keywords.length > 0) {
          console.log("\n🔑 RECOMMENDED KEYWORDS:");
          console.log(`   ${recs.keywords.slice(0, 10).join(", ")}`);
        }
        
        if (recs.improvements && recs.improvements.length > 0) {
          console.log("\n✨ IMPROVEMENTS:");
          recs.improvements.forEach((improvement, index) => {
            if (typeof improvement === 'object' && improvement.suggestion) {
              console.log(`   ${index + 1}. [${improvement.priority || 'medium'}] ${improvement.suggestion}`);
              if (improvement.expectedImpact) {
                console.log(`      Expected Impact: ${improvement.expectedImpact}`);
              }
            } else {
              console.log(`   ${index + 1}. ${improvement}`);
            }
          });
        }
        
        if (recs.industryInsights) {
          console.log("\n🌍 INDUSTRY INSIGHTS:");
          if (recs.industryInsights.trends) {
            console.log("   Trends:");
            recs.industryInsights.trends.forEach((trend, index) => {
              console.log(`   ${index + 1}. ${trend}`);
            });
          }
          if (recs.industryInsights.opportunities) {
            console.log(`\n   Opportunities: ${recs.industryInsights.opportunities}`);
          }
          if (recs.industryInsights.competitiveEdge) {
            console.log(`\n   Competitive Edge: ${recs.industryInsights.competitiveEdge}`);
          }
        }
      }
      
      console.log("\n" + "=".repeat(80));
      console.log("✅ Test completed successfully!");
      console.log("=".repeat(80));
    } else {
      console.log("❌ FAILED! Profile analysis returned an error.\n");
      console.log("Error:", result.message || result.error || "Unknown error");
      console.log("\n" + "=".repeat(80));
      console.log("❌ Test failed!");
      console.log("=".repeat(80));
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("\nStack trace:", error.stack);
    console.log("\n" + "=".repeat(80));
    console.log("❌ Test failed with exception!");
    console.log("=".repeat(80));
    process.exit(1);
  }
}

// Run the test
testProfileAnalyzer();

