import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async () => {
  const port = config.port || 3000;

  //connect db
  await connectDB();

  app.listen(port, () => {
    console.log(`Listening on port : ${port}`);
  });
};

startServer();
console.log("Welcome to ebook apis");
