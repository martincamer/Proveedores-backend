import { pool } from "../db.js";

// Obtener todos los proveedores
export const getOrdenes = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM ordenes");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron las ordenes" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las ordenes:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un proveedor por su ID
export const getOrdenesById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM ordenes WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningúna orden con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener la orden por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearOrden = async (req, res) => {
  const { proveedor, total, comprobante, tipo_orden } = req.body;

  const { username, userRole, localidad, sucursal } = req;

  try {
    // Start a transaction to ensure consistency
    const client = await pool.connect();

    try {
      // Insert the new order
      const insertResult = await client.query(
        "INSERT INTO ordenes (proveedor, total, comprobante, tipo_orden, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          proveedor,
          total,
          comprobante,
          tipo_orden,
          localidad,
          sucursal,
          username,
          userRole,
        ]
      );

      // Update the 'haber' of the 'proveedores' table
      // First, get the current 'haber' of the 'proveedor'
      const haberQuery = await client.query(
        "SELECT haber FROM proveedores WHERE proveedor = $1",
        [proveedor]
      );

      let haberProveedorActual =
        haberQuery.rows.length > 0 ? haberQuery.rows[0].haber : 0;

      // Calculate the new 'haber' which is the sum of current 'haber' and 'total' of the order
      let totalNuevo = Number(haberProveedorActual) + parseFloat(total);

      // Update the 'haber' in the 'proveedores' table
      await client.query(
        "UPDATE proveedores SET haber = $1 WHERE proveedor = $2",
        [totalNuevo, proveedor]
      );

      // Get all orders from the same 'localidad' and 'sucursal' of the user
      const selectOrdenesResult = await client.query(
        "SELECT * FROM ordenes WHERE localidad = $1 AND sucursal = $2",
        [localidad, sucursal]
      );

      // Get the updated 'proveedor' details after haber update
      // Get all orders from the same 'localidad' and 'sucursal' of the user
      const selectProveedoresResults = await client.query(
        "SELECT * FROM proveedores WHERE localidad = $1 AND sucursal = $2",
        [localidad, sucursal]
      );

      // Commit the transaction
      await client.query("COMMIT");

      // Respond with the new order, all orders from the same 'localidad' and 'sucursal', and updated 'proveedor' details
      res.status(201).json({
        nuevaOrden: insertResult.rows[0],
        todasLasOrdenes: selectOrdenesResult.rows,
        proveedorActualizados: selectProveedoresResults.rows,
      });
    } catch (error) {
      // Rollback the transaction if there's any error
      await client.query("ROLLBACK");
      console.error("Error al crear la orden:", error);
      if (error.code === "23505") {
        return res.status(409).json({
          message: "Ya existe una orden con ese id",
        });
      }
      return res.status(500).json({ error: "Error interno del servidor" });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarOrden = async (req, res) => {
  const { id } = req.params;

  const { proveedor, total, comprobante, tipo_orden } = req.body;
  const { username, userRole, localidad, sucursal } = req;

  try {
    const result = await pool.query(
      "UPDATE proveedores SET proveedor = $1, total = $2, comprobante = $3, tipo_orden = $4,localidad_proveedor = $5 provincia_proveedor = $6, usuario = $7, role_id = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *",
      [proveedor, total, comprobante, tipo_orden, username, userRole, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningúna orden con ese ID",
      });
    }

    // Obtener todos los proveedores de la misma localidad y sucursal del usuario
    const selectResult = await pool.query(
      "SELECT * FROM ordenes WHERE localidad = $1 AND sucursal = $2",
      [localidad, sucursal]
    );

    res.status(201).json({
      nuevaOrden: insertResult.rows[0],
      todasLasOrdenes: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un proveedor
// export const eliminarOrdenes = async (req, res) => {
//   const { id } = req.params;
//   const { localidad } = req;

//   try {
//     const result = await pool.query("DELETE FROM ordenes WHERE id = $1", [id]);

//     if (result.rowCount === 0) {
//       return res.status(404).json({
//         message: "No se encontró ningúna orden con ese ID",
//       });
//     }

//     // Obtener todos los proveedores de la misma localidad y sucursal del usuario
//     const selectResult = await pool.query(
//       "SELECT * FROM ordenes WHERE localidad = $1 AND sucursal = $2",
//       [localidad, sucursal]
//     );

//     res.status(201).json({
//       nuevaOrden: insertResult.rows[0],
//       todasLasOrdenes: selectResult.rows,
//     });
//   } catch (error) {
//     console.error("Error al eliminar proveedor:", error);
//     return res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

// Eliminar una orden
export const eliminarOrdenes = async (req, res) => {
  const { id } = req.params;
  const { localidad, sucursal } = req;

  try {
    // Iniciar una transacción para garantizar consistencia
    const client = await pool.connect();

    try {
      // Obtener el proveedor y el total de la orden antes de eliminarla
      const ordenQuery = await client.query(
        "SELECT proveedor, total FROM ordenes WHERE id = $1",
        [id]
      );

      if (ordenQuery.rows.length === 0) {
        return res.status(404).json({
          message: "No se encontró ninguna orden con ese ID",
        });
      }

      const { proveedor, total } = ordenQuery.rows[0];

      // Eliminar la orden
      const deleteResult = await client.query(
        "DELETE FROM ordenes WHERE id = $1",
        [id]
      );

      // Obtener el haber actual del proveedor
      const proveedorQuery = await client.query(
        "SELECT haber FROM proveedores WHERE proveedor = $1",
        [proveedor]
      );

      if (proveedorQuery.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: "Proveedor no encontrado",
        });
      }

      let haberProveedorActual = proveedorQuery.rows[0].haber || 0;

      // Restar el total de la orden del haber actual del proveedor
      let totalNuevo = Number(haberProveedorActual) - parseFloat(total);

      // Actualizar el haber del proveedor
      await client.query(
        "UPDATE proveedores SET haber = $1 WHERE proveedor = $2",
        [totalNuevo, proveedor]
      );

      // Obtener todas las órdenes de la misma localidad y sucursal del usuario
      const selectOrdenesResult = await client.query(
        "SELECT * FROM ordenes WHERE localidad = $1 AND sucursal = $2",
        [localidad, sucursal]
      );

      // Obtener todos los proveedores actualizados
      const selectProveedoresResults = await client.query(
        "SELECT * FROM proveedores WHERE localidad = $1 AND sucursal = $2",
        [localidad, sucursal]
      );

      // Commit de la transacción
      await client.query("COMMIT");

      // Responder con la orden eliminada correctamente, todas las órdenes actualizadas y todos los proveedores actualizados
      res.status(200).json({
        message: "Orden eliminada correctamente",
        todasLasOrdenes: selectOrdenesResult.rows,
        proveedoresActualizados: selectProveedoresResults.rows,
      });
    } catch (error) {
      // Rollback de la transacción en caso de error
      await client.query("ROLLBACK");
      console.error("Error al eliminar orden:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    } finally {
      // Liberar el cliente de la pool
      client.release();
    }
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
