import { readCSV } from "./helpers/read-csv.js";

/* 
    GOALS: 

    *** Determine how much of each PO we should fill. 
    *** Calculate the total expected penalty we incur. 

    we can do this by
    1. figuring out the brands with the highest penalty rate (and also their fillRateTarget)
    2. then, we sort the brands from highest penalty rate to lowest penalty rate. 
    3. once we know that, we can sort the purchase orders based on brand. 
    4. once POs are sorted, we can start filling based on fill rate target for each brand. 
    5. return the total amount of orders shipped, along with the total penalty amount
*/

async function main() {
  try {
    // load in the data from the CSV files
    const [purchaseOrders, penaltyRates] = await readCSV();

    // 1. figuring out the brands with the highest penalty rate (and also their fillRateTarget)
    let brands = penaltyRates.map((brand) => {
      return {
        name: brand.Customer,
        fillRateTarget: Number(`.${brand["Fill Rate Target"].slice(0, 2)}`),
        penaltyRate: Number(`.0${brand["Penalty"].slice(0, 1)}`),
        purchaseOrders: [],
      };
    });

    // 2. then, we sort the brands from highest penalty rate to lowest penalty rate.
    brands.sort((a, z) => {
      return z.penaltyRate - a.penaltyRate;
    });

    // 3. once we know that, we can sort the purchase orders based on brand.
    purchaseOrders.forEach((order) => {
      let particularBrand = brands.find(
        (brand) => brand.name === order.Customer
      );
      particularBrand["purchaseOrders"].push(order);
    });

    // 4. once POs are sorted, we can start filling based on fill rate target for each brand.
    let inventory = 3459;
    for (let brand of brands) {
      brand.purchaseOrders.forEach((order) => {
        let maxQuantityToShip = order["Units"] * brand.fillRateTarget;
        // TODO: make sure we record the penalty as maxQTY - shipped * rate * cost per item

        if (inventory > maxQuantityToShip) {
          // We have plenty of inventory, no need to worry about charges! 😀
          order["shippedAmount"] = maxQuantityToShip;
          order["penaltyCharge"] = 0;
          inventory -= maxQuantityToShip;
        } else if (inventory > 0 && inventory < maxQuantityToShip) {
          // We have inventory to ship, but not enough to cover the maxQuantity we can ship. 🙃
          order["shippedAmount"] = inventory;
          // assuming each unit costs a dollar here.
          order["penaltyCharge"] = inventory * brand["penaltyRate"];
          inventory = 0;
        } else {
          // We have no more inventory to ship! 🥲
          order["shippedAmount"] = 0;
          order["penaltyCharge"] = order["Units"] * brand["penaltyRate"];
        }
      });
    }

    // 5. return the total amount of orders shipped, along with the total penalty amount
    let totalShipped = 0;
    let totalCharges = 0;
    let totalUnits = 0;
    for (let brand of brands) {
      brand.purchaseOrders.forEach((order) => {
        totalShipped += order["shippedAmount"];
        totalCharges += order["penaltyCharge"];
        totalUnits += Number(order["Units"]);
      });
    }

    console.log(`shipped ${totalShipped}`);
    console.log(`charges add up to ${totalCharges}`);
  } catch (error) {
    console.error(error);
  }
}

main();
