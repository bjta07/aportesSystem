// aportes.controller.js
import { AporteModel } from "../models/aportes.model.js"
import { MemberModel } from "../models/member.model.js"
//import XLSX from "xlsx"

export const AportesController = {
  // Crear aporte
  async create(req, res) {
    try {
            const { afiliado_id, anio, mes, monto, fecha_registro } = req.body
            console.log('AportesController.create called by uid=', req.uid, 'role=', req.role)
            console.log('AportesController.create body=', req.body)
      if (!afiliado_id || !anio || !mes || !monto) {
        return res.status(400).json({ ok: false, error: "Faltan datos obligatorios" })
      }

      const aporteData = {
        afiliado_id: parseInt(afiliado_id),
        anio: parseInt(anio),
        mes: parseInt(mes),
        monto: parseFloat(monto),
        fecha_registro
      }

      const aporte = await AporteModel.create(aporteData)
      return res.status(201).json({ ok: true, data: aporte })
    } catch (error) {
      console.error("Error en AportesController.create:", error)
      return res.status(500).json({ ok: false, error: "Error al crear aporte" })
    }
  },

    // Editar aporte por ID
async update(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido" })
    }

    const { afiliado_id, anio, mes, monto, fecha_registro } = req.body

    // Al menos debe venir monto
    if (monto === undefined) {
      return res.status(400).json({ ok: false, error: "El campo monto es obligatorio" })
    }

    const aporteData = {
      id,
      afiliado_id: afiliado_id ? parseInt(afiliado_id) : null,
      anio: anio ? parseInt(anio) : null,
      mes: mes ? parseInt(mes) : null,
      monto: parseFloat(monto),
      fecha_registro: fecha_registro || null
    }

    const aporte = await AporteModel.update(aporteData)
    return res.json({ ok: true, data: aporte })
  } catch (error) {
    console.error("Error en AportesController.update:", error)
    return res.status(500).json({ ok: false, error: "Error al actualizar aporte" })
  }
},

  // Obtener todos los aportes con paginación
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const aportes = await AporteModel.findAll({ page, limit })
      return res.json({ ok: true, data: aportes })
    } catch (error) {
      console.error("Error en AportesController.getAll:", error)
      return res.status(500).json({ ok: false, error: "Error al obtener aportes" })
    }
  },

  // Obtener aportes de un afiliado específico
  async getByAfiliado(req, res) {
  try {
    const afiliado_id = parseInt(req.params.id)
    if (isNaN(afiliado_id)) {
      return res.status(400).json({ ok: false, error: "ID de afiliado inválido" })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // Usamos el nuevo findByAfiliado que devuelve data + total + totalPages
    const aportes = await AporteModel.findByAfiliado({ afiliado_id, page, limit })

    return res.json({
      ok: true,
      data: aportes.data,
      pagination: {
        total: aportes.total,
        page: aportes.page,
        limit: aportes.limit,
        totalPages: aportes.totalPages
      }
    })
  } catch (error) {
    console.error("Error en AportesController.getByAfiliado:", error)
    return res.status(500).json({ ok: false, error: "Error al obtener aportes por afiliado" })
  }
},


  // Obtener aportes por año
async getByAnio(req, res) {
  try {
    const anio = parseInt(req.params.anio);
    if (isNaN(anio)) {
      return res.status(400).json({ ok: false, error: "Año inválido" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const aportes = await AporteModel.findByAnio({ anio, page, limit });

    return res.json({
      ok: true,
      data: aportes.data,
      pagination: {
        total: aportes.total,
        page: aportes.page,
        limit: aportes.limit,
        totalPages: aportes.totalPages
      }
    });
  } catch (error) {
    console.error("Error en AportesController.getByAnio:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener aportes por año" });
  }
},

// Obtener todos los años disponibles y aportes por año (si se envía ?anio=2025)
async getYearsAndAportes(req, res) {
  try {
    const { anio } = req.query;

    // siempre devolver años
    const years = await AporteModel.findAllYears();

    let aportes = [];
    if (anio) {
      aportes = await AporteModel.findByAnio({ anio });
    }

    return res.json({
      ok: true,
      data: {
        years,
        aportes
      }
    });
  } catch (error) {
    console.error("Error en AportesController.getYearsAndAportes:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener años y aportes" });
  }
},

//Obtener todos los años disponibles:
async getAllYears (req, res) {
  try {
    const years = await AporteModel.findAllYears()

    if (!years || years.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'No hay años registrados en aportes.'
      })
    }

    return res.status(200).json({
      ok: true,
      years
    })
  } catch (error) {
    console.error('Error al obtener los años de aportes:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor al obtener los años de aportes.'
    })
  }
},

  // Eliminar aporte por ID
  async remove(req, res) {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ ok: false, error: "ID inválido" })
      }

      const result = await AporteModel.deleteAporte({ id })
      return res.json({ ok: true, data: result })
    } catch (error) {
      console.error("Error en AportesController.remove:", error)
      return res.status(500).json({ ok: false, error: "Error al eliminar aporte" })
    }
  },

