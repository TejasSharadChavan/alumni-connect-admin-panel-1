// Test Payment Flow for Alumni Donations
const testPaymentFlow = async () => {
  let authToken = null;

  const addResult = (title, content, isError = false) => {
    console.log(`\n${isError ? "❌" : "✅"} ${title}`);
    console.log(content);
  };

  try {
    // 1. Test Login
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rahul.agarwal@gmail.com",
        password: "Password@123",
      }),
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      authToken = loginData.token;
      addResult(
        "Alumni Login",
        `Success! Token: ${authToken.substring(0, 20)}...`
      );
    } else {
      addResult("Alumni Login", `Failed: ${JSON.stringify(loginData)}`, true);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    // 2. Test Auth Me (used by payment system)
    const meResponse = await fetch("http://localhost:3000/api/auth/me", {
      headers,
    });
    const meData = await meResponse.json();

    if (meResponse.ok) {
      addResult(
        "Auth Me API",
        `User: ${meData.user.name} (${meData.user.email})`
      );
    } else {
      addResult("Auth Me API", `Failed: ${JSON.stringify(meData)}`, true);
      return;
    }

    // 3. Test Donations Stats API
    const statsResponse = await fetch(
      "http://localhost:3000/api/donations/stats",
      { headers }
    );
    const statsData = await statsResponse.json();

    if (statsResponse.ok) {
      addResult(
        "Donations Stats API",
        `Total: ₹${statsData.totalDonations}, Count: ${statsData.donationCount}`
      );
    } else {
      addResult(
        "Donations Stats API",
        `Failed: ${JSON.stringify(statsData)}`,
        true
      );
    }

    // 4. Test Create Order API (Payment Initiation)
    const orderResponse = await fetch(
      "http://localhost:3000/api/payments/razorpay/create-order",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: 1000,
          message: "Test donation",
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (orderResponse.ok) {
      addResult(
        "Create Order API",
        `Order ID: ${orderData.order.id}, Amount: ₹${orderData.order.amount / 100}`
      );

      // 5. Test Payment Verification (simulate successful payment)
      const verifyResponse = await fetch(
        "http://localhost:3000/api/payments/razorpay/verify",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            razorpay_order_id: orderData.order.id,
            razorpay_payment_id: "pay_test_" + Date.now(),
            razorpay_signature: "test_signature",
            donationId: orderData.donationId,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        addResult("Payment Verification", `Success: ${verifyData.message}`);
      } else {
        addResult(
          "Payment Verification",
          `Failed: ${JSON.stringify(verifyData)}`,
          true
        );
      }
    } else {
      addResult(
        "Create Order API",
        `Failed: ${JSON.stringify(orderData)}`,
        true
      );
    }

    // 6. Test Donations List API
    const donationsResponse = await fetch(
      "http://localhost:3000/api/donations",
      { headers }
    );
    const donationsData = await donationsResponse.json();

    if (donationsResponse.ok) {
      const donations = donationsData.donations || [];
      addResult("Donations List API", `Found ${donations.length} donations`);
    } else {
      addResult(
        "Donations List API",
        `Failed: ${JSON.stringify(donationsData)}`,
        true
      );
    }

    console.log("\n🎯 Payment Flow Test Complete!");
  } catch (error) {
    addResult("Test Error", `${error.message}`, true);
  }
};

// Run the test
testPaymentFlow();
