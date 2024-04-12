const { getAkeneoData } = require("../Akeneo/GetData");

const createProductTags = async (product, access_token) => {
  const mergedProductsArray = [];

  const createTagsFromProductAttributes = async () => {
    const productAttributes = {
      price: product.values.price,
      stusa_brand: product.values.stusa_brand,
      PVG_BDS_Type: product.values.PVG_BDS_Type,
      PVG_BDS_Rear_Lift_Height: product.values.PVG_BDS_Rear_Lift_Height,
      PVG_BDS_Rear_Lift_Method: product.values.PVG_BDS_Rear_Lift_Method,
      PVG_BDS_Front_Lift_Height: product.values.PVG_BDS_Front_Lift_Height,
      PVG_BDS_Front_Lift_Method: product.values.PVG_BDS_Front_Lift_Method,
      PVG_BDS_Series: product.values.PVG_BDS_Series,
      PVG_BDS_Adjustable: product.values.PVG_BDS_Adjustable,
      PVG_BDS_Adjustable_Damping: product.values.PVG_BDS_Adjustable_Damping,
      PVG_BDS_Lift_Height: product.values.PVG_BDS_Lift_Height,
      PVG_BDS_Compressed_Length: product.values.PVG_BDS_Compressed_Length,
      PVG_BDS_Extended_Length: product.values.PVG_BDS_Extended_Length,
      PVG_BDS_Travel_Length: product.values.PVG_BDS_Travel_Length,
      PVG_BDS_Position: product.values.PVG_BDS_Position,
      PVG_BDS_Maximum_Lift: product.values.PVG_BDS_Maximum_Lift,
      jks_Product_Type_II: product.values.jks_Product_Type_II,
      "1_tire_diameter": product.values["1_tire_diameter"],
      "2_tire_diameter": product.values["2_tire_diameter"],
      "3_tire_diameter": product.values["3_tire_diameter"],
    };

    const tier2_parents = [
      "BDS_Kits",
      "PVG_BDS_ShocksandCoilovers",
      "Suspension_Parts",
      "BDS_Lifestyle",
      "BDS_More",
    ];

    const productTagsArray = [];

    for (const key in productAttributes) {
      const attribute = productAttributes[key];
      if (
        attribute &&
        attribute[0] &&
        attribute[0].data !== null &&
        attribute[0].data !== undefined
      ) {
        if (key === "price") {
          productTagsArray.push(attribute[0].data[0].amount);
          productTagsArray.push("Price:" + attribute[0].data[0].amount);
        } else if (key === "stusa_brand") {
          const upperCaseData = attribute[0].data.toUpperCase();
          if (upperCaseData.includes("FOX")) {
            productTagsArray.push("FOX", "Brand:FOX");
          } else {
            productTagsArray.push(upperCaseData, "Brand:" + upperCaseData);
          }
        } else if (
          key === "PVG_BDS_Adjustable" ||
          key === "PVG_BDS_Adjustable_Damping" ||
          key === "PVG_BDS_Compressed_Length" ||
          key === "PVG_BDS_Extended_Length" ||
          key === "PVG_BDS_Travel_Length" ||
          key === "PVG_BDS_Maximum_Lift" ||
          key === "PVG_BDS_Position"
        ) {
          if (
            key === "PVG_BDS_Compressed_Length" ||
            key === "PVG_BDS_Extended_Length" ||
            key === "PVG_BDS_Travel_Length" ||
            key === "PVG_BDS_Maximum_Lift"
          ) {
            productTagsArray.push(attribute[0].data.amount);
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data.amount
            );
          } else if (
            key === "PVG_BDS_Adjustable" ||
            key === "PVG_BDS_Adjustable_Damping"
          ) {
            productTagsArray.push(attribute[0].data ? "Yes" : "No");
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data
                ? "Yes"
                : "No"
            );
          } else {
            productTagsArray.push(attribute[0].data);
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data
            );
          }
        } else if (key === "jks_Product_Type_II") {
          for (const item of attribute[0].data) {
            productTagsArray.push(item.replace("_", "-"));
          }
        } else {
          const tag = (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/${key}/options/${attribute[0].data}`,
              access_token
            )
          ).labels.en_US;
          if (
            key === "1_tire_diameter" ||
            key === "2_tire_diameter" ||
            key === "3_tire_diameter"
          ) {
            productTagsArray.push("Max Tire Size:" + tag);
          } else {
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") + ":" + tag
            );
          }
        }
      }
    }

    let tier2_tag = null;
    let categoryArray = [];

    for (const category of product.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );
        if (categoryObj) {
          if (tier2_parents.includes(categoryObj.parent)) {
            productTagsArray.push("tier2:" + categoryObj.labels.en_US);
            productTagsArray.push(categoryObj.labels.en_US);
            tier2_tag = category;
          } else {
            productTagsArray.push(categoryObj.labels.en_US);
          }

          categoryArray.push({
            parent: categoryObj.parent,
            label: categoryObj.labels.en_US,
          });
        }
      }
    }

    if (categoryArray.filter((c) => c.parent === tier2_tag).length > 0) {
      productTagsArray.push(
        "tier3:" + categoryArray.filter((c) => c.parent === tier2_tag)[0].label
      );
    }

    productTagsArray.push(product.identifier.replace(/BDS|FOX|JKS/g, ""));

    const productTagObj = {
      [product.identifier]: productTagsArray.filter(
        (item, index) => productTagsArray.indexOf(item) === index
      ),
    };

    mergedProductsArray.push(productTagObj);
    createTagsFromFitment();
  };

  const createTagsFromFitment = () => {
    let productFitmentString;
    if (product.values.zn_fitment) {
      productFitmentString = product.values.zn_fitment[0].data;

      const fitmentStringArr = productFitmentString.split(";");
      const fitmentTagsArray = [];
      const fitmentYearsArray = [];
      let productRecordExists = false;

      for (const fitmentItem of fitmentStringArr) {
        const items = fitmentItem.split("|");
        for (let i = 0; i < items.length; i++) {
          if (items[i] !== "X") {
            if (!fitmentTagsArray.includes(items[i]) && items[i] !== "0") {
              if (items[i].includes("Ram")) {
                fitmentTagsArray.push(items[i].toUpperCase());
              } else {
                fitmentTagsArray.push(items[i]);
              }
            }
            if (
              !fitmentYearsArray.includes(items[i]) &&
              !isNaN(Number(items[i])) &&
              i === 0
            ) {
              fitmentYearsArray.push(items[i]);
            }
          } else {
            if (i === 4) {
              if (!fitmentTagsArray.includes("4WD")) {
                fitmentTagsArray.push("4WD");
              } else if (!fitmentTagsArray.includes("RWD")) {
                fitmentTagsArray.push("RWD");
              } else if (!fitmentTagsArray.includes("AWD")) {
                fitmentTagsArray.push("AWD");
              }
            } else if (i === 5) {
              if (!fitmentTagsArray.includes("FLEX")) {
                fitmentTagsArray.push("FLEX");
              } else if (!fitmentTagsArray.includes("GAS")) {
                fitmentTagsArray.push("GAS");
              } else if (!fitmentTagsArray.includes("DIESEL")) {
                fitmentTagsArray.push("DIESEL");
              }
            } else if (i === 6) {
              if (!fitmentTagsArray.includes("2DR")) {
                fitmentTagsArray.push("2DR");
              } else if (!fitmentTagsArray.includes("4DR")) {
                fitmentTagsArray.push("4DR");
              }
            }
          }
        }
      }

      const yearRange =
        fitmentYearsArray.length > 1
          ? createYearRangeTag(fitmentYearsArray)
          : fitmentYearsArray[0] ?? "No Year";

      if (!fitmentTagsArray.includes(yearRange)) {
        fitmentTagsArray.push(yearRange);
      }

      const productTagObj = {
        [product.identifier]: fitmentTagsArray.filter(
          (item, index) => fitmentTagsArray.indexOf(item) === index
        ),
      };

      for (const [key, value] of Object.entries(mergedProductsArray)) {
        if (value[product.identifier]) {
          for (let i = 0; i < productTagObj[product.identifier].length; i++) {
            const tag = productTagObj[product.identifier][i];
            if (tag) {
              mergedProductsArray[key][product.identifier].push(tag);
            }
          }
          productRecordExists = true;
          return;
        }
      }

      if (!productRecordExists) {
        mergedProductsArray.push(productTagObj);
      }
    }
  };

  function createYearRangeTag(years) {
    const sortedYears = [...new Set(years)].sort((a, b) => a - b);
    const ranges = sortedYears.reduce(
      (acc, year) => {
        const prevYear = acc.prevYear ?? year;
        if (year - prevYear > 1) {
          acc.ranges.push(
            acc.rangeStarted === prevYear
              ? String(prevYear)
              : `${acc.rangeStarted}-${prevYear}`
          );
          acc.rangeStarted = year;
        }
        acc.prevYear = year;
        return acc;
      },
      { ranges: [], rangeStarted: sortedYears[0] }
    );

    const lastYear = ranges.prevYear;
    ranges.ranges.push(
      ranges.rangeStarted === lastYear
        ? String(lastYear)
        : `${ranges.rangeStarted}-${lastYear}`
    );
    return ranges.ranges[0];
  }

  await createTagsFromProductAttributes();

  return mergedProductsArray;
};

const createProductModelTags = async (model, access_token) => {
  const mergedProductsArray = [];
  const product = model.product;
  const variant = model.variants.filter((v) => v.values.zn_requiresFitment)[0];

  const createTagsFromProductAttributes = async () => {
    const productAttributes = {
      price:
        variant && variant.values.price
          ? variant.values.price
          : product.values.price,
      stusa_brand:
        variant && variant.values.stusa_brand
          ? variant.values.stusa_brand
          : product.values.stusa_brand,
      PVG_BDS_Type:
        variant && variant.values.PVG_BDS_Type
          ? variant.values.PVG_BDS_Type
          : product.values.PVG_BDS_Type,
      PVG_BDS_Rear_Lift_Height:
        variant && variant.values.PVG_BDS_Rear_Lift_Height
          ? variant.values.PVG_BDS_Rear_Lift_Height
          : product.values.PVG_BDS_Rear_Lift_Height,
      PVG_BDS_Rear_Lift_Method:
        variant && variant.values.PVG_BDS_Rear_Lift_Method
          ? variant.values.PVG_BDS_Rear_Lift_Method
          : product.values.PVG_BDS_Rear_Lift_Method,
      PVG_BDS_Front_Lift_Height:
        variant && variant.values.PVG_BDS_Front_Lift_Height
          ? variant.values.PVG_BDS_Front_Lift_Height
          : product.values.PVG_BDS_Front_Lift_Height,
      PVG_BDS_Front_Lift_Method:
        variant && variant.values.PVG_BDS_Front_Lift_Method
          ? variant.values.PVG_BDS_Front_Lift_Method
          : product.values.PVG_BDS_Front_Lift_Method,
      PVG_BDS_Series:
        variant && variant.values.PVG_BDS_Series
          ? variant.values.PVG_BDS_Series
          : product.values.PVG_BDS_Series,
      PVG_BDS_Adjustable:
        variant && variant.values.PVG_BDS_Adjustable
          ? variant.values.PVG_BDS_Adjustable
          : product.values.PVG_BDS_Adjustable,
      PVG_BDS_Adjustable_Damping:
        variant && variant.values.PVG_BDS_Adjustable_Damping
          ? variant.values.PVG_BDS_Adjustable_Damping
          : product.values.PVG_BDS_Adjustable_Damping,
      PVG_BDS_Lift_Height:
        variant && variant.values.PVG_BDS_Lift_Height
          ? variant.values.PVG_BDS_Lift_Height
          : product.values.PVG_BDS_Lift_Height,
      PVG_BDS_Compressed_Length:
        variant && variant.values.PVG_BDS_Compressed_Length
          ? variant.values.PVG_BDS_Compressed_Length
          : product.values.PVG_BDS_Compressed_Length,
      PVG_BDS_Extended_Length:
        variant && variant.values.PVG_BDS_Extended_Length
          ? variant.values.PVG_BDS_Extended_Length
          : product.values.PVG_BDS_Extended_Length,
      PVG_BDS_Travel_Length:
        variant && variant.values.PVG_BDS_Travel_Length
          ? variant.values.PVG_BDS_Travel_Length
          : product.values.PVG_BDS_Travel_Length,
      PVG_BDS_Position:
        variant && variant.values.PVG_BDS_Position
          ? variant.values.PVG_BDS_Position
          : product.values.PVG_BDS_Position,
      PVG_BDS_Maximum_Lift:
        variant && variant.values.PVG_BDS_Maximum_Lift
          ? variant.values.PVG_BDS_Maximum_Lift
          : product.values.PVG_BDS_Maximum_Lift,
      jks_Product_Type_II:
        variant && variant.values.jks_Product_Type_II
          ? variant.values.jks_Product_Type_II
          : product.values.jks_Product_Type_II,
      "1_tire_diameter":
        variant && variant.values["1_tire_diameter"]
          ? variant.values["1_tire_diameter"]
          : product.values["1_tire_diameter"],
      "2_tire_diameter":
        variant && variant.values["2_tire_diameter"]
          ? variant.values["2_tire_diameter"]
          : product.values["2_tire_diameter"],
      "3_tire_diameter":
        variant && variant.values["3_tire_diameter"]
          ? variant.values["3_tire_diameter"]
          : product.values["3_tire_diameter"],
    };

    const tier2_parents = [
      "BDS_Kits",
      "PVG_BDS_ShocksandCoilovers",
      "Suspension_Parts",
      "BDS_Lifestyle",
      "BDS_More",
    ];

    const productTagsArray = [];

    for (const key in productAttributes) {
      const attribute = productAttributes[key];
      if (
        attribute &&
        attribute[0] &&
        attribute[0].data !== null &&
        attribute[0].data !== undefined
      ) {
        if (key === "price") {
          productTagsArray.push(attribute[0].data[0].amount);
          productTagsArray.push("Price:" + attribute[0].data[0].amount);
        } else if (key === "stusa_brand") {
          const upperCaseData = attribute[0].data.toUpperCase();
          if (upperCaseData.includes("FOX")) {
            productTagsArray.push("FOX", "Brand:FOX");
          } else {
            productTagsArray.push(upperCaseData, "Brand:" + upperCaseData);
          }
        } else if (
          key === "PVG_BDS_Adjustable" ||
          key === "PVG_BDS_Adjustable_Damping" ||
          key === "PVG_BDS_Compressed_Length" ||
          key === "PVG_BDS_Extended_Length" ||
          key === "PVG_BDS_Travel_Length" ||
          key === "PVG_BDS_Maximum_Lift" ||
          key === "PVG_BDS_Position"
        ) {
          if (
            key === "PVG_BDS_Compressed_Length" ||
            key === "PVG_BDS_Extended_Length" ||
            key === "PVG_BDS_Travel_Length" ||
            key === "PVG_BDS_Maximum_Lift"
          ) {
            productTagsArray.push(attribute[0].data.amount);
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data.amount
            );
          } else if (
            key === "PVG_BDS_Adjustable" ||
            key === "PVG_BDS_Adjustable_Damping"
          ) {
            productTagsArray.push(attribute[0].data ? "Yes" : "No");
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data
                ? "Yes"
                : "No"
            );
          } else {
            productTagsArray.push(attribute[0].data);
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") +
                ":" +
                attribute[0].data
            );
          }
        } else if (key === "jks_Product_Type_II") {
          for (const item of attribute[0].data) {
            productTagsArray.push(item.replace("_", "-"));
          }
        } else {
          const tag = (
            await getAkeneoData(
              `${process.env.AKENEO_API_URI}attributes/${key}/options/${attribute[0].data}`,
              access_token
            )
          ).labels.en_US;
          if (
            key === "1_tire_diameter" ||
            key === "2_tire_diameter" ||
            key === "3_tire_diameter"
          ) {
            productTagsArray.push("Max Tire Size:" + tag);
          } else {
            productTagsArray.push(
              key.replace("PVG_BDS_", "").replace(/_/g, " ") + ":" + tag
            );
          }
        }
      }
    }

    let tier2_tag = null;
    let categoryArray = [];

    for (const category of product.categories) {
      if (category !== "BDS_productCategories") {
        const categoryObj = await getAkeneoData(
          `${process.env.AKENEO_API_URI}categories/${category}`,
          access_token
        );
        if (categoryObj) {
          if (tier2_parents.includes(categoryObj.parent)) {
            productTagsArray.push("tier2:" + categoryObj.labels.en_US);
            productTagsArray.push(categoryObj.labels.en_US);
            tier2_tag = category;
          } else {
            productTagsArray.push(categoryObj.labels.en_US);
          }

          categoryArray.push({
            parent: categoryObj.parent,
            label: categoryObj.labels.en_US,
          });
        }
      }
    }

    if (categoryArray.filter((c) => c.parent === tier2_tag).length > 0) {
      productTagsArray.push(
        "tier3:" + categoryArray.filter((c) => c.parent === tier2_tag)[0].label
      );
    }

    for (const variant of model.variants) {
      productTagsArray.push(variant.identifier.replace(/BDS|FOX|JKS/g, ""));
    }

    const productTagObj = {
      [product.code]: productTagsArray.filter(
        (item, index) => productTagsArray.indexOf(item) === index
      ),
    };

    mergedProductsArray.push(productTagObj);
    createTagsFromFitment();
  };

  const createTagsFromFitment = () => {
    let productFitmentString;
    if (variant && variant.values.zn_fitment) {
      productFitmentString = variant.values.zn_fitment[0].data;

      const fitmentStringArr = productFitmentString.split(";");
      const fitmentTagsArray = [];
      const fitmentYearsArray = [];
      let productRecordExists = false;

      for (const fitmentItem of fitmentStringArr) {
        const items = fitmentItem.split("|");
        for (let i = 0; i < items.length; i++) {
          if (items[i] !== "X") {
            if (!fitmentTagsArray.includes(items[i]) && items[i] !== "0") {
              if (items[i].includes("Ram")) {
                fitmentTagsArray.push(items[i].toUpperCase());
              } else {
                fitmentTagsArray.push(items[i]);
              }
            }
            if (
              !fitmentYearsArray.includes(items[i]) &&
              !isNaN(Number(items[i])) &&
              i === 0
            ) {
              fitmentYearsArray.push(items[i]);
            }
          } else {
            if (i === 4) {
              if (!fitmentTagsArray.includes("4WD")) {
                fitmentTagsArray.push("4WD");
              }
              if (!fitmentTagsArray.includes("RWD")) {
                fitmentTagsArray.push("RWD");
              }
              if (!fitmentTagsArray.includes("AWD")) {
                fitmentTagsArray.push("AWD");
              }
            } else if (i === 5) {
              if (!fitmentTagsArray.includes("FLEX")) {
                fitmentTagsArray.push("FLEX");
              }
              if (!fitmentTagsArray.includes("GAS")) {
                fitmentTagsArray.push("GAS");
              }
              if (!fitmentTagsArray.includes("DIESEL")) {
                fitmentTagsArray.push("DIESEL");
              }
            } else if (i === 6) {
              if (!fitmentTagsArray.includes("2DR")) {
                fitmentTagsArray.push("2DR");
              }
              if (!fitmentTagsArray.includes("4DR")) {
                fitmentTagsArray.push("4DR");
              }
            }
          }
        }
      }

      const yearRange =
        fitmentYearsArray.length > 1
          ? createYearRangeTag(fitmentYearsArray)
          : fitmentYearsArray[0] ?? "No Year";

      if (!fitmentTagsArray.includes(yearRange)) {
        fitmentTagsArray.push(yearRange);
      }

      const productTagObj = {
        [product.code]: fitmentTagsArray.filter(
          (item, index) => fitmentTagsArray.indexOf(item) === index
        ),
      };

      for (const [key, value] of Object.entries(mergedProductsArray)) {
        if (value[product.code]) {
          for (let i = 0; i < productTagObj[product.code].length; i++) {
            const tag = productTagObj[product.code][i];
            if (tag) {
              mergedProductsArray[key][product.code].push(tag);
            }
          }
          productRecordExists = true;
          return;
        }
      }

      if (!productRecordExists) {
        mergedProductsArray.push(productTagObj);
      }
    }
  };

  function createYearRangeTag(years) {
    const sortedYears = [...new Set(years)].sort((a, b) => a - b);
    const ranges = sortedYears.reduce(
      (acc, year) => {
        const prevYear = acc.prevYear ?? year;
        if (year - prevYear > 1) {
          acc.ranges.push(
            acc.rangeStarted === prevYear
              ? String(prevYear)
              : `${acc.rangeStarted}-${prevYear}`
          );
          acc.rangeStarted = year;
        }
        acc.prevYear = year;
        return acc;
      },
      { ranges: [], rangeStarted: sortedYears[0] }
    );

    const lastYear = ranges.prevYear;
    ranges.ranges.push(
      ranges.rangeStarted === lastYear
        ? String(lastYear)
        : `${ranges.rangeStarted}-${lastYear}`
    );
    return ranges.ranges[0];
  }

  await createTagsFromProductAttributes();

  return mergedProductsArray;
};

module.exports = {
  createProductTags,
  createProductModelTags,
};
