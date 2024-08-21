const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.json());

// In-memory store for stats by requester ID
const statsByRequester = {};

// Route to handle POST requests to /synchronizeAction
app.post("/synchronizeAction", (req, res) => {
  const requesterId = req.body.requesterId;

  // Ensure the requester ID is provided
  if (!requesterId) {
    return res.status(400).json({ message: "Missing requesterId in request" });
  }

  // Initialize stats for this requester ID if it doesn't exist
  if (!statsByRequester[requesterId]) {
    statsByRequester[requesterId] = { totalRequests: 0, successfulRequests: 0 };
  }

  // Increment total requests
  statsByRequester[requesterId].totalRequests++;

  // Assuming the request is successful if there's a 'data' key
  if (req.body.data) {
    statsByRequester[requesterId].successfulRequests++;
    res.status(200).json({ message: "Synchronization successful" });
  } else {
    res.status(400).json({ message: "Synchronization failed, missing data" });
  }
});

// Route to get the stats for all requesters
app.get("/stats", (req, res) => {
  const allStats = Object.entries(statsByRequester).map(
    ([requesterId, stats]) => {
      const { totalRequests, successfulRequests } = stats;
      const successRate =
        totalRequests === 0 ? 0 : (successfulRequests / totalRequests) * 100;

      return {
        requesterId,
        totalRequests,
        successfulRequests,
        successRate: `${successRate.toFixed(2)}%`,
      };
    }
  );

  res.status(200).json(allStats);
});

// Route to delete all stats
app.delete("/deleteAll", (req, res) => {
  // Clear the statsByRequester object
  for (let key in statsByRequester) {
    delete statsByRequester[key];
  }

  res.status(200).json({ message: "All stats have been reset" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
