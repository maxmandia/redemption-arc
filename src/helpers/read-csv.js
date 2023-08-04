import csv from "csv-parser";
import fs from "fs";

export async function readCSV(
  paths = ["./purchaseOrders.csv", "./penaltyRates.csv"]
) {
  let allResults = [];
  for (let path of paths) {
    const results = await new Promise((resolve, reject) => {
      let results = [];
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
    allResults.push(results);
  }
  return allResults;
}
