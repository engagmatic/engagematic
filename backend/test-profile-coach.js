/**
 * Quick Test Script for LinkedInPulse Profile Coach
 * 
 * Run this script to test the new profile analyzer:
 * node backend/test-profile-coach.js
 */

import linkedinProfileCoach from "./services/linkedinProfileCoach.js";

// Test profiles
const testProfiles = [
  {
    name: "Student Profile",
    data: {
      userType: "Student",
      headline: "Computer Science Student at MIT",
      about: "Currently studying computer science with a focus on machine learning. Interested in software development and AI research.",
      roleIndustry: "Student | Computer Science",
      location: "Cambridge, MA",
      targetAudience: "Tech companies and recruiters",
      mainGoal: "get internships",
      additionalText: "",
    },
  },
  {
    name: "Early Professional Profile",
    data: {
      userType: "Early Professional",
      headline: "Software Engineer at Tech Corp",
      about: "I build scalable web applications using React and Node.js. Passionate about clean code and user experience. Led a team of 3 developers to ship a product that now serves 50K+ users.",
      roleIndustry: "Software Engineer | Technology",
      location: "San Francisco, CA",
      targetAudience: "Tech recruiters and hiring managers",
      mainGoal: "get interviews",
      additionalText: "",
    },
  },
  {
    name: "Senior Leader Profile",
    data: {
      userType: "Senior Leader / Thought Leader",
      headline: "CTO | Building High-Performance Engineering Teams",
      about: "20+ years of experience leading engineering teams at scale. Former VP Engineering at Fortune 500 companies. Passionate about building products that matter and developing the next generation of tech leaders.",
      roleIndustry: "CTO | Technology",
      location: "Silicon Valley, CA",
      targetAudience: "Tech executives and board members",
      mainGoal: "build credibility",
      additionalText: "",
    },
  },
  {
    name: "Minimal Profile (Testing Graceful Handling)",
    data: {
      userType: "Other",
      headline: "",
      about: "",
      roleIndustry: "",
      location: "",
      targetAudience: "",
      mainGoal: "build credibility",
      additionalText: "",
    },
  },
];

async function runTests() {
  console.log("🧪 Testing LinkedInPulse Profile Coach\n");
  console.log("=" .repeat(60));

  for (const test of testProfiles) {
    console.log(`\n📊 Test: ${test.name}`);
    console.log("-".repeat(60));

    try {
      const startTime = Date.now();
      const result = await linkedinProfileCoach.analyzeProfile(test.data);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (result.success) {
        console.log(`✅ Success (${duration}ms)`);
        console.log(`📈 Profile Score: ${result.data.profile_score}/100`);
        console.log(`\n💡 Summary Points:`);
        result.data.summary_points.forEach((point, i) => {
          console.log(`   ${i + 1}. ${point}`);
        });
        console.log(`\n📝 Headline Suggestions:`);
        result.data.headline_suggestions.forEach((headline, i) => {
          console.log(`   ${i + 1}. ${headline}`);
        });
        console.log(`\n🚀 Quick Wins:`);
        result.data.quick_wins.forEach((win, i) => {
          console.log(`   ${i + 1}. ${win}`);
        });
        console.log(`\n📱 Generated Post:`);
        console.log(`   ${result.data.generated_post_intro}`);
        console.log(`   ${result.data.generated_post}`);
        console.log(`\n   Post length: ${result.data.generated_post.split(' ').length} words`);
        if (result.tokensUsed) {
          console.log(`   Tokens used: ${result.tokensUsed}`);
        }
      } else {
        console.log(`⚠️  Completed with fallback (${duration}ms)`);
        console.log(`   Error: ${result.error}`);
        console.log(`📈 Profile Score: ${result.data.profile_score}/100`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.error(error.stack);
    }

    console.log("\n" + "=".repeat(60));
    
    // Wait a bit between tests to avoid rate limiting
    if (test !== testProfiles[testProfiles.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n✅ All tests completed!");
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test script failed:", error);
  process.exit(1);
});

