import Router from "express-promise-router";
import {
  deleteUserById,
  signupTwo,
  updateUser,
  getUserById,
  getAllUsers,
  profile,
  signin,
  signout,
  signup,
  updateUserRole,
  updateUserPassword,
  updateUserImagen,
} from "../controllers/auth.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { signinSchema, signupSchema } from "../schemas/auth.schema.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.post("/signin", validateSchema(signinSchema), signin);

router.post("/signup", validateSchema(signupSchema), signup);

router.post("/signup-two", validateSchema(signupSchema), signupTwo);

router.put("/users/:id", isAuth, isAdmin, updateUser);

router.put("/users-password/:id", isAuth, isAdmin, updateUserPassword);

router.put("/users-role/:id", isAuth, isAdmin, updateUserRole);

router.put("/editar-imagen-users/:id", isAuth, isAdmin, updateUserImagen);

router.get("/users/:id", isAuth, isAdmin, getUserById);

router.delete("/users/:id", isAuth, isAdmin, deleteUserById);

router.post("/signout", signout);

router.get("/profile", isAuth, isAdmin, profile);

router.get("/users", isAuth, isAdmin, getAllUsers);

export default router;
