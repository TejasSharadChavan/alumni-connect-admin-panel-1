// Test script for ML recommendations API
const testMLAPI = async () => {
  try {
    console.log("Testing ML Recommendations API...");

    // You'll need to replace this with a valid auth token
    const token = "your_auth_token_here";

    const response = await fetch(
      "http://localhost:3000/api/ml/recommend-connections?limit=5",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Success! Recommendations:", data);
    } else {
      const errorData = await response.json();
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// Run the test
testMLAPI();
