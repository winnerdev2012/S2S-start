const GET_SHOPIFY_PRODUCTS = () => {
  return `query {
      products(first: 3) {
        edges {
          cursor
          node {
            id
            metafields(first: 25) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  metafields(first: 25) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;
};

const GET_SHOPIFY_VARIANT_PRODUCTS = () => {
  return `query {
      products(first: 1, query: "BDS1674H") {
        edges {
          cursor
          node {
            id
            metafields(first: 25) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
            variants(first: 16) {
              edges {
                node {
                  id
                  sku
                  metafields(first: 2) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;
};

const GET_SHOPIFY_PRODUCTS_WITH_CURSOR = (cursor) => {
  return `query {
      products(first: 3, after: "${cursor}") {
        edges {
          cursor
          node {
            id
            metafields(first: 25) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  metafields(first: 25) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;
};

const GET_SHOPIFY_VARIANT_PRODUCTS_WITH_CURSOR = (cursor) => {
  return `query {
      products(first: 3, after: "${cursor}") {
        edges {
          cursor
          node {
            id
            metafields(first: 25) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
            variants(first: 16) {
              edges {
                node {
                  id
                  sku
                  metafields(first: 2) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;
};

const CREATE_SIMPLE_PRODUCT = () => {
  return `mutation productCreate($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
      descriptionHtml
      tags
      vendor
      metafields(first: 25) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
      images(first: 5) {
        edges {
          node {
            altText
            src
          }
        }
      }
      variants(first: 5) {
        edges {
          node {
            id
            title
            price
            sku
            weight
            metafields(first: 25) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }
}`;
};

const CREATE_VARIANT_PRODUCT = () => {
  return `mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        descriptionHtml
        tags
        vendor
        metafields(first: 25) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
        images(first: 5) {
          edges {
            node {
              altText
              src
            }
          }
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              price
              sku
              barcode
              weight
              metafields(first: 25) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;
};

const PRODUCT_UPDATE = () => {
  return `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        descriptionHtml
        tags
        vendor
      }
      userErrors {
        field
        message
      }
    }
  }`;
};

const VARIANT_PRODUCT_UPDATE = () => {
  return `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        descriptionHtml
        tags
        vendor
        metafields(first: 25) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              price
              sku
              metafields(first: 25) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;
};

// Export query functions
module.exports = {
  GET_SHOPIFY_PRODUCTS,
  GET_SHOPIFY_VARIANT_PRODUCTS,
  GET_SHOPIFY_PRODUCTS_WITH_CURSOR,
  GET_SHOPIFY_VARIANT_PRODUCTS_WITH_CURSOR,
  CREATE_SIMPLE_PRODUCT,
  CREATE_VARIANT_PRODUCT,
  PRODUCT_UPDATE,
  VARIANT_PRODUCT_UPDATE,
};
