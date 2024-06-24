import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarRemuneracion,
  crearRemuneracion,
  eliminarRemuneracion,
  getRemuneracion,
  getRemuneracionMensual,
  getRemuneracionMensualAdmin,
  getRemuneracionPorRangoDeFechas,
  getRemuneracionPorRangoDeFechasAdmin,
  getRemuneraciones,
  getRemuneracionesAdmin,
} from "../controllers/remuneracion.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/remuneraciones", isAuth, isAdmin, getRemuneraciones);

router.get("/remuneraciones-admin", isAuth, isAdmin, getRemuneracionesAdmin);

router.get("/remuneraciones-mes", isAuth, isAdmin, getRemuneracionMensual);

router.get(
  "/remuneraciones-mes-admin",
  isAuth,
  isAdmin,
  getRemuneracionMensualAdmin
);

router.get("/remuneraciones/:id", isAuth, isAdmin, getRemuneracion);

router.post("/crear-remuneracion", isAuth, isAdmin, crearRemuneracion);

router.put("/remuneraciones/:id", isAuth, isAdmin, actualizarRemuneracion);

router.delete("/remuneraciones/:id", isAuth, isAdmin, eliminarRemuneracion);

router.post(
  "/remuneraciones-rango-fechas-admin",
  isAuth,
  isAdmin,
  getRemuneracionPorRangoDeFechasAdmin
);

router.post(
  "/remuneraciones-rango-fechas",
  isAuth,
  isAdmin,
  getRemuneracionPorRangoDeFechas
);

export default router;
