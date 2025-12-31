const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "database.db");

console.log("🔍 Faculty Dashboard Data Validation Test");
console.log("==========================================\n");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    return;
  }
  console.log("✅ Connected to SQLite database\n");
});

// Test 1: Verify student data integrity
function testStudentDataIntegrity() {
  return new Promise((resolve) => {
    console.log("📊 Test 1: Student Data Integrity");
    console.log("----------------------------------");

    const query = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as valid_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_students,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as students_with_names,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as students_with_emails,
        COUNT(CASE WHEN branch IS NOT NULL AND branch != '' THEN 1 END) as students_with_branches,
        COUNT(CASE WHEN cohort IS NOT NULL AND cohort != '' THEN 1 END) as students_with_cohorts
      FROM users 
      WHERE role = 'student'
    `;

    db.get(query, [], (err, row) => {
      if (err) {
        console.error("❌ Error:", err.message);
        resolve();
        return;
      }

      console.log(`Total Students: ${row.total_students}`);
      console.log(`Valid Students: ${row.valid_students}`);
      console.log(`Active Students: ${row.active_students}`);
      console.log(`Pending Students: ${row.pending_students}`);
      console.log(`Students with Names: ${row.students_with_names}`);
      console.log(`Students with Emails: ${row.students_with_emails}`);
      console.log(`Students with Branches: ${row.students_with_branches}`);
      console.log(`Students with Cohorts: ${row.students_with_cohorts}`);

      // Validation checks
      const validationPassed =
        row.valid_students === row.total_students &&
        row.students_with_names === row.total_students &&
        row.students_with_emails === row.total_students;

      console.log(
        `\n✅ Data Integrity: ${validationPassed ? "PASSED" : "FAILED"}\n`
      );
      resolve();
    });
  });
}

// Test 2: Check branch distribution
function testBranchDistribution() {
  return new Promise((resolve) => {
    console.log("📊 Test 2: Branch Distribution");
    console.log("------------------------------");

    const query = `
      SELECT 
        branch,
        COUNT(*) as student_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM users 
      WHERE role = 'student' AND branch IS NOT NULL
      GROUP BY branch
      ORDER BY student_count DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ Error:", err.message);
        resolve();
        return;
      }

      if (rows.length === 0) {
        console.log("⚠️  No students found with branch information");
      } else {
        rows.forEach((row) => {
          console.log(
            `${row.branch}: ${row.student_count} total (${row.active_count} active)`
          );
        });
      }
      console.log("");
      resolve();
    });
  });
}

// Test 3: Check faculty data
function testFacultyData() {
  return new Promise((resolve) => {
    console.log("📊 Test 3: Faculty Data");
    console.log("------------------------");

    const query = `
      SELECT 
        COUNT(*) as total_faculty,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_faculty,
        GROUP_CONCAT(DISTINCT branch) as faculty_branches
      FROM users 
      WHERE role = 'faculty'
    `;

    db.get(query, [], (err, row) => {
      if (err) {
        console.error("❌ Error:", err.message);
        resolve();
        return;
      }

      console.log(`Total Faculty: ${row.total_faculty}`);
      console.log(`Active Faculty: ${row.active_faculty}`);
      console.log(`Faculty Branches: ${row.faculty_branches || "None"}`);
      console.log("");
      resolve();
    });
  });
}

// Test 4: Check recent activities for faculty dashboard
function testRecentActivities() {
  return new Promise((resolve) => {
    console.log("📊 Test 4: Recent Activities");
    console.log("-----------------------------");

    const query = `
      SELECT 
        'Events' as activity_type,
        COUNT(*) as count,
        COUNT(CASE WHEN datetime(startDate) > datetime('now') THEN 1 END) as upcoming
      FROM events
      WHERE status = 'approved'
      UNION ALL
      SELECT 
        'Posts' as activity_type,
        COUNT(*) as count,
        COUNT(CASE WHEN datetime(createdAt) > datetime('now', '-7 days') THEN 1 END) as recent
      FROM posts
      WHERE status = 'approved'
      UNION ALL
      SELECT 
        'Applications' as activity_type,
        COUNT(*) as count,
        COUNT(CASE WHEN datetime(appliedAt) > datetime('now', '-7 days') THEN 1 END) as recent
      FROM applications
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ Error:", err.message);
        resolve();
        return;
      }

      rows.forEach((row) => {
        console.log(
          `${row.activity_type}: ${row.count} total (${row.upcoming || row.recent} recent/upcoming)`
        );
      });
      console.log("");
      resolve();
    });
  });
}

// Test 5: Check for any AI-related data or configurations
function testAIToolsData() {
  return new Promise((resolve) => {
    console.log("📊 Test 5: AI Tools & ML Data");
    console.log("------------------------------");

    const query = `
      SELECT 
        COUNT(*) as ml_models_count
      FROM mlModels
      WHERE status = 'active'
    `;

    db.get(query, [], (err, row) => {
      if (err) {
        console.error("❌ Error:", err.message);
        resolve();
        return;
      }

      console.log(`Active ML Models: ${row.ml_models_count}`);

      // Check for industry skills data
      const skillsQuery = `
        SELECT COUNT(*) as industry_skills_count
        FROM industrySkills
        WHERE isActive = 1
      `;

      db.get(skillsQuery, [], (err, skillRow) => {
        if (err) {
          console.error("❌ Error:", err.message);
          resolve();
          return;
        }

        console.log(
          `Active Industry Skills: ${skillRow.industry_skills_count}`
        );
        console.log("");
        resolve();
      });
    });
  });
}

// Run all tests
async function runAllTests() {
  try {
    await testStudentDataIntegrity();
    await testBranchDistribution();
    await testFacultyData();
    await testRecentActivities();
    await testAIToolsData();

    console.log("🎯 Faculty Dashboard Validation Summary");
    console.log("=======================================");
    console.log("✅ All validation tests completed");
    console.log("📋 Check the results above for any data integrity issues");
    console.log(
      "🔧 If any issues found, they should be addressed in the dashboard logic"
    );
  } catch (error) {
    console.error("❌ Test execution error:", error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
      } else {
        console.log("\n✅ Database connection closed");
      }
    });
  }
}

runAllTests();
