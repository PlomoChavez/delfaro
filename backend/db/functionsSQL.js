import { createOrUpdate } from "./functions/createOrUpdate.js";
import { deleteByFilter } from "./functions/deleteByFilter.js";
import { deleteById } from "./functions/deleteById.js";
import { findOne } from "./functions/findOne.js";
import { getAllFrom } from "./functions/getAllFrom.js";
import { updateOne } from "./functions/updateOne.js";
// Aquí puedes agregar más funciones SQL en el futuro:
// import { findAll } from "./findAll.js";
// import { insertOne } from "./insertOne.js";
// import { updateOne } from "./updateOne.js";

export {
  createOrUpdate,
  deleteByFilter,
  deleteById,
  findOne,
  getAllFrom,
  updateOne,
};
