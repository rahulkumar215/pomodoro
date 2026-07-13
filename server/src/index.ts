import { createServer } from "@/server";
import appConfig from "./config";

const server = createServer();

server.listen(appConfig.PORT, () => {
  console.log(`App is running on port ${appConfig.PORT}!`);
});
