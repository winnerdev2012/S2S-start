const axios = require("axios");
const env = require("dotenv").config();

const makeGraphQlRequest = async (url, query, accessToken, variables) => {
  try {
    const options = {
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      data: {
        query: query,
        variables: variables,
      },
    };

    const response = await axios(options);
    // console.log("RESPONSE: ", response);
    return response.data;
  } catch (error) {
    console.error("ERROR: ", error);
  }
};

module.exports = {
  makeGraphQlRequest,
};
