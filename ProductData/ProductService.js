const { getInstallation } = require("../services/akeneo/akeneo");
const { getAkeneoData } = require("../services/akeneo/akeneo");
const { makeApiRequests } = require("../ProductData/SyncService");
const { formatOption } = require("../Helpers/misc");

const createShopifyProducts = async (
  product,
  tags,
  images,
  secret,
  access_token
) => {
  return new Promise(async (resolve) => {
    const variables = {
      input: {
        title: product.values.title
          ? product.values.title[0].data
          : "No Title Available",
        descriptionHtml: product.values.SDC_MKT_Description_body
          ? product.values.SDC_MKT_Description_body[0].data
          : "No Description Available",
        vendor: "No Brand Available",
        tags: tags,
        images: [],
        customProductType: null,
        published: true,
        metafields: [],
        variants: [
          {
            title: product.values.title
              ? product.values.title[0].data
              : "No Title Available",
            sku: product.identifier,
            price: product.values.price
              ? product.values.price[0].data[0].amount
              : "0.00",
            weight: product.values.weight
              ? Number(product.values.weight[0].data.amount)
              : 0.0,
            metafields: [],
          },
        ],
      },
    };

    const mutation = `mutation productCreate($input: ProductInput!) {
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

    // Product Vendor
    if (
      product.values.stusa_brand &&
      product.values.stusa_brand[0].data === "bds"
    ) {
      variables.input.vendor = "BDS Suspension";
    }

    // Specification
    if (product.categories.toString().includes("Kits")) {
      const specification =
        "<ul>" +
        "<li>Front Lift Method : " +
        (product.values.PVG_BDS_Front_Lift_Method
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Method/options/${product.values.PVG_BDS_Front_Lift_Method[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Front Lift Method") +
        "</li>" +
        "<li>Rear Lift Method : " +
        (product.values.PVG_BDS_Rear_Lift_Method
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Method/options/${product.values.PVG_BDS_Rear_Lift_Method[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Rear Lift Method") +
        "</li>" +
        "<li>Shocks Included : " +
        (product.values.PVG_BDS_Shocks_Included
          ? product.values.PVG_BDS_Shocks_Included[0].data === true
            ? "Yes"
            : "No"
          : "No Shocks Included") +
        "</li>" +
        "<li>Front Lift Height : " +
        (product.values.PVG_BDS_Front_Lift_Height
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Height/options/${product.values.PVG_BDS_Front_Lift_Height[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Front Lift Height") +
        "</li>" +
        "<li>Rear Lift Height : " +
        (product.values.PVG_BDS_Rear_Lift_Height
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Height/options/${product.values.PVG_BDS_Rear_Lift_Height[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Rear Lift Height") +
        "</li>" +
        "</ul>";
      variables.input.metafields.push({
        namespace: "pim",
        key: "specification",
        value: specification,
        type: "multi_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "specification",
        value: specification,
        type: "multi_line_text_field",
      });
    } else if (product.categories.toString().includes("Shocks")) {
      const specification =
        "<ul>" +
        "<li>Type : Shocks</li>" +
        "<li>Lower Mount Type : " +
        (product.values.PVG_BDS_Lower_Mount_Type
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Lower_Mount_Type/options/${product.values.PVG_BDS_Lower_Mount_Type[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Lower Mount Type") +
        "</li>" +
        "<li>Upper Mount Type : " +
        (product.values.PVG_BDS_Upper_Mount_Code
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Upper_Mount_Code/options/${product.values.PVG_BDS_Upper_Mount_Code[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Upper Mount Type") +
        "</li>" +
        "<li>Gas Charged : " +
        (product.values.PVG_BDS_Gas_Charged
          ? product.values.PVG_BDS_Gas_Charged[0].data
          : "No Gas Charged") +
        "</li>" +
        "<li>Adjustable : " +
        (product.values.PVG_BDS_Adjustable
          ? product.values.PVG_BDS_Adjustable[0].data
          : "No Adjustable") +
        "</li>" +
        "<li>Adjustable Dampening : " +
        (product.values.PVG_BDS_Adjustable_Dampening
          ? product.values.PVG_BDS_Adjustable_Dampening[0].data
          : "No Adjustable Dampening") +
        "</li>" +
        "<li>Compressed Length : " +
        (product.values.PVG_BDS_Compressed_Length
          ? product.values.PVG_BDS_Compressed_Length[0].data.amount +
            " " +
            product.values.PVG_BDS_Compressed_Length[0].data.unit
          : "No Compressed Length") +
        "</li>" +
        "<li>Travel Length : " +
        (product.values.PVG_BDS_Travel_Length
          ? product.values.PVG_BDS_Travel_Length[0].data.amount +
            " " +
            product.values.PVG_BDS_Travel_Length[0].data.unit
          : "No Travel Length") +
        "</li>" +
        "<li>Shaft Diameter : " +
        (product.values.PVG_BDS_Shaft_Diameter
          ? product.values.PVG_BDS_Shaft_Diameter[0].data
          : "No Shaft Diameter") +
        "</li>" +
        "</ul>";
      variables.input.metafields.push({
        namespace: "pim",
        key: "specification",
        value: specification,
        type: "multi_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "specification",
        value: specification,
        type: "multi_line_text_field",
      });
    }

    // Fitment Details Metafields
    if (product.values.zn_fitment) {
      // Add Fitment Details to Product
      variables.input.metafields.push({
        namespace: "pim",
        key: "fitment_details",
        value:
          product.values.zn_fitment[0].data.toString().replace(/"/g, "") ||
          "No Fitment Available",
        type: "single_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "fitment_details",
        value:
          product.values.zn_fitment[0].data.toString().replace(/"/g, "") ||
          "No Fitment Available",
        type: "single_line_text_field",
      });
    }

    if (product.values.zn_importantNotes) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "important_notes",
        value:
          product.values.zn_importantNotes[0].data ||
          "No Important Note Available",
        type: "multi_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "important_notes",
        value:
          product.values.zn_importantNotes[0].data ||
          "No Important Note Available",
        type: "multi_line_text_field",
      });
    }

    if (product.values.zn_installation_instructions) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "instructions",
        value:
          product.values.zn_installation_instructions[0].data
            .toString()
            .replace(/"/g, "") || "No Instiallation Instruction Available",
        type: "url",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "instructions",
        value:
          product.values.zn_installation_instructions[0].data
            .toString()
            .replace(/"/g, "") || "No Instiallation Instruction Available",
        type: "url",
      });
    }

    if (product.values.zn_installation_guides) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "guides",
        value: await getInstallation(
          "zn_installation_guides",
          product.values.zn_installation_guides[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "guides",
        value: await getInstallation(
          "zn_installation_guides",
          product.values.zn_installation_guides[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }

    if (product.values.zn_installation_time) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "time",
        value: await getInstallation(
          "zn_installation_time",
          product.values.zn_installation_time[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "time",
        value: await getInstallation(
          "zn_installation_time",
          product.values.zn_installation_time[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }

    if (product.values.zn_installation_difficulty) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "difficulty",
        value: formatOption(product.values.zn_installation_difficulty[0].data),
        type: "single_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "difficulty",
        value: formatOption(product.values.zn_installation_difficulty[0].data),
        type: "single_line_text_field",
      });
    }

    if (product.values.zn_installation_tools) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "tools",
        value: await getInstallation(
          "zn_installation_tools",
          product.values.zn_installation_tools[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "tools",
        value: await getInstallation(
          "zn_installation_tools",
          product.values.zn_installation_tools[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }

    // Add Product Features Metafield
    if (product.values.SDC_FAB_zn_features) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "product_features",
        value:
          product.values.SDC_FAB_zn_features[0].data ||
          "No Product Features Available",
        type: "multi_line_text_field",
      });
      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "product_features",
        value:
          product.values.SDC_FAB_zn_features[0].data ||
          "No Product Features Available",
        type: "multi_line_text_field",
      });
    }

    // Add Meta Title and Meta Description if available, both pim and global on the product. Pim only on the variant.
    if (product.values.meta_title) {
      variables.input.metafields.push(
        {
          namespace: "pim",
          key: "meta_title",
          value: product.values.meta_title[0].data || "No Meta Title Available",
          type: "multi_line_text_field",
        },
        {
          namespace: "global",
          key: "title_tag",
          value: product.values.meta_title[0].data || "No Meta Title Available",
          type: "multi_line_text_field",
        }
      );

      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "meta_title",
        value: product.values.meta_title[0].data || "No Meta Title Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.meta_description) {
      variables.input.metafields.push(
        {
          namespace: "pim",
          key: "meta_description",
          value:
            product.values.meta_description[0].data ||
            "No Meta Description Available",
          type: "multi_line_text_field",
        },
        {
          namespace: "global",
          key: "description_tag",
          value:
            product.values.meta_description[0].data ||
            "No Meta Description Available",
          type: "multi_line_text_field",
        }
      );

      variables.input.variants[0].metafields.push({
        namespace: "pim",
        key: "meta_description",
        value:
          product.values.meta_description[0].data ||
          "No Meta Description Available",
        type: "multi_line_text_field",
      });
    }

    if (product.associations.BDS_add_on) {
      const addOnsValue =
        product.associations.BDS_add_on?.products.length > 0
          ? product.associations.BDS_add_on.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_ons",
        value: addOnsValue,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_accessories) {
      const accessories =
        product.associations.BDS_add_on_accessories?.products.length > 0
          ? product.associations.BDS_add_on_accessories.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_accessories",
        value: accessories,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_control_arms) {
      const arms =
        product.associations.BDS_add_on_control_arms?.products.length > 0
          ? product.associations.BDS_add_on_control_arms.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_control_arms",
        value: arms,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_required_hardware) {
      const hardware =
        product.associations.BDS_add_on_required_hardware?.products.length > 0
          ? product.associations.BDS_add_on_required_hardware.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_required_hardware",
        value: hardware,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_steering_stabilizers) {
      const stabilizers =
        product.associations.BDS_add_on_steering_stabilizers?.products.length >
        0
          ? product.associations.BDS_add_on_steering_stabilizers.products.join(
              ","
            )
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_steering_stabilizers",
        value: stabilizers,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_traction_bars) {
      const bars =
        product.associations.BDS_add_on_traction_bars?.products.length > 0
          ? product.associations.BDS_add_on_traction_bars.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_traction_bars",
        value: bars,
        type: "multi_line_text_field",
      });
    }

    if (product.values["1_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_tire_diameter/options/${product.values["1_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_tire_diameter/options/${product.values["2_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_tire_diameter/options/${product.values["3_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }

    if (product.values["1_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_wheel_diameter/options/${product.values["1_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_wheel_diameter/options/${product.values["2_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_wheel_diameter/options/${product.values["3_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }

    if (product.values["1_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_backspacing/options/${product.values["1_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_backspacing/options/${product.values["2_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_backspacing/options/${product.values["3_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }

    // Add Product Images
    if (images.productImages && images.productImages.length > 0) {
      for (const productImg of images.productImages) {
        variables.input.images.push({ altText: "", src: productImg });
      }
    }

    for (const category of product.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );

        if (
          categoryObj.parent === "BDS_productCategories" &&
          variables.input.customProductType === null
        ) {
          variables.input.customProductType = categoryObj.labels.en_US;
        }
      }
    }

    // console.log(JSON.stringify(variables, null, 2));

    resolve(
      makeApiRequests(process.env.BDS_GRAPHQL_URL, mutation, secret, variables)
    );
  });
};

const createShopifyVariantProduct = async (
  productObj,
  tags,
  cloudinaryImages,
  secret,
  access_token
) => {
  return new Promise(async (resolve) => {
    const product = productObj.product;
    const variants = productObj.variants;
    const variables = {
      input: {
        title: product.values.title
          ? product.values.title[0].data
          : "No Title Available",
        descriptionHtml: product.values.SDC_MKT_Description_body
          ? product.values.SDC_MKT_Description_body[0].data
          : "No Description Available",
        vendor: "No Brand Available",
        tags: tags,
        images: [],
        customProductType: null,
        published: true,
        metafields: [],
        options: [],
        variants: [],
      },
    };

    const mutation = `mutation productCreate($input: ProductInput!) {
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

    const resData = await getAkeneoData(
      `${process.env.AKENEO_API_URI}families/${product.family}/variants/${product.family_variant}`,
      access_token
    );

    const options = [];
    for (const attribute of resData.variant_attribute_sets) {
      for (const axe of attribute.axes) {
        options.push(axe);
        variables.input.options.push(formatOption(axe));
      }
    }

    // Product Vendor
    if (
      product.values.stusa_brand &&
      product.values.stusa_brand[0].data === "bds"
    ) {
      variables.input.vendor = "BDS Suspension";
    }

    if (product.values.zn_fitment) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "fitment_details",
        value:
          product.values.zn_fitment[0].data.toString().replace(/"/g, "") ||
          "No Fitment Available",
        type: "single_line_text_field",
      });
    }
    if (product.values.zn_importantNotes) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "important_notes",
        value:
          product.values.zn_importantNotes[0].data ||
          "No Important Note Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.zn_installation_instructions) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "instructions",
        value:
          product.values.zn_installation_instructions[0].data
            .toString()
            .replace(/"/g, "") || "No Instiallation Instruction Available",
        type: "single_line_text_field",
      });
    }
    if (product.values.zn_installation_guides) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "guides",
        value: await getInstallation(
          "zn_installation_guides",
          product.values.zn_installation_guides[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }
    if (product.values.zn_installation_time) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "time",
        value: await getInstallation(
          "zn_installation_time",
          product.values.zn_installation_time[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }
    if (product.values.zn_installation_difficulty) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "difficulty",
        value: formatOption(product.values.zn_installation_difficulty[0].data),
        type: "single_line_text_field",
      });
    }
    if (product.values.zn_installation_tools) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "tools",
        value: await getInstallation(
          "zn_installation_tools",
          product.values.zn_installation_tools[0].data,
          access_token
        ),
        type: "single_line_text_field",
      });
    }
    if (product.values.SDC_FAB_zn_features) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "product_features",
        value:
          product.values.SDC_FAB_zn_features[0].data ||
          "No Product Features Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.meta_title) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "meta_title",
        value:
          product.values.meta_title[0].data.toString().replace(/"/g, "") ||
          "No Meta Title Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.meta_description) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "meta_description",
        value:
          product.values.meta_description[0].data
            .toString()
            .replace(/"/g, "") || "No Meta Description Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.help_text_1) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "help_text_1",
        value:
          product.values.help_text_1[0].data || "No Meta Description Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.help_text_2) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "help_text_2",
        value:
          product.values.help_text_2[0].data || "No Meta Description Available",
        type: "multi_line_text_field",
      });
    }
    if (product.values.help_text_3) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "help_text_3",
        value:
          product.values.help_text_3[0].data || "No Meta Description Available",
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on) {
      const addOnsValue =
        product.associations.BDS_add_on?.products.length > 0
          ? product.associations.BDS_add_on.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_ons",
        value: addOnsValue,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_accessories) {
      const accessories =
        product.associations.BDS_add_on_accessories?.products.length > 0
          ? product.associations.BDS_add_on_accessories.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_accessories",
        value: accessories,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_control_arms) {
      const arms =
        product.associations.BDS_add_on_control_arms?.products.length > 0
          ? product.associations.BDS_add_on_control_arms.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_control_arms",
        value: arms,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_required_hardware) {
      const hardware =
        product.associations.BDS_add_on_required_hardware?.products.length > 0
          ? product.associations.BDS_add_on_required_hardware.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_required_hardware",
        value: hardware,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_steering_stabilizers) {
      const stabilizers =
        product.associations.BDS_add_on_steering_stabilizers?.products.length >
        0
          ? product.associations.BDS_add_on_steering_stabilizers.products.join(
              ","
            )
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_steering_stabilizers",
        value: stabilizers,
        type: "multi_line_text_field",
      });
    }
    if (product.associations.BDS_add_on_traction_bars) {
      const bars =
        product.associations.BDS_add_on_traction_bars?.products.length > 0
          ? product.associations.BDS_add_on_traction_bars.products.join(",")
          : "No Add Ons Available";
      variables.input.metafields.push({
        namespace: "pim",
        key: "add_on_traction_bars",
        value: bars,
        type: "multi_line_text_field",
      });
    }

    if (product.values["1_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_tire_diameter/options/${product.values["1_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_tire_diameter/options/${product.values["2_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_tire_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_tire_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_tire_diameter/options/${product.values["3_tire_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Max Tire Size Available",
        type: "single_line_text_field",
      });
    }

    if (product.values["1_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_wheel_diameter/options/${product.values["1_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_wheel_diameter/options/${product.values["2_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_wheel_diameter"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_wheel_diameter",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_wheel_diameter/options/${product.values["3_wheel_diameter"][0].data}`,
              access_token
            )
          ).labels.en_US || "No Wheel Diameter Available",
        type: "single_line_text_field",
      });
    }

    if (product.values["1_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "1_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/1_backspacing/options/${product.values["1_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["2_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "2_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/2_backspacing/options/${product.values["2_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }
    if (product.values["3_backspacing"]) {
      variables.input.metafields.push({
        namespace: "pim",
        key: "3_backspacing",
        value:
          (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/3_backspacing/options/${product.values["3_backspacing"][0].data}`,
              access_token
            )
          ).labels.en_US || "No BackSpace Available",
        type: "single_line_text_field",
      });
    }

    if (
      cloudinaryImages.productImages &&
      cloudinaryImages.productImages.length > 0
    ) {
      for (const image of cloudinaryImages.productImages) {
        variables.input.images.push({ altText: "", src: image });
      }
    }

    for (let k = 0; k < variants.length; k++) {
      let eachVariant = {
        sku: variants[k].identifier,
        options: [],
        position: k + 1,
        price: variants[k].values.price
          ? variants[k].values.price[0].data[0].amount
          : "0.00",
        weight: variants[k].values.weight
          ? Number(variants[k].values.weight[0].data.amount)
          : 0.0,
        barcode: variants[k].values.PVG_UPC
          ? Math.trunc(Number(variants[k].values.PVG_UPC[0].data)).toString()
          : null,
        metafields: [],
        imageSrc: "",
      };

      for (const option of options) {
        if (variants[k].values[option]) {
          const op = await getAkeneoData(
            `${process.env.AKENEO_API_URI}attributes/${option}/options/${variants[k].values[option][0].data}`,
            access_token
          );
          eachVariant.options.push(op.labels.en_US);
        } else {
          eachVariant.options.push("");
        }
      }

      if (variants[k].values.zn_fitment) {
        eachVariant.metafields.push({
          namespace: "pim",
          key: "fitment_details",
          value:
            variants[k].values.zn_fitment[0].data
              .toString()
              .replace(/"/g, "") || "No Fitment Available",
          type: "single_line_text_field",
        });
      }

      if (product.categories.toString().includes("Kits")) {
        const specification =
          "<ul>" +
          "<li>Front Lift Method : " +
          (variants[k].values.PVG_BDS_Front_Lift_Method
            ? (
                await getAkeneoData(
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Method/options/${variants[k].values.PVG_BDS_Front_Lift_Method[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Front Lift Method") +
          "</li>" +
          "<li>Rear Lift Method : " +
          (variants[k].values.PVG_BDS_Rear_Lift_Method
            ? (
                await getAkeneoData(
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Method/options/${variants[k].values.PVG_BDS_Rear_Lift_Method[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Rear Lift Method") +
          "</li>" +
          "<li>Shocks Included : " +
          (variants[k].values.PVG_BDS_Shocks_Included
            ? variants[k].values.PVG_BDS_Shocks_Included[0].data === true
              ? "Yes"
              : "No"
            : "No Shocks Included") +
          "</li>" +
          "<li>Front Lift Height : " +
          (variants[k].values.PVG_BDS_Front_Lift_Height
            ? (
                await getAkeneoData(
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Height/options/${variants[k].values.PVG_BDS_Front_Lift_Height[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Front Lift Height") +
          "</li>" +
          "<li>Rear Lift Height : " +
          (variants[k].values.PVG_BDS_Rear_Lift_Height
            ? (
                await getAkeneoData(
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Height/options/${variants[k].values.PVG_BDS_Rear_Lift_Height[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Rear Lift Height") +
          "</li>" +
          "</ul>";

        eachVariant.metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      } else if (product.categories.toString().includes("Shocks")) {
        const specification =
          "<ul>" +
          "<li>Type : Shocks</li>" +
          "<li>Lower Mount Type : " +
          (variants[k].values.PVG_BDS_Lower_Mount_Type
            ? (
                await getAkeneoData(
                  "GET",
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Lower_Mount_Type/options/${variants[k].values.PVG_BDS_Lower_Mount_Type[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Lower Mount Type") +
          "</li>" +
          "<li>Upper Mount Type : " +
          (variants[k].values.PVG_BDS_Upper_Mount_Code
            ? (
                await getAkeneoData(
                  "GET",
                  `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Upper_Mount_Code/options/${variants[k].values.PVG_BDS_Upper_Mount_Code[0].data}`,
                  access_token
                )
              ).labels.en_US
            : "No Upper Mount Type") +
          "</li>" +
          "<li>Gas Charged : " +
          (variants[k].values.PVG_BDS_Gas_Charged
            ? variants[k].values.PVG_BDS_Gas_Charged[0].data
            : "No Gas Charged") +
          "</li>" +
          "<li>Adjustable : " +
          (variants[k].values.PVG_BDS_Adjustable
            ? variants[k].values.PVG_BDS_Adjustable[0].data
            : "No Adjustable") +
          "</li>" +
          "<li>Adjustable Dampening : " +
          (variants[k].values.PVG_BDS_Adjustable_Dampening
            ? variants[k].values.PVG_BDS_Adjustable_Dampening[0].data
            : "No Adjustable Dampening") +
          "</li>" +
          "<li>Compressed Length : " +
          (variants[k].values.PVG_BDS_Compressed_Length
            ? variants[k].values.PVG_BDS_Compressed_Length[0].data.amount +
              " " +
              variants[k].values.PVG_BDS_Compressed_Length[0].data.unit
            : "No Compressed Length") +
          "</li>" +
          "<li>Travel Length : " +
          (variants[k].values.PVG_BDS_Travel_Length
            ? variants[k].values.PVG_BDS_Travel_Length[0].data.amount +
              " " +
              variants[k].values.PVG_BDS_Travel_Length[0].data.unit
            : "No Travel Length") +
          "</li>" +
          "<li>Shaft Diameter : " +
          (variants[k].values.PVG_BDS_Shaft_Diameter
            ? variants[k].values.PVG_BDS_Shaft_Diameter[0].data
            : "No Shaft Diameter") +
          "</li>" +
          "</ul>";

        eachVariant.metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      }

      const vImgs = cloudinaryImages.variantImages.filter(
        (i) => i.sku === variants[k].identifier
      )[0];

      if (vImgs && vImgs.images.length > 0) {
        eachVariant.imageSrc = vImgs.images[0];
        variables.input.images.push({ altText: "", src: vImgs.images[0] });
      }

      variables.input.variants.push(eachVariant);
    }

    for (const category of product.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );

        if (
          categoryObj.parent === "BDS_productCategories" &&
          variables.input.customProductType === null
        ) {
          variables.input.customProductType = categoryObj.labels.en_US;
        }
      }
    }

    // console.log(JSON.stringify(variables, null, 2));

    resolve(
      makeApiRequests(process.env.BDS_GRAPHQL_URL, mutation, secret, variables)
    );
  });
};

const updateShopifyProducts = async (
  shopifyProduct,
  akeneoProduct,
  tags,
  images,
  secret,
  access_token
) => {
  return new Promise(async (resolve) => {
    const variables = {
      input: {
        id: shopifyProduct.node.id,
        title: akeneoProduct.values.title
          ? akeneoProduct.values.title[0].data
          : "No Title Available",
        descriptionHtml: akeneoProduct.values.SDC_MKT_Description_body
          ? akeneoProduct.values.SDC_MKT_Description_body[0].data
          : "No Description Available",
        tags: tags,
        customProductType: null,
        images: [],
        metafields: [],
        variants: [
          {
            id: shopifyProduct.node.variants.edges[0].node.id,
            title: akeneoProduct.values.title
              ? akeneoProduct.values.title[0].data
              : "No Title Available",
            metafields: [],
          },
        ],
      },
    };

    const mutation = `mutation productUpdate($input: ProductInput!) {
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

    if (images.productImages && images.productImages.length > 0) {
      for (const productImg of images.productImages) {
        variables.input.images.push({ altText: "", src: productImg });
      }
    }

    for (const category of akeneoProduct.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );

        if (
          categoryObj.parent === "BDS_productCategories" &&
          variables.input.customProductType === null
        ) {
          variables.input.customProductType = categoryObj.labels.en_US;
        }
      }
    }

    if (akeneoProduct.values.zn_installation_guides) {
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "guides"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "guides"
          )[0].node.id,
          value: await getInstallation(
            "zn_installation_guides",
            akeneoProduct.values.zn_installation_guides[0].data,
            access_token
          ),
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "guides",
          value: await getInstallation(
            "zn_installation_guides",
            akeneoProduct.values.zn_installation_guides[0].data,
            access_token
          ),
          type: "single_line_text_field",
        });
      }
    }

    if (akeneoProduct.values.zn_importantNotes) {
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "important_notes"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "important_notes"
          )[0].node.id,
          value: akeneoProduct.values.zn_importantNotes[0].data,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "important_notes",
          value: akeneoProduct.values.zn_importantNotes[0].data,
          type: "multi_line_text_field",
        });
      }
    }

    if (akeneoProduct.values.zn_fitment) {
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "fitment_details"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "fitment_details"
          )[0].node.id,
          value: akeneoProduct.values.zn_fitment[0].data
            .toString()
            .replace(/"/g, ""),
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "fitment_details",
          value: akeneoProduct.values.zn_fitment[0].data
            .toString()
            .replace(/"/g, ""),
          type: "single_line_text_field",
        });
      }

      if (
        shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
          (m) => m.node.key === "fitment_details"
        ).length > 0
      ) {
        variables.input.variants[0].metafields.push({
          id: shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
            (m) => m.node.key === "fitment_details"
          )[0].node.id,
          value: akeneoProduct.values.zn_fitment[0].data
            .toString()
            .replace(/"/g, ""),
        });
      } else {
        variables.input.variants[0].metafields.push({
          namespace: "pim",
          key: "fitment_details",
          value: akeneoProduct.values.zn_fitment[0].data
            .toString()
            .replace(/"/g, ""),
          type: "single_line_text_field",
        });
      }
    }

    if (akeneoProduct.values.SDC_FAB_zn_features) {
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "product_features"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "product_features"
          )[0].node.id,
          value:
            akeneoProduct.values.SDC_FAB_zn_features[0].data ||
            "No Product Features Available",
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "product_features",
          value:
            akeneoProduct.values.SDC_FAB_zn_features[0].data ||
            "No Product Features Available",
          type: "multi_line_text_field",
        });
      }
    }

    if (akeneoProduct.associations.BDS_add_on) {
      const addOnsValue =
        akeneoProduct.associations.BDS_add_on?.products.length > 0
          ? akeneoProduct.associations.BDS_add_on.products.join(",")
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_ons"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_ons"
          )[0].node.id,
          value: addOnsValue,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_ons",
          value: addOnsValue,
          type: "multi_line_text_field",
        });
      }
    }
    if (akeneoProduct.associations.BDS_add_on_accessories) {
      const accessories =
        akeneoProduct.associations.BDS_add_on_accessories?.products.length > 0
          ? akeneoProduct.associations.BDS_add_on_accessories.products.join(",")
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_accessories"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_accessories"
          )[0].node.id,
          value: accessories,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_accessories",
          value: accessories,
          type: "multi_line_text_field",
        });
      }
    }
    if (akeneoProduct.associations.BDS_add_on_control_arms) {
      const arms =
        akeneoProduct.associations.BDS_add_on_control_arms?.products.length > 0
          ? akeneoProduct.associations.BDS_add_on_control_arms.products.join(
              ","
            )
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_control_arms"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_control_arms"
          )[0].node.id,
          value: arms,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_control_arms",
          value: arms,
          type: "multi_line_text_field",
        });
      }
    }
    if (akeneoProduct.associations.BDS_add_on_required_hardware) {
      const hardware =
        akeneoProduct.associations.BDS_add_on_required_hardware?.products
          .length > 0
          ? akeneoProduct.associations.BDS_add_on_required_hardware.products.join(
              ","
            )
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_required_hardware"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_required_hardware"
          )[0].node.id,
          value: hardware,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_required_hardware",
          value: hardware,
          type: "multi_line_text_field",
        });
      }
    }
    if (akeneoProduct.associations.BDS_add_on_steering_stabilizers) {
      const stabilizers =
        akeneoProduct.associations.BDS_add_on_steering_stabilizers?.products
          .length > 0
          ? akeneoProduct.associations.BDS_add_on_steering_stabilizers.products.join(
              ","
            )
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_steering_stabilizers"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_steering_stabilizers"
          )[0].node.id,
          value: stabilizers,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_steering_stabilizers",
          value: stabilizers,
          type: "multi_line_text_field",
        });
      }
    }
    if (akeneoProduct.associations.BDS_add_on_traction_bars) {
      const bars =
        akeneoProduct.associations.BDS_add_on_traction_bars?.products.length > 0
          ? akeneoProduct.associations.BDS_add_on_traction_bars.products.join(
              ","
            )
          : "No Add Ons Available";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_traction_bars"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_traction_bars"
          )[0].node.id,
          value: bars,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_traction_bars",
          value: bars,
          type: "multi_line_text_field",
        });
      }
    }

    if (akeneoProduct.categories.toString().includes("Kits")) {
      const specification =
        "<ul>" +
        "<li>Front Lift Method : " +
        (akeneoProduct.values.PVG_BDS_Front_Lift_Method
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Method/options/${akeneoProduct.values.PVG_BDS_Front_Lift_Method[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Front Lift Method") +
        "</li>" +
        "<li>Rear Lift Method : " +
        (akeneoProduct.values.PVG_BDS_Rear_Lift_Method
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Method/options/${akeneoProduct.values.PVG_BDS_Rear_Lift_Method[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Rear Lift Method") +
        "</li>" +
        "<li>Shocks Included : " +
        (akeneoProduct.values.PVG_BDS_Shocks_Included
          ? akeneoProduct.values.PVG_BDS_Shocks_Included[0].data === true
            ? "Yes"
            : "No"
          : "No Shocks Included") +
        "</li>" +
        "<li>Front Lift Height : " +
        (akeneoProduct.values.PVG_BDS_Front_Lift_Height
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Height/options/${akeneoProduct.values.PVG_BDS_Front_Lift_Height[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Front Lift Height") +
        "</li>" +
        "<li>Rear Lift Height : " +
        (akeneoProduct.values.PVG_BDS_Rear_Lift_Height
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Height/options/${akeneoProduct.values.PVG_BDS_Rear_Lift_Height[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Rear Lift Height") +
        "</li>" +
        "</ul>";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "specification"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "specification"
          )[0].node.id,
          value: specification,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      }

      if (
        shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
          (m) => m.node.key === "specification"
        ).length > 0
      ) {
        variables.input.variants[0].metafields.push({
          id: shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
            (m) => m.node.key === "specification"
          )[0].node.id,
          value: specification,
        });
      } else {
        variables.input.variants[0].metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      }
    } else if (akeneoProduct.categories.toString().includes("Shocks")) {
      const specification =
        "<ul>" +
        "<li>Type : Shocks</li>" +
        "<li>Lower Mount Type : " +
        (akeneoProduct.values.PVG_BDS_Lower_Mount_Type
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Lower_Mount_Type/options/${akeneoProduct.values.PVG_BDS_Lower_Mount_Type[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Lower Mount Type") +
        "</li>" +
        "<li>Upper Mount Type : " +
        (akeneoProduct.values.PVG_BDS_Upper_Mount_Code
          ? (
              await getAkeneoData(
                `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Upper_Mount_Code/options/${akeneoProduct.values.PVG_BDS_Upper_Mount_Code[0].data}`,
                access_token
              )
            ).labels.en_US
          : "No Upper Mount Type") +
        "</li>" +
        "<li>Gas Charged : " +
        (akeneoProduct.values.PVG_BDS_Gas_Charged
          ? akeneoProduct.values.PVG_BDS_Gas_Charged[0].data
          : "No Gas Charged") +
        "</li>" +
        "<li>Adjustable : " +
        (akeneoProduct.values.PVG_BDS_Adjustable
          ? akeneoProduct.values.PVG_BDS_Adjustable[0].data
          : "No Adjustable") +
        "</li>" +
        "<li>Adjustable Dampening : " +
        (akeneoProduct.values.PVG_BDS_Adjustable_Dampening
          ? akeneoProduct.values.PVG_BDS_Adjustable_Dampening[0].data
          : "No Adjustable Dampening") +
        "</li>" +
        "<li>Compressed Length : " +
        (akeneoProduct.values.PVG_BDS_Compressed_Length
          ? akeneoProduct.values.PVG_BDS_Compressed_Length[0].data.amount +
            " " +
            akeneoProduct.values.PVG_BDS_Compressed_Length[0].data.unit
          : "No Compressed Length") +
        "</li>" +
        "<li>Travel Length : " +
        (akeneoProduct.values.PVG_BDS_Travel_Length
          ? akeneoProduct.values.PVG_BDS_Travel_Length[0].data.amount +
            " " +
            akeneoProduct.values.PVG_BDS_Travel_Length[0].data.unit
          : "No Travel Length") +
        "</li>" +
        "<li>Shaft Diameter : " +
        (akeneoProduct.values.PVG_BDS_Shaft_Diameter
          ? akeneoProduct.values.PVG_BDS_Shaft_Diameter[0].data
          : "No Shaft Diameter") +
        "</li>" +
        "</ul>";
      if (
        shopifyProduct.node.metafields.edges.filter(
          (m) => m.node.key === "specification"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: shopifyProduct.node.metafields.edges.filter(
            (m) => m.node.key === "specification"
          )[0].node.id,
          value: specification,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      }

      if (
        shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
          (m) => m.node.key === "specification"
        ).length > 0
      ) {
        variables.input.variants[0].metafields.push({
          id: shopifyProduct.node.variants.edges[0].node.metafields.edges.filter(
            (m) => m.node.key === "specification"
          )[0].node.id,
          value: specification,
        });
      } else {
        variables.input.variants[0].metafields.push({
          namespace: "pim",
          key: "specification",
          value: specification,
          type: "multi_line_text_field",
        });
      }
    }

    // console.log(JSON.stringify(variables, null, 2));

    resolve(
      makeApiRequests(process.env.BDS_GRAPHQL_URL, mutation, secret, variables)
    );
  });
};

const updateShopifyVariantProduct = async (
  sProduct,
  productObj,
  tags,
  cloudinaryImages,
  secret,
  access_token
) => {
  return new Promise(async (resolve) => {
    const product = productObj.product;
    const variants = productObj.variants;
    const variables = {
      input: {
        id: sProduct.node.id,
        title: product.values.title
          ? product.values.title[0].data
          : "No Title Available",
        descriptionHtml: product.values.SDC_MKT_Description_body
          ? product.values.SDC_MKT_Description_body[0].data
          : "No Description Available",
        tags: tags,
        customProductType: null,
        images: [],
        variants: [],
        options: [],
        metafields: [],
      },
    };

    const mutation = `mutation productUpdate($input: ProductInput!) {
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

    for (const category of product.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );

        if (
          categoryObj.parent === "BDS_productCategories" &&
          variables.input.customProductType === null
        ) {
          variables.input.customProductType = categoryObj.labels.en_US;
        }
      }
    }

    if (
      cloudinaryImages.productImages &&
      cloudinaryImages.productImages.length > 0
    ) {
      for (const productImg of cloudinaryImages.productImages) {
        variables.input.images.push({ altText: "", src: productImg });
      }
    }

    if (sProduct.node.variants.edges.length > 0) {
      for (const variant of sProduct.node.variants.edges) {
        const akeneoVariant = variants.filter(
          (v) => v.identifier === variant.node.sku
        )[0];
        let eachVariant = {
          id: variant.node.id,
          price: akeneoVariant.values.price
            ? akeneoVariant.values.price[0].data[0].amount
            : "0.00",
          sku: variant.node.sku,
          imageSrc: "",
          metafields: [],
        };
        const vImgs = cloudinaryImages.variantImages.filter(
          (i) => i.sku === variant.node.sku
        )[0];

        if (vImgs && vImgs.images.length > 0) {
          eachVariant.imageSrc = vImgs.images[0];
          variables.input.images.push({ altText: "", src: vImgs.images[0] });
        }

        if (akeneoVariant.values.zn_fitment) {
          if (
            variant.node.metafields.edges.filter(
              (m) => m.node.key === "fitment_details"
            ).length > 0
          ) {
            eachVariant.metafields.push({
              id: variant.node.metafields.edges.filter(
                (m) => m.node.key === "fitment_details"
              )[0].node.id,
              value:
                akeneoVariant.values.zn_fitment[0].data
                  .toString()
                  .replace(/"/g, "") || "No Fitment Available",
            });
          } else {
            eachVariant.metafields.push({
              namespace: "pim",
              key: "fitment_details",
              value:
                akeneoVariant.values.zn_fitment[0].data
                  .toString()
                  .replace(/"/g, "") || "No Fitment Available",
              type: "single_line_text_field",
            });
          }
        }

        if (product.categories.toString().includes("Kits")) {
          const specification =
            "<ul>" +
            "<li>Front Lift Method : " +
            (akeneoVariant.values.PVG_BDS_Front_Lift_Method
              ? (
                  await getAkeneoData(
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Method/options/${akeneoVariant.values.PVG_BDS_Front_Lift_Method[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Front Lift Method") +
            "</li>" +
            "<li>Rear Lift Method : " +
            (akeneoVariant.values.PVG_BDS_Rear_Lift_Method
              ? (
                  await getAkeneoData(
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Method/options/${akeneoVariant.values.PVG_BDS_Rear_Lift_Method[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Rear Lift Method") +
            "</li>" +
            "<li>Shocks Included : " +
            (akeneoVariant.values.PVG_BDS_Shocks_Included
              ? akeneoVariant.values.PVG_BDS_Shocks_Included[0].data === true
                ? "Yes"
                : "No"
              : "No Shocks Included") +
            "</li>" +
            "<li>Front Lift Height : " +
            (akeneoVariant.values.PVG_BDS_Front_Lift_Height
              ? (
                  await getAkeneoData(
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Front_Lift_Height/options/${akeneoVariant.values.PVG_BDS_Front_Lift_Height[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Front Lift Height") +
            "</li>" +
            "<li>Rear Lift Height : " +
            (akeneoVariant.values.PVG_BDS_Rear_Lift_Height
              ? (
                  await getAkeneoData(
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Rear_Lift_Height/options/${akeneoVariant.values.PVG_BDS_Rear_Lift_Height[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Rear Lift Height") +
            "</li>" +
            "</ul>";

          if (
            variant.node.metafields.edges.filter(
              (m) => m.node.key === "specification"
            ).length > 0
          ) {
            eachVariant.metafields.push({
              id: variant.node.metafields.edges.filter(
                (m) => m.node.key === "specification"
              )[0].node.id,
              value: specification,
            });
          } else {
            eachVariant.metafields.push({
              namespace: "pim",
              key: "specification",
              value: specification,
              type: "multi_line_text_field",
            });
          }
        } else if (product.categories.toString().includes("Shocks")) {
          const specification =
            "<ul>" +
            "<li>Type : Shocks</li>" +
            "<li>Lower Mount Type : " +
            (akeneoVariant.values.PVG_BDS_Lower_Mount_Type
              ? (
                  await getAkeneoData(
                    "GET",
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Lower_Mount_Type/options/${akeneoVariant.values.PVG_BDS_Lower_Mount_Type[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Lower Mount Type") +
            "</li>" +
            "<li>Upper Mount Type : " +
            (akeneoVariant.values.PVG_BDS_Upper_Mount_Code
              ? (
                  await getAkeneoData(
                    "GET",
                    `${process.env.AKENEO_API_URI}attributes/PVG_BDS_Upper_Mount_Code/options/${akeneoVariant.values.PVG_BDS_Upper_Mount_Code[0].data}`,
                    access_token
                  )
                ).labels.en_US
              : "No Upper Mount Type") +
            "</li>" +
            "<li>Gas Charged : " +
            (akeneoVariant.values.PVG_BDS_Gas_Charged
              ? akeneoVariant.values.PVG_BDS_Gas_Charged[0].data
              : "No Gas Charged") +
            "</li>" +
            "<li>Adjustable : " +
            (akeneoVariant.values.PVG_BDS_Adjustable
              ? akeneoVariant.values.PVG_BDS_Adjustable[0].data
              : "No Adjustable") +
            "</li>" +
            "<li>Adjustable Dampening : " +
            (akeneoVariant.values.PVG_BDS_Adjustable_Dampening
              ? akeneoVariant.values.PVG_BDS_Adjustable_Dampening[0].data
              : "No Adjustable Dampening") +
            "</li>" +
            "<li>Compressed Length : " +
            (akeneoVariant.values.PVG_BDS_Compressed_Length
              ? akeneoVariant.values.PVG_BDS_Compressed_Length[0].data.amount +
                " " +
                akeneoVariant.values.PVG_BDS_Compressed_Length[0].data.unit
              : "No Compressed Length") +
            "</li>" +
            "<li>Travel Length : " +
            (akeneoVariant.values.PVG_BDS_Travel_Length
              ? akeneoVariant.values.PVG_BDS_Travel_Length[0].data.amount +
                " " +
                akeneoVariant.values.PVG_BDS_Travel_Length[0].data.unit
              : "No Travel Length") +
            "</li>" +
            "<li>Shaft Diameter : " +
            (akeneoVariant.values.PVG_BDS_Shaft_Diameter
              ? akeneoVariant.values.PVG_BDS_Shaft_Diameter[0].data
              : "No Shaft Diameter") +
            "</li>" +
            "</ul>";

          if (
            variant.node.metafields.edges.filter(
              (m) => m.node.key === "specification"
            ).length > 0
          ) {
            eachVariant.metafields.push({
              id: variant.node.metafields.edges.filter(
                (m) => m.node.key === "specification"
              )[0].node.id,
              value: specification,
            });
          } else {
            eachVariant.metafields.push({
              namespace: "pim",
              key: "specification",
              value: specification,
              type: "multi_line_text_field",
            });
          }
        }

        variables.input.variants.push(eachVariant);
      }
    }

    if (product.values.zn_installation_guides) {
      if (
        sProduct.node.metafields.edges.filter((m) => m.node.key === "guides")
          .length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "guides"
          )[0].node.id,
          value: await getInstallation(
            "zn_installation_guides",
            product.values.zn_installation_guides[0].data,
            access_token
          ),
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "guides",
          value: await getInstallation(
            "zn_installation_guides",
            product.values.zn_installation_guides[0].data,
            access_token
          ),
          type: "single_line_text_field",
        });
      }
    }

    if (product.values.zn_importantNotes) {
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "important_notes"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "important_notes"
          )[0].node.id,
          value:
            product.values.zn_importantNotes[0].data ||
            "No Important Note Available",
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "important_notes",
          value:
            product.values.zn_importantNotes[0].data ||
            "No Important Note Available",
          type: "multi_line_text_field",
        });
      }
    }

    if (product.values.SDC_FAB_zn_features) {
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "product_features"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "product_features"
          )[0].node.id,
          value:
            product.values.SDC_FAB_zn_features[0].data ||
            "No Product Features Available",
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "product_features",
          value:
            product.values.SDC_FAB_zn_features[0].data ||
            "No Product Features Available",
          type: "multi_line_text_field",
        });
      }
    }

    if (product.associations.BDS_add_on) {
      const addOnsValue =
        product.associations.BDS_add_on?.products.length > 0
          ? product.associations.BDS_add_on.products.join(",")
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter((m) => m.node.key === "add_ons")
          .length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_ons"
          )[0].node.id,
          value: addOnsValue,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_ons",
          value: addOnsValue,
          type: "multi_line_text_field",
        });
      }
    }
    if (product.associations.BDS_add_on_accessories) {
      const accessories =
        product.associations.BDS_add_on_accessories?.products.length > 0
          ? product.associations.BDS_add_on_accessories.products.join(",")
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_accessories"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_accessories"
          )[0].node.id,
          value: accessories,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_accessories",
          value: accessories,
          type: "multi_line_text_field",
        });
      }
    }
    if (product.associations.BDS_add_on_control_arms) {
      const arms =
        product.associations.BDS_add_on_control_arms?.products.length > 0
          ? product.associations.BDS_add_on_control_arms.products.join(",")
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_control_arms"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_control_arms"
          )[0].node.id,
          value: arms,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_control_arms",
          value: arms,
          type: "multi_line_text_field",
        });
      }
    }
    if (product.associations.BDS_add_on_required_hardware) {
      const hardware =
        product.associations.BDS_add_on_required_hardware?.products.length > 0
          ? product.associations.BDS_add_on_required_hardware.products.join(",")
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_required_hardware"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_required_hardware"
          )[0].node.id,
          value: hardware,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_required_hardware",
          value: hardware,
          type: "multi_line_text_field",
        });
      }
    }
    if (product.associations.BDS_add_on_steering_stabilizers) {
      const stabilizers =
        product.associations.BDS_add_on_steering_stabilizers?.products.length >
        0
          ? product.associations.BDS_add_on_steering_stabilizers.products.join(
              ","
            )
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_steering_stabilizers"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_steering_stabilizers"
          )[0].node.id,
          value: stabilizers,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_steering_stabilizers",
          value: stabilizers,
          type: "multi_line_text_field",
        });
      }
    }
    if (product.associations.BDS_add_on_traction_bars) {
      const bars =
        product.associations.BDS_add_on_traction_bars?.products.length > 0
          ? product.associations.BDS_add_on_traction_bars.products.join(",")
          : "No Add Ons Available";
      if (
        sProduct.node.metafields.edges.filter(
          (m) => m.node.key === "add_on_traction_bars"
        ).length > 0
      ) {
        variables.input.metafields.push({
          id: sProduct.node.metafields.edges.filter(
            (m) => m.node.key === "add_on_traction_bars"
          )[0].node.id,
          value: bars,
        });
      } else {
        variables.input.metafields.push({
          namespace: "pim",
          key: "add_on_traction_bars",
          value: bars,
          type: "multi_line_text_field",
        });
      }
    }

    // console.log(JSON.stringify(variables, null, 2));

    // const productUpdated = await makeGraphQlRequest(process.env.BDS_GRAPHQL_URL, mutation, secret, variables);
    // resolve(await addProductToHeadless(productUpdated.data.productUpdate.product.id, process.env.BDS_HEADLESS_ACCESS_TOKEN));
    resolve(
      makeApiRequests(process.env.BDS_GRAPHQL_URL, mutation, secret, variables)
    );
  });
};

module.exports = {
  createShopifyProducts,
  updateShopifyProducts,
  createShopifyVariantProduct,
  updateShopifyVariantProduct,
};
