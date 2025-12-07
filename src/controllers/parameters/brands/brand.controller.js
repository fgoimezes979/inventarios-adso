


const Brand = require('../../../models/parameters/brands/brand.model')
const { Op } = require("sequelize");
/**lista todos los registros de la tabla marcas/ */

const index = async (req, res) =>{



    const brands =await  Brand.findAll({})
   
   
   
    return res.status(201).json({
        status: true,
        msg: "marcas listadas de forma correcta",
        brands: brands
    
    
    
});
}
/**controlador para crear una marca */

const create = async (req, res) =>{

    const {code, name} = req.body;

    const brand = await Brand.findOne( {
           where: {
            [Op.or]:
               [
                {code: code},
                {name: name}
                ]
            
           }
        });

    if(!brand)
    {
        const brandCreate = await Brand.create(req.body, {})
         return res.status(201).json({
        status: true,
        msg: "marcas listadas de forma correcta",
        brand: brandCreate,
        });
        }
        else

        {

        
    return res.status(409).json({
        status: false,
        msg: "el codigo o nombre de marca ya existe",
        brand: null,
    });
    
    
   }

}
/**muestra una marca especifica por su id */

const show = async (req, res) =>{

    const{id} = req.params;

    const brand = await  Brand.findByPk(id,{});
    if(!brand)
    {
        return res.status(404).json({
            status: false,
            msg: "marca no encontrada",
            brands:null,
            });
        
    }
        else
        {
           
       return res.status(201).json({
        status: true,
        msg: "marca encontrada",
        brand:brand,
        });
    

        }
   
    


}
/**actualizar una marca por su */
const update = async (req, res) =>{
  
  
    const{ id } = req.params;
    const brand = await  Brand.findByPk(id,{});
    
    
    if(!brand)
    {
        return res.status(404).json({
            status: false,
            msg: "marca a actualiza no encontrada",
            brand:null
            });
        
        }
        else
        {
           /**actualizar la informacion */
           await Brand.update(req.body, {
            where:{
                id: id,
            }
            })

            const brandUpdate = await  Brand.findByPk(id,{});
            /** */
        return res.status(201).json({
        status: true,
        msg: "marca actualizada de forma correcta.",
        brand: brandUpdate
        });
        }

        
    
    
        }
        
        
    

/**elimina una marca por su id */

const destroy = async (req, res) =>{

    const{id} = req.params;
     const brand = await  Brand.findByPk(id,{});
    
    
    if(!brand)
    {
        return res.status(404).json({
            status: false,
            msg: "marca no encontrada",
            brand:null,
            });
        
    }
        else
        {
          await brand.destroy({});
           
    return res.status(201).json({
        status: true,
        msg: "marca eliminada correctamente",
        brand: brand
        });
    

        }
   

    

}
//**exportar los mrtodos */

module.exports = {
    index, 
    create,
    show,
    update,
    destroy
};

