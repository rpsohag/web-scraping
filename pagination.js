import puppeteer from "puppeteer";
import fs from "fs";
import Papa from "papaparse";

(async function () {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("https://www.startech.com.bd/accessories/keyboards?filter_status=7&page=1", {
        waitUntil: "load",
    });

    const products = [];

    while (true) {
        await page.waitForSelector(".p-item");

        const getAllProducts = await page.$$(".p-item");
        for (const product of getAllProducts) {
            const productTitle = await product.$eval(".p-item-name a", (el) => el.textContent.trim());
            const productPrice = await product.$eval(".p-item-price span", (el) => el.textContent.trim());
            const productImage = await product.$eval(".p-item-img a img", (el) => el.getAttribute("src"));
            products.push({ productTitle, productPrice, productImage });
        }

        const isNextDisabled = await page.evaluate(() => {
            const nextButton = document.querySelector(".pagination li:last-child a.disabled");
            return nextButton !== null;
        });

        if (isNextDisabled) {
            break;
        }

        try {
            const nextButton = await page.$(".pagination li:last-child a");
            if (nextButton) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: "load" }),
                    nextButton.click(),
                ]);
            } else {
                console.log("Next button not found. Exiting...");
                break;
            }
        } catch (error) {
            console.error("Error during navigation:", error);
            break;
        }
    }

    console.log(`Total products scraped: ${products.length}`);

    const csv = Papa.unparse(products);

    fs.writeFileSync("products.csv", csv);

    console.log("CSV file has been written!");

    await browser.close();
})();
