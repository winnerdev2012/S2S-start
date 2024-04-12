const fs = require("fs");
const path = require("path");

// Load the configuration
const configPath = path.join(__dirname, "mappingConfig.json");
const { brandMappings } = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const buildShopifyVariables = (product, brand = "default") => {
  const brandMapping =
    brandMappings.find((mapping) => mapping.brand === brand) ||
    brandMappings.find((mapping) => mapping.brand === "default");
  const variables = { input: { metafields: [] } };

  brandMapping.fields.forEach((field) => {
    if (field.shopifyField) {
      variables.input[field.shopifyField] =
        product.values[field.akeneoAttribute]?.[0]?.data || field.defaultValue;
    } else if (field.shopifyMetafield) {
      const value = product.values[field.akeneoAttribute]
        ? product.values[field.akeneoAttribute][0].data.toString()
        : field.defaultValue;
      variables.input.metafields.push({
        ...field.shopifyMetafield,
        value,
      });
    }
  });

  return variables;
};

const variables = buildShopifyVariables(product, "bds");
console.log(variables);
