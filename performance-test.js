// Performance test for industry trends API
const API_BASE = "http://localhost:3000/api/industry-trends";
const AUTH_TOKEN = "test-token";

async function testAPIPerformance() {
  console.log("🚀 Testing API Performance...\n");

  // Test 1: Load all trends
  console.log("1. Testing load all trends...");
  const start1 = Date.now();
  try {
    const response = await fetch(`${API_BASE}?limit=10`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const data = await response.json();
    const end1 = Date.now();
    console.log(
      `✅ Load all: ${end1 - start1}ms (${data.data.trends.length} articles)`
    );
  } catch (error) {
    console.log(`❌ Load all failed: ${error.message}`);
  }

  // Test 2: Search query
  console.log("\n2. Testing search query...");
  const start2 = Date.now();
  try {
    const response = await fetch(`${API_BASE}?query=AI&limit=5`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const data = await response.json();
    const end2 = Date.now();
    console.log(
      `✅ Search: ${end2 - start2}ms (${data.data.trends.length} results)`
    );
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
  }

  // Test 3: AI Search
  console.log("\n3. Testing AI search...");
  const start3 = Date.now();
  try {
    const response = await fetch(`${API_BASE}/ai-search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "React" }),
    });
    const data = await response.json();
    const end3 = Date.now();
    console.log(
      `✅ AI Search: ${end3 - start3}ms (${data.data.trends.length} results)`
    );
  } catch (error) {
    console.log(`❌ AI Search failed: ${error.message}`);
  }

  // Test 4: Category filter
  console.log("\n4. Testing category filter...");
  const start4 = Date.now();
  try {
    const response = await fetch(`${API_BASE}?category=ai%20%26%20ml&limit=5`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const data = await response.json();
    const end4 = Date.now();
    console.log(
      `✅ Category filter: ${end4 - start4}ms (${data.data.trends.length} results)`
    );
  } catch (error) {
    console.log(`❌ Category filter failed: ${error.message}`);
  }

  console.log("\n🏁 Performance test complete!");
}

// Run the test
testAPIPerformance().catch(console.error);
