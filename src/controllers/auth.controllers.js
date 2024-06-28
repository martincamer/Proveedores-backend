import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";
import bcrypts from "bcryptjs";

// signin
export const signin = async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (result.rowCount === 0) {
    return res.status(400).json({
      message: "El usuario no está registrado",
    });
  }

  const validPassword = await bcrypts.compare(
    password,
    result.rows[0].password
  );
  if (!validPassword) {
    return res.status(400).json({
      message: "La contraseña es incorrecta",
    });
  }
  const token = await createAccessToken({
    id: result.rows[0].id,
    role: result.rows[0].role_id,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json(result.rows[0]);
};

// signup
export const signup = async (req, res, next) => {
  const { username, email, password, sucursal, localidad } = req.body;

  try {
    const hashedPassword = await bcrypts.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(username,password,email,localidad,sucursal,role_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [username, hashedPassword, email, localidad, sucursal, 1] // Assuming 'user' role has an id of 2
    );

    const token = await createAccessToken({
      id: result.rows[0].id,
      role: result.rows[0].role_id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

// signup
export const signupTwo = async (req, res, next) => {
  const { username, email, password, sucursal, localidad } = req.body;

  try {
    const hashedPassword = await bcrypts.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username,password,email,localidad,sucursal,role_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [username, hashedPassword, email, localidad, sucursal, 1] // Assuming 'user' role has an id of 2
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

//logout
export const signout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  res.sendStatus(200);
};

//profile user
export const profile = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

//profile user
export const passwordReset = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, localidad, sucursal } = req.body;

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Hash de la nueva contraseña
    // const hashedPassword = await bcrypts.hash(password, 10);

    // Actualizar los datos del usuario, incluyendo la contraseña hash
    const updateResult = await pool.query(
      "UPDATE users SET username = $1, email = $2, localidad = $3, sucursal = $4 WHERE id = $5 RETURNING *",
      [username, email, localidad, sucursal, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserPassword = async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypts.hash(password, 10);

    // Actualizar los datos del usuario, incluyendo la contraseña hash
    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
      [hashedPassword, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserRole = async (req, res) => {
  const userId = req.params.id;
  const { role_id } = req.body; // Asegúrate de que este campo está en el cuerpo de la solicitud

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar solo el campo role_id
    const updateResult = await pool.query(
      "UPDATE users SET role_id = $1 WHERE id = $2 RETURNING *",
      [role_id, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserImagen = async (req, res) => {
  const userId = req.params.id;
  const { imagen } = req.body; // Asegúrate de que este campo está en el cuerpo de la solicitud

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar solo el campo role_id
    const updateResult = await pool.query(
      "UPDATE users SET imagen = $1 WHERE id = $2 RETURNING *",
      [imagen, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
