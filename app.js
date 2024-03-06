const express = require("express");
const parkingRoutes = require("./routes/parkingRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/parking", parkingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
