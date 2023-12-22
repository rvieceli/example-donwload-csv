import express from "express";
import { Readable } from "node:stream";
import { stringify } from "csv-stringify";
import { getData } from "./data.js";
import { parseIntOr } from "./utils.js";

const app = express();

app.get("/", async (request, response) => {
  response.set("Content-Type", "text/csv");
  response.set("Content-Disposition", 'inline; filename="file.csv"');

  const size = parseIntOr(request.query.size, 10_000);
  const throttle = parseIntOr(request.query.throttle);

  const abortController = new AbortController();

  request.once("close", (_) => {
    abortController.abort();
  });

  Readable.from(
    getData({
      size,
      throttle,
    }),
    { signal: abortController.signal }
  )
    .pipe(
      stringify({
        header: true,
        delimiter: ";",
      })
    )
    .pipe(response);
});

app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});
