import { pool } from "../db.js";

import { v4 as uuidv4 } from "uuid";

// Obtener todos los proveedores
export const getProveedores = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM proveedores");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron proveedores" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un proveedor por su ID
export const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM proveedores WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún proveedor con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearProveedor = async (req, res, next) => {
  const { proveedor, localidad_proveedor, provincia_proveedor } = req.body;
  const { username, userRole, localidad, sucursal } = req;

  // Valores predeterminados
  const deber = 0;
  const haber = 0;
  const comprobantes = "[]";

  // Validación de campos
  if (
    !proveedor ||
    typeof proveedor !== "string" ||
    !localidad_proveedor ||
    typeof localidad_proveedor !== "string" ||
    !provincia_proveedor ||
    typeof provincia_proveedor !== "string"
  ) {
    return res.status(400).json({
      message:
        "Todos los campos son obligatorios y deben tener el formato correcto.",
    });
  }

  try {
    // Insertar el nuevo proveedor
    const insertResult = await pool.query(
      "INSERT INTO proveedores (proveedor, localidad_proveedor, provincia_proveedor, deber, haber, comprobantes, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        proveedor,
        localidad_proveedor,
        provincia_proveedor,
        deber,
        haber,
        comprobantes,
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    // Obtener todos los proveedores de la misma localidad y sucursal del usuario
    const selectResult = await pool.query(
      "SELECT * FROM proveedores WHERE localidad = $1 AND sucursal = $2",
      [localidad, sucursal]
    );

    res.status(201).json({
      nuevoProveedor: insertResult.rows[0],
      todosLosProveedores: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearComprobante = async (req, res) => {
  const { id } = req.params; // ID del proveedor
  const { comprobante } = req.body; // Comprobante enviado desde el frontend

  try {
    // Generar un ID aleatorio usando uuid
    const comprobanteId = uuidv4();

    // Obtener la fecha actual
    const fechaActual = new Date().toISOString(); // Formato ISO 8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'

    // Obtener el proveedor según el ID
    const proveedorResult = await pool.query(
      "SELECT * FROM proveedores WHERE id = $1",
      [id]
    );

    if (proveedorResult.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    let proveedor = proveedorResult.rows[0];

    // Obtener el arreglo de comprobantes actuales y agregar el nuevo comprobante
    let comprobantesArray = JSON.parse(proveedor.comprobantes || "[]");
    comprobantesArray.push({
      ...comprobante,
      id: comprobanteId,
      fecha: fechaActual,
    });

    // Actualizar el proveedor con el nuevo arreglo de comprobantes
    const result = await pool.query(
      "UPDATE proveedores SET comprobantes = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(comprobantesArray), id]
    );

    proveedor = result.rows[0]; // Actualizar proveedor con los datos actualizados

    res.status(200).json({
      proveedorActualizado: proveedor,
      todosLosProveedores: result.rows, // Opcional: puedes devolver todos los proveedores actualizados
    });
  } catch (error) {
    console.error("Error al crear comprobante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
export const actualizarProveedor = async (req, res) => {
  const { id } = req.params;

  const { proveedor, localidad_proveedor, provincia_proveedor } = req.body;

  const { username, userRole, localidad } = req;

  try {
    const result = await pool.query(
      "UPDATE proveedores SET proveedor = $1, localidad_proveedor = $2, provincia_proveedor = $3, usuario = $4, role_id = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [
        proveedor,
        localidad_proveedor,
        provincia_proveedor,
        username,
        userRole,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    // Obtener todos los proveedores que coincidan con el usuario y localidad
    const todosLosProveedores = await pool.query(
      "SELECT * FROM proveedores WHERE usuario = $1 AND localidad = $2",
      [username, localidad]
    );

    res.status(200).json({
      updatedProveedor: result.rows[0],
      allProveedores: todosLosProveedores.rows,
    });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un proveedor
export const eliminarProveedor = async (req, res) => {
  const { id } = req.params;
  const { username, localidad } = req;

  try {
    const result = await pool.query("DELETE FROM proveedores WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    // Obtener todos los proveedores que coincidan con el usuario y localidad después de la eliminación
    const todosLosProveedores = await pool.query(
      "SELECT * FROM proveedores WHERE usuario = $1 AND localidad = $2",
      [username, localidad]
    );

    res.status(200).json(todosLosProveedores.rows);
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
