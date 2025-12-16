import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, "..", "templates", "emails");

// Remove excessive emojis and fix URLs
const emojiPatterns = [
  /💳\s*/g,
  /⚠️\s*/g,
  /⏰\s*/g,
  /✅\s*/g,
  /🚀\s*/g,
  /🎉\s*/g,
  /🎁\s*/g,
  /💡\s*/g,
  /📊\s*/g,
  /🔄\s*/g,
  /🚨\s*/g,
  /🎯\s*/g,
  /✨\s*/g,
  /📧\s*/g,
  /💬\s*/g,
  /🎊\s*/g,
];

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith(".ejs"));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  
  // Remove excessive emojis from headers and content
  emojiPatterns.forEach(pattern => {
    content = content.replace(pattern, "");
  });
  
  // Fix URLs - replace process.env.FRONTEND_URL with just the variable
  content = content.replace(
    /process\.env\.FRONTEND_URL\s*\|\|\s*['"]http:\/\/localhost:\d+['"]/g,
    ""
  );
  content = content.replace(
    /\(process\.env\.FRONTEND_URL\s*\|\|\s*['"]http:\/\/localhost:\d+['"]\)\s*\+\s*['"]/g,
    ""
  );
  
  // Clean up any remaining localhost references
  content = content.replace(/http:\/\/localhost:\d+/g, "");
  
  // Make "Hey" more professional
  content = content.replace(/Hey\s+/g, "Hi ");
  
  // Remove excessive exclamation marks
  content = content.replace(/!!+/g, "!");
  
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated: ${file}`);
});

console.log("All templates updated!");

