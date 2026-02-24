const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Use resume routes
app.use("/api", resumeRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});