const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/rba", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.rba.gov.au/rss/rss-cb-exchange-rates.xml",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/xml"
        }
      }
    );

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false
    });

    const items = parsed["rdf:RDF"].item;

    const result = items.map((item) => {
      const exchange = item["cb:statistics"]["cb:exchangeRate"];

      return {
        currency: exchange["cb:targetCurrency"],
        rate: parseFloat(
          exchange["cb:observation"]["cb:value"]
        ),
        date: exchange["cb:observationPeriod"]["cb:period"]
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});