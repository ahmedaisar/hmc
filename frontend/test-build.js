// Simple test to validate CSS compilation
const fs = require('fs');
const path = require('path');

// Read the CSS file
const cssPath = path.join(__dirname, 'app', 'globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Check for problematic patterns
const problematicPatterns = [
  /border-border/g,
  /ring-ring(?!\s*;)/g,
  /ring-offset-background/g,
  /border-input(?!\s*;)/g,
  /text-muted-foreground(?!\s*;)/g,
  /bg-card(?!\s*;)/g,
  /text-card-foreground(?!\s*;)/g,
];

let hasIssues = false;

problematicPatterns.forEach((pattern, index) => {
  const matches = cssContent.match(pattern);
  if (matches) {
    console.log(`Found problematic pattern ${index + 1}:`, matches);
    hasIssues = true;
  }
});

if (!hasIssues) {
  console.log('✅ CSS file looks good - no problematic @apply patterns found');
} else {
  console.log('❌ CSS file still has issues');
  process.exit(1);
}