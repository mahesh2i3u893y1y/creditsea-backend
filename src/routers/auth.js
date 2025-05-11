const express = require("express");
const bcrypt = require("bcrypt");
const { Users } = require("../models/Users");


const authRouter = express.Router();


authRouter.post("/signup", async (req, res) => {
  try {
    const { userName, email, password, gender } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({
      userName,
      email,
      password: hashedPassword,
      gender,
   
    });

    await user.save();
    res.status(200).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});


authRouter.post("/login", async (req,res) => {
    const {email,password} = req.body 
    try{
        const user = await Users.findOne({email:email})
        if(!user){
            throw new Error("User not Found")
        }
        const isPassword = await user.validatePassword(password)
        if(isPassword){
            const token = await user.getJwt()
            res.cookie("token",token)
            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                  id:user._id,
                  name: user.userName,
                  email: user.email,
                //   profilePic: user.profilePic,
                },
              });
        }else{
            res.status(400).json({ error: "Invalid credentials: " + err.message });
        }

    }catch(err){
        res.status(500).json({ error: "Server error:" + err.message });
    }
})



authRouter.post("/logout", async (req,res) => {
    try{
        res.cookie("token",null , {
            expires : new Date(Date.now())
        })

        res.status(200).json({message:"Logout Succesfully!!"})

    }catch(err){
        res.status(500).json({ error: "Server error:" + err.message });
    }
})



module.exports = authRouter