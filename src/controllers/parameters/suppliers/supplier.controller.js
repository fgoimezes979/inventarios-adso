


const Supplier = require('../../../models/parameters/suppliers/supplier.model')
const { Op } = require("sequelize");
/**lista todos los registros de la tabla proveedor/ */

const index = async (req, res) =>{



    const suppliers =await  Supplier.findAll({})
   
   
   
    return res.status(201).json({
        status: true,
        msg: "proveedor listado de forma correcta",
        suppliers: suppliers
    
    
    
});
}
/**controlador para crear una proveedor */
 
const create = async (req, res) => {
  try {
    let {
      nit,
      name,
      type,
      direction,
      phone,
      email,
      isActive // 👈 recibimos camelCase desde Angular
    } = req.body;

    nit = nit?.trim().toUpperCase();
    name = name?.trim();

    if (!nit || !name) {
      return res.status(400).json({
        status: false,
        msg: 'El código y el nombre son obligatorios',
        supplier: null
      });
    }

    // Verificar si ya existe un proveedor con ese NIT
    const exist = await Supplier.findOne({ where: { nit } });
    if (exist) {
      return res.status(409).json({
        status: false,
        msg: 'Ya existe un proveedor con ese código',
        supplier: null
      });
    }

    // Crear proveedor en la DB usando snake_case
    const newSupplier = await Supplier.create({
      nit,
      name,
      type,
      direction,
      phone,
      email,
      isActive: isActive ?? false
    });

    return res.status(201).json({
      status: true,
      msg: 'Proveedor creado correctamente',
      supplier: newSupplier
    });

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
      supplier: null
    });
  }
};

/**muestra una proveedor especifica por su id */

const show = async (req, res) =>{

    const{id} = req.params;

    const supplier = await  Supplier.findByPk(id,{});
    if(!supplier)
    {
        return res.status(404).json({
            status: false,
            msg: "proveedor no encontrado",
            suppliers:null,
            });
        
    }
        else
        {
           
       return res.status(201).json({
        status: true,
        msg: "proveedor encontrado",
        supplier:supplier,
        });
    

        }
   
    


}
/**actualizar una proveedor por su */
const update = async (req, res) =>{
  
  
    const{ id } = req.params;
    const supplier = await  Supplier.findByPk(id,{});
    
    
    if(!supplier)
    {
        return res.status(404).json({
            status: false,
            msg: "proveedor a actualiza no encontrado",
            supplier:null
            });
        
        }
        else
        {
           /**actualizar la informacion */
           await Supplier.update(req.body, {
            where:{
                id: id,
            }
            })

            const supplierUpdate = await  Supplier.findByPk(id,{});
            /** */
        return res.status(201).json({
        status: true,
        msg: "proveedor actualizado de forma correcta.",
        supplier: supplierUpdate
        });
        }

        
    
    
        }
        
        
    

/**elimina una proveedor por su id */

const destroy = async (req, res) =>{

    const{id} = req.params;
     const supplier = await  Supplier.findByPk(id,{});
    
    
    if(!supplier)
    {
        return res.status(404).json({
            status: false,
            msg: "proveedor no encontrado",
            supplier:null,
            });
        
    }
        else
        {
          await supplier.destroy({});
           
    return res.status(201).json({
        status: true,
        msg: "proveedor eliminado correctamente",
        supplier: supplier
        });
    

        }
   

    

}
//**exportar los metodos */

module.exports = {
    index, 
    create,
    show,
    update,
    destroy
};

