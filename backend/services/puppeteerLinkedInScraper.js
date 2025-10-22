import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Use stealth plugin to avoid LinkedIn detection
puppeteer.use(StealthPlugin());

class PuppeteerLinkedInScraper {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  /**
   * Initialize browser (reuse for multiple scrapes)
   */
  async initBrowser() {
    if (this.browser && this.isInitialized) {
      return this.browser;
    }

    console.log("🚀 Launching headless browser...");
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
    this.isInitialized = true;
    console.log("✅ Browser launched successfully");
    return this.browser;
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log("🔒 Browser closed");
    }
  }

  /**
   * Extract LinkedIn profile data using Puppeteer
   */
  async scrapeProfile(linkedinUrl) {
    let page = null;

    try {
      console.log("🔍 Starting Puppeteer scraping for:", linkedinUrl);

      // Validate URL
      if (!this.isValidLinkedInUrl(linkedinUrl)) {
        throw new Error("Invalid LinkedIn profile URL");
      }

      // Initialize browser
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Set realistic viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );

      // Set extra headers
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      });

      console.log("📡 Navigating to LinkedIn profile...");

      // Navigate to profile with timeout
      await page.goto(linkedinUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait a bit for dynamic content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("📊 Extracting profile data...");

      // Extract profile data
      const profileData = await page.evaluate(() => {
        const data = {
          fullName: "",
          headline: "",
          location: "",
          about: "",
          experience: [],
          education: [],
          skills: [],
          industry: "",
        };

        try {
          // Extract name (multiple selectors for different layouts)
          const nameSelectors = [
            "h1.text-heading-xlarge",
            "h1.top-card-layout__title",
            ".pv-text-details__left-panel h1",
            ".ph5 h1",
          ];
          for (const selector of nameSelectors) {
            const nameEl = document.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              data.fullName = nameEl.textContent.trim();
              break;
            }
          }

          // Extract headline
          const headlineSelectors = [
            "div.text-body-medium",
            ".top-card-layout__headline",
            ".pv-text-details__left-panel .text-body-medium",
            ".ph5 .text-body-medium",
          ];
          for (const selector of headlineSelectors) {
            const headlineEl = document.querySelector(selector);
            if (headlineEl && headlineEl.textContent.trim()) {
              data.headline = headlineEl.textContent.trim();
              break;
            }
          }

          // Extract location
          const locationSelectors = [
            "span.text-body-small.inline.t-black--light.break-words",
            ".top-card__subline-item",
            ".pv-text-details__left-panel .text-body-small",
          ];
          for (const selector of locationSelectors) {
            const locationEl = document.querySelector(selector);
            if (locationEl && locationEl.textContent.includes(",")) {
              data.location = locationEl.textContent.trim();
              break;
            }
          }

          // Extract about section
          const aboutSelectors = [
            "#about ~ .pvs-list__outer-container .visually-hidden + span",
            ".pv-about-section p",
            ".core-section-container__content p",
            'section[data-section="summary"] p',
          ];
          for (const selector of aboutSelectors) {
            const aboutEl = document.querySelector(selector);
            if (aboutEl && aboutEl.textContent.trim().length > 50) {
              data.about = aboutEl.textContent.trim();
              break;
            }
          }

          // Extract experience
          const experienceSection = document.querySelector("#experience");
          if (experienceSection) {
            const expItems =
              experienceSection
                .closest("section")
                ?.querySelectorAll(".pvs-list__paged-list-item") || [];
            expItems.forEach((item, index) => {
              if (index < 3) {
                // Limit to 3 recent positions
                const title =
                  item.querySelector(".t-bold span")?.textContent?.trim() || "";
                const company =
                  item.querySelector(".t-14 span")?.textContent?.trim() || "";
                if (title) {
                  data.experience.push({ title, company });
                }
              }
            });
          }

          // Extract education
          const educationSection = document.querySelector("#education");
          if (educationSection) {
            const eduItems =
              educationSection
                .closest("section")
                ?.querySelectorAll(".pvs-list__paged-list-item") || [];
            eduItems.forEach((item, index) => {
              if (index < 2) {
                // Limit to 2 recent education entries
                const school =
                  item.querySelector(".t-bold span")?.textContent?.trim() || "";
                const degree =
                  item.querySelector(".t-14 span")?.textContent?.trim() || "";
                if (school) {
                  data.education.push({ school, degree });
                }
              }
            });
          }

          // Extract skills
          const skillsSection = document.querySelector("#skills");
          if (skillsSection) {
            const skillItems =
              skillsSection
                .closest("section")
                ?.querySelectorAll(".pvs-list__paged-list-item") || [];
            skillItems.forEach((item, index) => {
              if (index < 10) {
                // Limit to 10 skills
                const skill =
                  item.querySelector(".t-bold span")?.textContent?.trim() || "";
                if (skill) {
                  data.skills.push(skill);
                }
              }
            });
          }

          // Infer industry from headline/experience
          const headlineText = data.headline.toLowerCase();
          if (
            headlineText.includes("engineer") ||
            headlineText.includes("developer")
          ) {
            data.industry = "Technology";
          } else if (headlineText.includes("market")) {
            data.industry = "Marketing";
          } else if (headlineText.includes("design")) {
            data.industry = "Design";
          } else if (headlineText.includes("sales")) {
            data.industry = "Sales";
          } else if (
            headlineText.includes("data") ||
            headlineText.includes("analyst")
          ) {
            data.industry = "Data & Analytics";
          } else {
            data.industry = "Professional Services";
          }
        } catch (error) {
          console.error("Error extracting profile data:", error);
        }

        return data;
      });

      await page.close();

      console.log("✅ Profile data extracted successfully:", {
        name: profileData.fullName,
        headline: profileData.headline?.substring(0, 50) + "...",
        hasAbout: !!profileData.about,
        experienceCount: profileData.experience.length,
        skillsCount: profileData.skills.length,
      });

      // Validate extracted data
      if (!profileData.fullName && !profileData.headline) {
        console.warn("⚠️ Limited data extracted - might be a private profile");
        return {
          success: false,
          error:
            "Could not extract profile data. Profile might be private or require login.",
          method: "puppeteer",
        };
      }

      return {
        success: true,
        data: profileData,
        method: "puppeteer",
      };
    } catch (error) {
      console.error("❌ Puppeteer scraping failed:", error.message);

      if (page) {
        await page.close();
      }

      return {
        success: false,
        error: error.message,
        method: "puppeteer",
      };
    }
  }

  /**
   * Validate LinkedIn URL
   */
  isValidLinkedInUrl(url) {
    if (!url) return false;
    const linkedinPattern =
      /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinPattern.test(url.trim());
  }
}

// Singleton instance
const puppeteerScraper = new PuppeteerLinkedInScraper();

// Cleanup on process exit
process.on("exit", async () => {
  await puppeteerScraper.closeBrowser();
});

process.on("SIGINT", async () => {
  await puppeteerScraper.closeBrowser();
  process.exit(0);
});

export default puppeteerScraper;