//   async bulkUpload(req, res) {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           ok: false,
//           error:"No se subio ningun archivo"
//         })
//       }
       
//       const workbook = XLSX.readFile(req.file.path)
//       const sheet = workbook.Sheets[workbook.SheetNames[0]]
//       const data = XLSX.utils.sheet_to_json(sheet)
       
//       const resultados = []
//       for (const row of data){
//         const { ci, anio, mes, monto } = row
        
//         console.log('Fila original:', row)
         
//         if (!ci || !anio || !mes || !monto) {
//           resultados.push({ ci, status: "Error", message: "Datos incompletos"})
//           continue
//         }
        
//         // Limpiar y convertir los valores
//         const ciLimpio = String(ci).trim()
//         const anioNum = parseInt(String(anio).trim())
//         const mesNum = parseInt(String(mes).trim())
//         const montoNum = parseFloat(String(monto).trim())
        
//         // Validar que las conversiones sean válidas
//         if (isNaN(anioNum) || isNaN(mesNum) || isNaN(montoNum)) {
//           resultados.push({
//             ci: ciLimpio, 
//             status: "Error", 
//             message: `Datos numéricos inválidos (año: ${anio}, mes: ${mes}, monto: ${monto})`
//           })
//           continue
//         }
         
//         const afiliado = await MemberModel.findByCi(ciLimpio)
//         if (!afiliado) {
//           resultados.push({ci: ciLimpio, status: "Error", message: "Afiliado no encontrado"})
//           console.log('Afiliado encontrado:', afiliado) // <-- AGREGA ESTO
//           console.log('ID del afiliado:', afiliado?.id)
//           continue
//         }
        
        
//         // IMPORTANTE: Validar que afiliado.id existe
//         if (!afiliado.id || isNaN(parseInt(afiliado.id))) {
//           resultados.push({
//             ci: ciLimpio, 
//             status: "Error", 
//             message: "ID de afiliado inválido"
//           })
//           console.error('Afiliado sin ID válido:', afiliado)
//           continue
//         }
        
//         try {
//           const aporte = await AporteModel.create({
//             afiliado_id: afiliado.id,
//             anio: anioNum,
//             mes: mesNum,
//             monto: montoNum,
//             fecha_registro: null // Se usará CURRENT_TIMESTAMP
//           })
           
//           resultados.push({ ci: ciLimpio, status: "OK", aporte})
//         } catch (err) {
//           console.error('Error al crear aporte:', err)
//           resultados.push({
//             ci: ciLimpio, 
//             status: "Error", 
//             message: `Error al crear aporte: ${err.message}`
//           })
//         }
//       }
       
//       return res.json({ok: true, resultados})
//     } catch (error) {
//       console.error("Error en bulkUpload: ", error)
//       return res.status(500).json({ 
//         ok: false, 
//         error: "Error al procesar el archivo",
//         details: error.message
//       })
//     }
//   }
}
