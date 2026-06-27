import "./src/config/env.js";

console.log("ACCESS:", process.env.AWS_ACCESS_KEY);


import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { seedUsers } from "./src/utils/seed.js";
import { seedCourses } from "./src/utils/seed.js";



connectDB();

// seedUsers();

// const runSeed = async () => {
//   await connectDB();

//   const users = await seedUsers(); // 🔥 capture users
//   await seedCourses(users);

//   process.exit();
// };

// runSeed();

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
