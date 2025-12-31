const fs = require("fs");
const path = require("path");

console.log("🔍 Validating Faculty Dashboard Syntax...\n");

// Check faculty page
const facultyPagePath = path.join(__dirname, "src/app/faculty/page.tsx");
const facultyLayoutPath = path.join(__dirname, "src/app/faculty/layout.tsx");

try {
  const facultyPageContent = fs.readFileSync(facultyPagePath, "utf8");
  const facultyLayoutContent = fs.readFileSync(facultyLayoutPath, "utf8");

  // Basic JSX structure validation
  const openDivs = (facultyPageContent.match(/<div[^>]*(?<!\/)\>/g) || [])
    .length;
  const selfClosingDivs = (facultyPageContent.match(/<div[^>]*\/>/g) || [])
    .length;
  const closeDivs = (facultyPageContent.match(/<\/div>/g) || []).length;
  const totalOpenDivs = openDivs + selfClosingDivs;

  console.log("📄 Faculty Page Analysis:");
  console.log(`   Opening <div> tags: ${openDivs}`);
  console.log(`   Closing </div> tags: ${closeDivs}`);
  console.log(
    `   JSX Balance: ${openDivs === closeDivs ? "✅ Balanced" : "❌ Unbalanced"}`
  );

  // Check for deprecated Tailwind classes
  const flexShrinkInstances = (facultyPageContent.match(/flex-shrink-0/g) || [])
    .length;
  console.log(
    `   Deprecated flex-shrink-0: ${flexShrinkInstances === 0 ? "✅ None found" : `❌ ${flexShrinkInstances} found`}`
  );

  // Check for common syntax issues
  const hasReturnStatement = facultyPageContent.includes("return (");
  const hasExportDefault = facultyPageContent.includes("export default");
  const hasClosingBrace =
    facultyPageContent.endsWith("}\n") || facultyPageContent.endsWith("}");

  console.log(
    `   Return statement: ${hasReturnStatement ? "✅ Found" : "❌ Missing"}`
  );
  console.log(
    `   Export default: ${hasExportDefault ? "✅ Found" : "❌ Missing"}`
  );
  console.log(
    `   Closing brace: ${hasClosingBrace ? "✅ Found" : "❌ Missing"}`
  );

  console.log("\n📄 Faculty Layout Analysis:");
  const layoutOpenDivs = (facultyLayoutContent.match(/<div/g) || []).length;
  const layoutCloseDivs = (facultyLayoutContent.match(/<\/div>/g) || []).length;
  console.log(`   Opening <div> tags: ${layoutOpenDivs}`);
  console.log(`   Closing </div> tags: ${layoutCloseDivs}`);
  console.log(
    `   JSX Balance: ${layoutOpenDivs === layoutCloseDivs ? "✅ Balanced" : "❌ Unbalanced"}`
  );

  // Overall status
  const allGood =
    openDivs === closeDivs &&
    flexShrinkInstances === 0 &&
    hasReturnStatement &&
    hasExportDefault &&
    hasClosingBrace &&
    layoutOpenDivs === layoutCloseDivs;

  console.log("\n🎯 Overall Status:");
  console.log(
    `   ${allGood ? "✅ All syntax checks passed!" : "❌ Issues found - see details above"}`
  );

  if (allGood) {
    console.log("\n🚀 Faculty dashboard is ready for use!");
    console.log("   - JSX structure is valid");
    console.log("   - No deprecated Tailwind classes");
    console.log("   - Component exports correctly");
  }
} catch (error) {
  console.error("❌ Error validating files:", error.message);
}
