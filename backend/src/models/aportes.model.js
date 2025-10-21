import { db } from "../config/db.js";

const getMonthName = (num) => {
    const months = [
        'Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];
    return months[num - 1] || '';
};

// Crear aporte
const create = async ({
    afiliado_id,
    anio,
    mes,
    monto,
    fecha_registro
}) => {
    const query = {
        text: `
            INSERT INTO aportes
            (afiliado_id, anio, mes, monto, fecha_registro)
            VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
            RETURNING *
        `,
        values: [
            parseInt(afiliado_id),
            parseInt(anio),
            parseInt(mes),
            parseFloat(monto),
            fecha_registro
        ]
    };

  try {
    const { rows } = await db.query(query);
    return rows[0];
  } catch (err) {
    console.error('AporteModel.create SQL error', { text: query.text, values: query.values, err: err.message })
    throw err
  }
};

//Editar aportes
const update = async ({ id, afiliado_id, anio, mes, monto, fecha_registro }) => {
  const fields = []
  const values = []
  let idx = 1

  if (afiliado_id !== null && afiliado_id !== undefined) {
    fields.push(`afiliado_id = $${idx++}`)
    values.push(afiliado_id)
  }
  if (anio !== null && anio !== undefined) {
    fields.push(`anio = $${idx++}`)
    values.push(anio)
  }
  if (mes !== null && mes !== undefined) {
    fields.push(`mes = $${idx++}`)
    values.push(mes)
  }
  if (monto !== null && monto !== undefined) {
    fields.push(`monto = $${idx++}`)
    values.push(monto)
  }
  if (fecha_registro !== null && fecha_registro !== undefined) {
    fields.push(`fecha_registro = $${idx++}`)
    values.push(fecha_registro)
  }

  if (!fields.length) {
    throw new Error("No hay campos para actualizar")
  }

  const query = {
    text: `
      UPDATE aportes
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *
    `,
    values: [...values, id]
  }

  const { rows } = await db.query(query)
  if (!rows.length) {
    return { message: "Aporte no encontrado" }
  }
  return rows[0]
}



// Obtener todos los aportes con paginación
const findAll = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const query = {
        text: `
      SELECT 
        ap.id,
        ap.anio,
        a.ci,
        a.nombres,
        a.apellidos,
        c.nombre,
        ap.mes,
        ap.monto,
        ap.fecha_registro
            FROM afiliado a
            JOIN colegio c ON a.id_colegio= c.id_colegio
            JOIN aportes ap ON ap.afiliado_id = a.id_afiliado
          ORDER BY ap.fecha_registro DESC
            LIMIT $1 OFFSET $2
        `,
        values: [limit, offset]
    };

    const { rows } = await db.query(query);
    return rows.map(r => ({ ...r, mes_nombre: getMonthName(r.mes) }));
};

// Obtener aportes de un afiliado específico con paginación
const findByAfiliado = async ({ afiliado_id, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit

  // 1️⃣ Contar el total de registros
  const countQuery = {
    text: `SELECT COUNT(*) FROM aportes WHERE afiliado_id = $1`,
    values: [afiliado_id],
  }
  const countResult = await db.query(countQuery)
  const total = parseInt(countResult.rows[0].count, 10)

  // 2️⃣ Obtener registros con JOIN + paginación
  const query = {
    text: `
    SELECT
      ap.id,
      ap.anio,
      a.ci,
      a.nombres,
      a.apellidos,
      c.nombre,
      ap.mes,
      ap.monto,
      ap.fecha_registro
        FROM afiliado a
        JOIN colegio c ON a.id_colegio= c.id_colegio
        JOIN aportes ap ON ap.afiliado_id = a.id_afiliado
  WHERE a.id_afiliado = $1
  ORDER BY ap.anio DESC, ap.mes DESC
        LIMIT $2 OFFSET $3
    `,
    values: [parseInt(afiliado_id), limit, offset],
  }

  const { rows } = await db.query(query)

  // 3️⃣ Transformar resultados
  const data = rows.map(r => ({
    ...r,
    mes_nombre: getMonthName(r.mes),
  }))

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
// Obtener aportes por rango de fecha_registro con paginación
const findByFechaRegistro = async ({ fecha_inicio, fecha_fin, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const query = {
        text: `
            SELECT 
            ap.id,
            ap.anio,
            a.ci,
            a.nombres,
            a.apellidos,
            c.nombre,
            ap.mes,
            ap.monto,
            ap.fecha_registro
            FROM afiliado a
            JOIN colegio c ON a.id_colegio= c.id_colegio
            JOIN aportes ap ON ap.afiliado_id = a.id_afiliado
        WHERE ap.fecha_registro BETWEEN $1 AND $2
        ORDER BY ap.fecha_registro DESC
            LIMIT $3 OFFSET $4
        `,
        values: [fecha_inicio, fecha_fin, limit, offset]
    };

    const { rows } = await db.query(query);
    return rows.map(r => ({ ...r, mes_nombre: getMonthName(r.mes) }));
};

// Obtener aportes por año con paginación
const findByAnio = async ({ anio }) => {
  if (!anio || isNaN(parseInt(anio))) {
    throw new Error(`Parámetro anio inválido: ${anio}`);
  }
  // 1️⃣ Contar total
  const countQuery = {
    text: `SELECT COUNT(*) FROM aportes WHERE anio = $1`,
    values: [parseInt(anio, 10)],
  };
  const countResult = await db.query(countQuery);
  const total = parseInt(countResult.rows[0].count, 10);

  // 2️⃣ Obtener registros
  const query = {
    text: `
        SELECT
            a.id_afiliado, 
            a.ci,
            a.nombres,
            a.apellidos,
            c.nombre,
            ap.mes,
            ap.monto,
            ap.fecha_registro
        FROM afiliado a
        JOIN colegio c ON a.id_colegio= c.id_colegio
        JOIN aportes ap ON ap.afiliado_id = a.id_afiliado
        WHERE ap.anio = $1
    ORDER BY ap.mes DESC, ap.fecha_registro DESC
    `,
    values: [parseInt(anio, 10)],
  };

  const { rows } = await db.query(query);

  const data = rows.map(r => ({
    ...r,
    mes_nombre: getMonthName(r.mes),
  }));

  return {
    data,
    total,
    page: 1,
    limit: total,
    totalPages: 1,
  };
};


// Obtener todos los años distintos registrados en aportes
const findAllYears = async () => {
  const query = `
    SELECT DISTINCT anio
    FROM aportes
    ORDER BY anio DESC
  `;
  const { rows } = await db.query(query);
  return rows.map(r => r.anio);
};

// Eliminar aporte por ID
const deleteAporte = async ({ id }) => {
    const query = {
        text: `DELETE FROM aportes WHERE id = $1`,
        values: [parseInt(id)]
    };

    await db.query(query);
    return { message: "Aporte eliminado correctamente" };
};

export const AporteModel = {
    create,
    update,
    findAll,
    findByAfiliado,
    findByFechaRegistro,
    findByAnio,
    findAllYears,
    deleteAporte
};
