import app from "./app.js";
import config from "./config/config.js";

const env = config.env;
const port = config.port;

app.listen(port, () => {
  console.log(`Server running in ${env} mode.`);
  if (env === "development") {
    console.log(`API available at: http://localhost:${port}`);
  }
});