import express from "express";
import { Readable } from "node:stream";
import { stringify } from "csv-stringify";
import { parseIntOr } from "./utils.js";
import cluster from "node:cluster";
import { getUsers } from "./database.js";

const app = express();

app.get("/status", async (request, response) => {
  return response.json({
    status: "ok",
  });
});

app.get("/download-csv", async (request, response) => {
  response.set("Content-Type", "text/csv");
  response.set("Content-Disposition", 'inline; filename="file.csv"');

  const size = parseIntOr(request.query.size, 10_000);

  const abortController = new AbortController();

  request.once("close", (_) => {
    abortController.abort();
  });

  Readable.from(getUsers(size), { signal: abortController.signal })
    .pipe(
      stringify({
        header: true,
        delimiter: ";",
      })
    )
    .pipe(response);
});

const numForks = Number(process.env.CLUSTER_WORKERS) || 1;
const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numForks; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}
