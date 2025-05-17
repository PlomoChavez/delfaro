function replacerBigInt(key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}
function exportData(data) {
  return JSON.parse(JSON.stringify(data, replacerBigInt));
}

module.exports = { exportData };
