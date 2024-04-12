const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const getAccessToken = async () => {
  try {
    return await axios
      .post(
        process.env.AKENEO_AUTH_API_URI,
        {
          username: process.env.AKENEO_API_USERNAME,
          password: process.env.AKENEO_API_PASSWORD,
          grant_type: "password",
        },
        {
          headers: {
            Authorization:
              "Basic " +
              buffer
                .from(
                  process.env.AKENEO_API_ID +
                    ":" +
                    process.env.AKENEO_API_SECRET
                )
                .toString("base64"),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        return res.data.access_token;
      });
  } catch (error) {
    console.error("error", error);
  }
};

const getInstallation = async (key, value, access_token) => {
  let result = "";
  if (key.includes("tools")) {
    for (const item of value) {
      result +=
        (
          await getAkeneoData(
            `${process.env.AKENEO_API_URI}attributes/${key}/options/${item}`,
            access_token
          )
        ).labels.en_US + ", ";
    }
    result = result.slice(0, -2);
  } else if (key.includes("guides")) {
    for (const item of value) {
      result += (await processAsset(item, "auto", access_token)) + ", ";
    }
    result = result.slice(0, -2);
  } else {
    result = (
      await getAkeneoData(
        `${process.env.AKENEO_API_URI}attributes/${key}/options/${value}`,
        access_token
      )
    ).labels.en_US;
  }

  return result;
};

const fetchAkeneoData = async () => {
  let page = 1;
  const limit = 50; // Set a limit for pagination
  let allData = [];
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await axios.get(
        `${API_ENDPOINT}?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      );

      const data = response.data;
      allData = allData.concat(data);

      // Check if more pages are available
      hasMorePages = data.length === limit;
      page++;
    } catch (error) {
      console.error("Error fetching data from Akeneo:", error);
      hasMorePages = false; // Stop loop on error
    }
  }

  return allData;
};

module.exports = {
  getAccessToken,
  getInstallation,
  fetchAkeneoData,
};
