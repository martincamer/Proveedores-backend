import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  actualizarOrden,
  crearOrden,
  eliminarOrdenes,
  getOrdenes,
  getOrdenesById,
} from "../controllers/ordenes.controllers.js";

const router = Router();

router.get("/ordenes", isAuth, isAdmin, getOrdenes);

router.get("/ordenes/:id", isAuth, isAdmin, getOrdenesById);

router.post("/ordenes", isAuth, isAdmin, crearOrden);

router.put("/ordenes/:id", isAuth, isAdmin, actualizarOrden);

router.delete("/ordenes/:id", isAuth, isAdmin, eliminarOrdenes);

export default router;
