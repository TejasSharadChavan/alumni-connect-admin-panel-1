# How to Seed the Database with Jobs and Events

## Step 1: Make sure dev server is running

```bash
bun run dev
```

## Step 2: Open browser and go to any page (e.g., http://localhost:3000)

## Step 3: Open browser console (F12) and run:

```javascript
fetch("/api/seed", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Seed result:", data);
    if (data.success) {
      alert(
        "Database seeded successfully! " +
          data.data.jobs +
          " jobs and " +
          data.data.events +
          " events created."
      );
      window.location.reload(); // Reload to see the data
    } else {
      alert("Seed failed: " + data.error);
    }
  })
  .catch((err) => {
    console.error("Seed error:", err);
    alert("Seed failed: " + err.message);
  });
```

## Alternative: Use PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/seed" -Method POST -ContentType "application/json"
```

## What This Does:

1. Finds the first alumni user in your database
2. Creates 10 sample jobs (various companies, roles, types)
3. Creates 5 sample events (workshops, meetups, webinars)
4. All jobs and events are auto-approved and ready to view

## If You Get "No alumni users found" Error:

You need to create an alumni user first. Use the quick register API:

```javascript
fetch("/api/auth/quick-register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test Alumni",
    email: "alumni@test.com",
    password: "password123",
    role: "alumni",
    branch: "Computer Engineering",
    yearOfPassing: 2020,
  }),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("User created:", data);
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      alert("Alumni user created! Now run the seed command.");
    }
  });
```

Then run the seed command again.
