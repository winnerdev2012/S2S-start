const axios = require("axios");
const env = require("dotenv").config();

const makeBulkApiCalls = async (apiRequests) => {
  try {
    const apiResponses = await Promise.all(
      apiRequests.map((request) => axios(request))
    );
    return apiResponses;
  } catch (error) {
    throw error;
  }
};

const makeApiRequests = (url, query, accessToken, variables) => {
  console.log({
    method: "POST",
    url: url,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    data: {
      query: query,
      variables: variables.input.metafields,
    },
  });
  return {
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
};

const removeProduct = async (url, accessToken) => {
  const options = {
    method: "DELETE",
    url: url,
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
  };
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error("ERROR: ", error);
  }
};

module.exports = {
  makeBulkApiCalls,
  makeApiRequests,
  removeProduct,
};
