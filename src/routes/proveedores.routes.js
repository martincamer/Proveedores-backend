import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";
import {
  actualizarProveedor,
  crearComprobante,
  crearProveedor,
  eliminarComprobante,
  eliminarProveedor,
  getProveedorById,
  getProveedores,
} from "../controllers/proveedores.controllers.js";

const router = Router();

router.get("/proveedores", isAuth, isAdmin, getProveedores);

router.get("/proveedores/:id", isAuth, isAdmin, getProveedorById);

router.post("/proveedores", isAuth, isAdmin, crearProveedor);

router.put("/proveedores/:id", isAuth, isAdmin, actualizarProveedor);

router.delete("/proveedores/:id", isAuth, isAdmin, eliminarProveedor);

router.post("/proveedores/:id/comprobantes", isAuth, isAdmin, crearComprobante);

router.delete(
  "/proveedores/:id/comprobantes/:comprobanteId",
  isAuth,
  isAdmin,
  eliminarComprobante
);

export default router;
