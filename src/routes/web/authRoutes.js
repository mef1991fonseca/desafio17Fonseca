import express from "express";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local"; //estrategia para autenticar por correo y password.
import bcrypt from "bcrypt"; //encriptar las contraseñas
import {UserModel} from "../../models/user.js"

const authRouter = express.Router();

// authRouter.get("/",(req,res)=>{
//     res.redirect("/home")
// });

// authRouter.get("/login",(req,res)=>{
//     if(req.session.userName){
//         res.redirect("home");
//     } else{
//         res.render("login");
//     }
// });

// authRouter.post("/login",(req,res)=>{
//     const {name} = req.body;
//     // console.log("name", name);
//     if(name){
//         req.session.userName = name;
//         res.redirect("/home");
//     } else{
//         res.render("login",{error:"por favor ingresa el usuario"});
//     }
// });

// authRouter.get("/logout",(req,res)=>{
//     const name = req.session?.userName;
//     if(name){
//         req.session.destroy(error=>{
//             if(!error){
//                 return res.render("logout", {name:name});
//             } else{
//                 res.redirect("/home")
//             }
//         });
//     } else{
//         res.redirect("/home");
//     }
// });

//export {authRouter};


//TRAIGO TODO
//configurar passport
authRouter.use(passport.initialize()); //conectamos a passport con express.
authRouter.use(passport.session());//vinculacion entre passport y las sesiones de nuestros usuarios.

//serializar un usuario
passport.serializeUser((user,done)=>{
    done(null, user.id)
});

//deserializar al usuario
passport.deserializeUser((id,done)=>{
    //validar si el usuario existe en db.
    UserModel.findById(id,(err, userFound)=>{
        return done(err, userFound)
    })
});
//crear una funcion para encriptar la contrase;
// estaesmiPass => ahjsgduyqwte234296124ahsd-hash
const createHash = (password)=>{
    const hash = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
    return hash;
}

//Validar contraseña
const isValidPassword = (user, password)=>{
    return bcrypt.compareSync(password, user.password);
}

//estrategia de registro utilizando passport local.
passport.use("signupStrategy", new LocalStrategy(
    {
        passReqToCallback:true,
        usernameField: "email"
    },
    (req,username,password,done)=>{
        //logica para registrar al usuario
        //verificar si el usuario exitse en db
        UserModel.findOne({username:username},(error,userFound)=>{
            if(error) return done(error,null,{message:"Hubo un error"});
            if(userFound) return done(null,null,{message:"El usuario ya existe"});
            //guardamos el usuario en la db
            const newUser={
                name:req.body.name,
                username:username,
                password:createHash(password)
            };
            UserModel.create(newUser,(error,userCreated)=>{
                if(error) return done(error, null, {message:"Hubo un error al registrar el usuario"})
                return done(null,userCreated);
            })
        })
    }
));

passport.use('loginStrategy', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    (req,username, password, done) => {
        console.log(username);
        UserModel.findOne({ username: username }, (err, user)=> {
            console.log(user);
            if (err) return done(err, null, {message: "Hubo un error en el logueo"});
            if (!user) return done(null, false);
            if (!user.password) return done(null, false);
            if (!isValidPassword(user,password)){
                console.log('existen datos')
                return done(null,false,{message:'password invalida'})
            }
            return done(null, user);
        });
    }
));

//rutas asociadas a las paginas del sitio web
authRouter.get("/",(req,res)=>{
    res.render("login")
});

authRouter.get("/registro",(req,res)=>{
    const errorMessage = req.session.messages ? req.session.messages[0] : '';
    res.render("signup", {error:errorMessage});
    req.session.messages = [];
});

authRouter.get("/inicio-sesion",(req,res)=>{
    res.render("login")
});

authRouter.get("/perfil",(req,res)=>{
    // res.render("profile");
    //console.log(req.session)
    if(req.isAuthenticated()){
        res.render("home");
    } else{
        res.send("<div>Debes <a href='/inicio-sesion'>Iniciar sesion</a> o <a href='/registro'>registrarte</a></div>")
    }
});

//ruta de logout con passport
authRouter.get("/logout",(req,res)=>{
    req.logout(err=>{
        if(err) return res.send("hubo un error al cerrar sesion")
        req.session.destroy();
        res.redirect("/")
    });
});

//rutas de autenticacion registro
authRouter.post("/signup",passport.authenticate("signupStrategy",{
    failureRedirect:"/registro",
    failureMessage: true, //req.sessions.messages.
}),(req,res)=>{
    res.redirect("/perfil")
    //console.log(req.body)
});

//ruta de autenticacion login
authRouter.post("/login",passport.authenticate('loginStrategy',{
    failureRedirect: "/perfil",
    failureMessage:true
}),(req,res)=>{
    res.redirect("/perfil")
    //console.log(req.body)
})

export {authRouter};