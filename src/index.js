import { readCSV } from "./helpers/read-csv.js";

async function main() {
  try {
    const [purchaseOrders, idk] = await readCSV();
    console.log(purchaseOrders);
  } catch (error) {
    console.error(error);
  }
}

main();
