const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;
const puppeteer = require("puppeteer");
const chromium = require("chrome-aws-lambda");

let data = null;
let lastFetchTime = null;
require("dotenv").config();
app.use(
    cors({
        origin: process.env.CLIENT_URL,
    })
);

app.get("/quotes", async (req, res) => {
    try {
        const response = await fetchData();
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/average", async (req, res) => {
    try {
        await fetchData();
        let totalBuyPrice = 0;
        let totalSellPrice = 0;
        data?.forEach((item) => {
            const buyPrice = parseFloat(item.buy_price.replace(/[^\d.]/g, ""));
            const sellPrice = parseFloat(
                item.sell_price.replace(/[^\d.]/g, "")
            );

            totalBuyPrice += buyPrice;
            totalSellPrice += sellPrice;
        });

        const average_buy_price =
            data?.length > 0 ? (totalBuyPrice / data.length).toFixed(2) : 0;
        const average_sell_price =
            data?.length > 0 ? (totalSellPrice / data.length).toFixed(2) : 0;

        res.status(200).json({ average_buy_price, average_sell_price });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function fetchData() {
    if (data && lastFetchTime && Date.now() - lastFetchTime < 60000) {
        // if last fecthed data was less than 60 sec ago
        return data; // return catched data
    }
    const sourceData = [
        {
            url: "https://www.ambito.com/contenidos/dolar.html",
            compra: ".variation-max-min__value.data-valor.data-compra",
            venta: ".variation-max-min__value.data-valor.data-venta",
        },
        {
            url: "https://www.dolarhoy.com",
            compra: ".compra .val",
            venta: ".venta .val",
        },
        {
            url: "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
            compra: ".buy-wrapper .buy-value",
            venta: ".sell-wrapper .sell-value",
        },
    ];

    const prices = await Promise.all(
        sourceData.map(async (source) => {
            return await scrapeDynamicData(
                source.url,
                source.compra,
                source.venta
            );
        })
    );

    const response = [...prices[0], ...prices[1], ...prices[2]];
    data = response;
    lastFetchTime = Date.now();
    return response;
}

async function scrapeDynamicData(url, compraSelector, ventaSelector) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.goto(url);
    await page.waitForSelector(compraSelector);
    await page.waitForSelector(ventaSelector);

    const compraValues = await scrapeValues(page, compraSelector);
    const ventaValues = await scrapeValues(page, ventaSelector);

    await browser.close();

    const response = [];
    for (let i = 0; i < compraValues.length && i < ventaValues.length; i++) {
        if (
            !compraValues[i] ||
            !ventaValues[i] ||
            compraValues[i] == "" ||
            ventaValues[i] == ""
        )
            continue;
        response.push({
            buy_price: compraValues[i],
            sell_price: ventaValues[i],
            url,
        });
    }
    return response;
}
async function scrapeValues(page, selector) {
    return await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map((element) =>
            element.textContent.trim()
        );
    }, selector);
}

app.listen(port, () => {
    console.log("server started");
});
app.get("/", (req, res) => {
    res.json("Server running..");
});
