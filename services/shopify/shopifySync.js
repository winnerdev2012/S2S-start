const { makeGraphQlRequest } = require("../../GraphQl/GraphQlService");
const {
  CREATE_SIMPLE_PRODUCT,
  VARIANT_PRODUCT_UPDATE,
} = require("../../GraphQl/GraphQlQueries");

const graphQLClient = new GraphQLClient(SHOPIFY_ENDPOINT, {
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

const shopifySync = {
  createProduct: async (productData) => {
    try {
      const data = await makeGraphQlRequest(CREATE_SIMPLE_PRODUCT, {
        input: productData,
      });
      return data;
    } catch (error) {
      console.error("Error creating product in Shopify:", error);
      throw error;
    }
  },

  updateProduct: async (productId, updateData) => {
    try {
      const data = await makeGraphQlRequest(VARIANT_PRODUCT_UPDATE, {
        id: productId,
        input: updateData,
      });
      return data;
    } catch (error) {
      console.error("Error updating product in Shopify:", error);
      throw error;
    }
  },

  compareProduct: (akeneoProduct, shopifyProduct) => {
    // Logic to compare products and determine differences
  },
};

module.exports = shopifySync;
