function escaparBarras(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/\\/g, "\\\\");
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      escaparBarras(obj[key]);
    }
  }
}

module.exports = { escaparBarras };
