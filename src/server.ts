// import errorHandler from "errorhandler";
import app from "./app";

import * as dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

export default server;
