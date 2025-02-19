import puppeteer from "puppeteer";

(async function(){
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.startech.com.bd/accessories/keyboards")
    await page.setViewport({ width: 1920, height: 1080 });

    const getAllProducts = await page.$$(".main-content.p-items-wrap > .p-item");

    const products = [];
    for(const product of getAllProducts){
        const productTitle = await page.evaluate(el => el.querySelector(".p-item-name a").textContent, product)
        const productPrice = await page.evaluate(el => el.querySelector(".p-item-price span").textContent, product)
        const productImage = await page.evaluate(el => el.querySelector(".p-item-img a img").getAttribute('src'), product)
        products.push({productTitle, productPrice, productImage})
    }

    
})()