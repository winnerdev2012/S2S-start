const formatOption = (str) => {
  return str
    .toString()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

module.exports = {
  formatOption,
};
