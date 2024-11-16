const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

app.use(cors({origin: 'https://etkin-kinik-web-app.vercel.app/', methods: ['GET','POST','DELETE','PUT','PATCH']})
);

const app = express();

const productsFilePath = path.join(__dirname, "products.json");

const readProductFile = () => {
    const data = fs.readFileSync(productsFilePath, "utf8");
    return JSON.parse(data);
};


const getGoldPrice = async () => {
    try{
        const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
            headers: {
                "x-access-token": "goldapi-5rnqdsm3izv0zy-io"
            }
        });
        return response.data.price;
    } catch (error) {
        console.error("Error fetching gold price:", error);
        throw new Error("Failed to retrieve gold price");
    }
};


app.get("/", async (req,res) => {
    res.json("REST express server");
    });

app.get("/api/products", async (req, res) => {
    try {
        const goldPrice = await getGoldPrice();
        const products = readProductFile();

        const updatedProducts = products.map(product => {
            const price = (product.popularityScore + 1) * product.weight * goldPrice;
            product.price = parseFloat(price.toFixed(2));
            product.popularity = (product.popularityScore / 20).toFixed(1);
            return product;
        });

        res.json(updatedProducts);
    } catch (error) {
        console.error("Error fetching product data: ", error);
        res.status(500).send("Internal Server Error");
    }
});

 
module.exports = app;
