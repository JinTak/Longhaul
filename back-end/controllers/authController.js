let jwt = require('jwt-simple');
let DB = require('../models');
let User = DB.models.User;
let bcrypt = require('bcrypt');
let secretString = "SecretJWTString"

let authenticate = (req, res)=>{
    User.findAll({where:{
        username: req.body.name
    }})
    .then((user)=>{
        if(!user.username){
            return res.status(403).send({success:false, msg: "No such user was found."});
        }else{
            bcrypt.compare(req.body.password, user.password, (err, isValid)=>{
                if(!isValid||err){
                    return res.status(403).send({success:false, msg: "Incorrect Password."})
                }else{
                    let token = jwt.encode(user, secretString);
                    res.json({success: true, token: token});
                }
            });
        }
    });
}

let signUp = (req,res)=>{
    if(!req.body.name||!req.body.password){
        res.json({success: false, msg:"Please enter both a username AND a password"});
    }else{
        User.findAll({where:{
            username: req.body.name
        }})
        .then((user)=>{
            if(user.username){
                return res.json({success: false, msg:"Username already exists.  Please choose another"});
            } else{
                let newUser = {
                    username: req.body.name,
                    password: req.body.password
                };
                User.create(newUser)
                .then((user)=>{
                    let token = jwt.encode(user, secretString);
                    res.json({success: true, token: token, msg: "Welcome to Longhaul!"});
                });
            }
        });
    }
}

let hasGoodToken = (req, res, next)=>{
    if(req.headers.authorization && req.headers.authorization.split(' ')[0]==='Bearer'){
        let decodedToken = decodeToken(req);
        return res.json({success: true, msg:"You have a token.  Now Change this to a next!", decodedToken.name});
    }else{
        return res.json({success: false, msg:"error: invalid token!"});
    }

}

let decodeToken = (req)=>{
    //.name, .password etc will be returned.
    return jwt.decode(req.headers.authorization.split(' ')[1], secretString);
}

module.exports.authenticate=authenticate;
module.exports.signUp=signUp;
module.exports.hasGoodToken=hasGoodToken;
module.exports.decodeToken=decodeToken;