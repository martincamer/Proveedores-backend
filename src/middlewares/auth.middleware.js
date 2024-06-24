import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const isAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "No estás autorizado",
    });
  }

  try {
    const decoded = jwt.verify(token, "react2021");

    const result = await pool.query(
      "SELECT role_id,username,localidad,sucursal FROM users WHERE id = $1",
      [decoded.id]
    );

    req.userId = decoded.id;
    req.userRole = result.rows[0].role_id;
    req.username = result.rows[0].username;
    req.email = result.rows[0].email;
    req.localidad = result.rows[0].localidad;
    req.sucursal = result.rows[0].sucursal;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "No estás autorizado",
    });
  }
};
