// Debug Network Growth Calculation
const debugNetworkGrowth = async () => {
  try {
    // Login first
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok || !loginData.token) {
      console.log("❌ Login failed");
      return;
    }

    console.log("✅ Login successful - User ID:", loginData.user.id);
    const headers = { Authorization: `Bearer ${loginData.token}` };

    // Get all connections to see their dates
    console.log("\n🔍 Checking all connections...");
    const connectionsResponse = await fetch(
      "http://localhost:3000/api/connections",
      {
        headers,
      }
    );

    if (connectionsResponse.ok) {
      const connectionsData = await connectionsResponse.json();
      const connections = connectionsData.connections || [];

      console.log(`📊 Total connections: ${connections.length}`);

      connections.forEach((conn, index) => {
        console.log(
          `   ${index + 1}. Status: ${conn.status}, Created: ${conn.createdAt}`
        );
        console.log(
          `      Connected with: ${conn.connectedUser?.name || "Unknown"}`
        );
      });

      // Calculate date ranges
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      console.log("\n📅 Date Ranges:");
      console.log(`   Now: ${now.toISOString()}`);
      console.log(`   6 months ago: ${sixMonthsAgo.toISOString()}`);
      console.log(`   12 months ago: ${twelveMonthsAgo.toISOString()}`);

      // Categorize connections by date
      const recentConnections = connections.filter((conn) => {
        const connDate = new Date(conn.createdAt);
        return connDate >= sixMonthsAgo && conn.status === "accepted";
      });

      const previousConnections = connections.filter((conn) => {
        const connDate = new Date(conn.createdAt);
        return (
          connDate >= twelveMonthsAgo &&
          connDate < sixMonthsAgo &&
          conn.status === "accepted"
        );
      });

      console.log("\n📈 Connection Analysis:");
      console.log(
        `   Recent connections (last 6 months): ${recentConnections.length}`
      );
      console.log(
        `   Previous connections (6-12 months ago): ${previousConnections.length}`
      );

      // Calculate growth
      const recentCount = recentConnections.length;
      const previousCount = previousConnections.length || 1; // Avoid division by zero
      const growthPercentage = Math.round(
        ((recentCount - previousCount) / previousCount) * 100
      );

      console.log("\n🧮 Growth Calculation:");
      console.log(`   Recent: ${recentCount}`);
      console.log(`   Previous: ${previousCount}`);
      console.log(
        `   Formula: ((${recentCount} - ${previousCount}) / ${previousCount}) * 100`
      );
      console.log(`   Growth: ${growthPercentage}%`);

      // Show individual connection dates
      console.log("\n📋 Recent Connections Details:");
      recentConnections.forEach((conn, index) => {
        console.log(
          `   ${index + 1}. ${conn.connectedUser?.name} - ${conn.createdAt}`
        );
      });

      console.log("\n📋 Previous Connections Details:");
      previousConnections.forEach((conn, index) => {
        console.log(
          `   ${index + 1}. ${conn.connectedUser?.name} - ${conn.createdAt}`
        );
      });
    } else {
      const errorData = await connectionsResponse.json();
      console.log("❌ Connections API failed:", errorData);
    }
  } catch (error) {
    console.log("❌ Debug error:", error.message);
  }
};

// Run the debug
debugNetworkGrowth();
