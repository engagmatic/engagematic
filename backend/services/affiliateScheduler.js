import cron from "node-cron";
import referralService from "./referralService.js";

/**
 * Scheduled job to process monthly affiliate commissions
 * Runs on the 1st of every month at 2 AM
 */
class AffiliateScheduler {
  constructor() {
    this.job = null;
  }

  start() {
    // Run monthly on the 1st at 2:00 AM
    // Cron: "0 2 1 * *" means: minute=0, hour=2, day=1, month=*, weekday=*
    this.job = cron.schedule("0 2 1 * *", async () => {
      console.log("🔄 Starting monthly affiliate commission processing...");
      try {
        const result = await referralService.processMonthlyCommissions();
        if (result.success) {
          console.log(
            `✅ Monthly commission processing complete: ${result.processed} processed, ${result.errors} errors`
          );
        } else {
          console.error("❌ Monthly commission processing failed:", result.error);
        }
      } catch (error) {
        console.error("❌ Error in monthly commission scheduler:", error);
      }
    });

    // Also run daily at 2 AM to check for any missed commissions (safety check)
    cron.schedule("0 2 * * *", async () => {
      console.log("🔄 Running daily affiliate commission check...");
      try {
        const result = await referralService.processMonthlyCommissions();
        if (result.success && result.processed > 0) {
          console.log(
            `✅ Daily check found ${result.processed} commissions to process`
          );
        }
      } catch (error) {
        console.error("❌ Error in daily commission check:", error);
      }
    });

    console.log("✅ Affiliate commission scheduler started");
    console.log("   - Monthly processing: 1st of every month at 2:00 AM");
    console.log("   - Daily safety check: Every day at 2:00 AM");
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log("⏹️ Affiliate commission scheduler stopped");
    }
  }

  // Manual trigger for testing
  async processCommissionsNow() {
    console.log("🔄 Manually triggering commission processing...");
    return await referralService.processMonthlyCommissions();
  }
}

const affiliateScheduler = new AffiliateScheduler();
export default affiliateScheduler;

