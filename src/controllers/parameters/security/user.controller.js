/**hastear una contraseña */

const bcrypt =require("bcrypt");
const { Op } = require ("sequelize");

const User = require('../../../models/security/user.model');
const { json } = require('sequelize');
const sequelize = require('../../../models/database/dbconnection');
const jwt = require('jsonwebtoken')

/**lista todos los registros de la tabla marcas/ */


const login = async (req, res) =>{

    try {

    const {email, password } = req.body;

    /**bruscar el usuario por email */

    const existUser = await User.findOne({
        where: {email: email}
    });
     /**usuario no existe */

    if(!existUser){
       
        return res.status(404).json({
            status:false,
            msg: "el usuario es invalido, verifiquelo",
            user: null,
        });

}

/**validar que la contraseña sea correcta,promero desencriptar la clave */


const validpassword =bcrypt.compareSync(password, existUser.password)

if (validpassword) {
  const token = jwt.sign(
    {
      id: existUser.id,
      email: existUser.email,
      role: existUser.role
    },
    process.env.JWT_SECRET || 'clave_secreta',
    { expiresIn: '1h' }
  );

  const { password, ...userSafe } = existUser.dataValues;

  return res.status(200).json({
    status: true,
    msg: "inicio de sesion correcta",
    user: userSafe,
    token: token
  });



}else
{
/**mensaje error contaseña invalida */

return res.status(404).json({
    status:false,
    msg: "el password es incorrecto, verifiquelo",
    user: null,


});
}


} catch (error) {
    return res.status(500).json({
        status:"error" + error.message,
        error:"hable con el administrador del sistema",
    });
}

}
const index = async (req, res) => {
  try {
    const users = await User.findAll({});
    return res.status(200).json(users); // ✅ devuelve directamente el array
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Error recuperando el listado de usuarios: " + error.message,
    });
  }
};

/**controlador para crear una usuarios*/

const create = async (req, res = response) =>{
    try {
        const {email, password} = req.body;
    /**buscar si existe un usuario con el email ya creado en base de datos */
const existUser = await User.findOne({where: {email:email}});
    
        

    if(existUser){
            
    return res.status(400).json({
        status: false,
        msg: "el correo que esta ingresado ya esta registrado",
        user: null,
    });
    }
    /**enctiptar la contraseña */
    const salt = await bcrypt.genSalt();
    req.body.password = await bcrypt.hash(password, salt);

    /**crear usuario */


        const userCreate = await User.create(req.body) 
         return res.status(201).json({
        status: true,
        msg: "usuario creado con exito",
        user: userCreate,
        });
     

    }catch(error) {

        return res.status(500).json({
            status: "error" + error.message,
            error: "hable con el administrador del sistema"
        });

        }

   

}

const show = async (req, res) =>{
        try {
    const{id} = req.params;

    const user = await  User.findByPk(id,{});
    if(!user)
    {
        return res.status(404).json({
            status: false,
            msg: `usuario con el id: ${id} no  encontrado en la base de datos`,
            users:null,
            });
        
    }
        else
        {
           
       return res.status(201).json({
        status: true,
        msg: "usuario  encontrado de forma correcta",
        user:user,
        });
    

        }

        } catch (error) {
            return res.status(500).json({
                status: false,
                msg: "error recuperando el usuario" + error.message,
                user: null,
            });
            }

            }
   
    
/**actualizar una usuariospor su */
const update = async (req, res) =>{
    const{ id } = req.params;
    const {email, password} = req.body;
  try {
   
    const user = await  User.findByPk(id,{});
    
    
    if(!user)
    {
        return res.status(404).json({
            status: false,
            msg: `usuarios con el id: ${id} no encontrado en  la base de datos`,
            user:null
            });
        
        }
        else
        {
             /**buscar si existe un usuario con el email ya creado en base de datos */
const existUser = await User.findOne(
    {where: {email: email, id: {[Op.ne]: id} }

    });
    
        

if(existUser){
        
return res.status(400).json({
    status: false,
    msg: "el correo que esta ingresado ya esta registrado",
    user: null,
});
}
            /**enctiptar la contraseña */
            const salt = await bcrypt.genSalt();
            req.body.password = await bcrypt.hash(password, salt);
            
           /**actualizar la informacion */
           await User.update(req.body, {
            where:{
                id: id,
            }
            })

            const userUpdate = await  User.findByPk(id,{});
            /** */
        return res.status(201).json({
        status: true,
        msg: `usuarios con el id: ${id} actualizado de forma correcta`,
        user: userUpdate
        });
        }
        } catch (error) {

            return res.status(500).json({
                status: false,
                msg: `error actualizando el usuario con el id: ${id}. - ${error.message}` ,
                user: null,
            });
    
    
        }
        }


    

/**elimina una usuariospor su id */

const destroy = async (req, res) =>{

    const{id} = req.params;
     const user = await  User.findByPk(id,{});
    
    try {
        
    if(!user)
        {
            return res.status(404).json({
                status: false,
                msg: `usuarios con el id: ${id} no encontrado en  la base de datos`,
                user:null,
                });
            
        }
            else
            {
              await user.destroy({});
               
        return res.status(201).json({
            status: true,
            msg: `usuarios con el id: ${id} eliminado de forma correcta`,
       
            });
            }
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            msg: `error eliminado el usuario con el id: ${id}. - ${error.message}` ,
            user: null,
        });

    }
    

        }
   

    


//**exportar los metodos */

module.exports = {
    login,
    index, 
    create,
    show,
    update,
    destroy
};

