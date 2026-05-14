require("dotenv").config();

const LinkedInAutomationService = require("./linkedin/LinkedInAutomationService");

(async () => {
  const linkedin = new LinkedInAutomationService();

  try {
    console.log("Initializing browser...");

    await linkedin.initializeBrowser();

    console.log("Logging into LinkedIn...");

    await linkedin.loginToLinkedIn(
      process.env.LINKEDIN_EMAIL,
      process.env.LINKEDIN_PASSWORD
    );

    console.log("LinkedIn login successful!");

  } catch (error) {
    console.error("Automation failed:", error);
  }
})();