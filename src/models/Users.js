const mongoose = require("mongoose");
const validator  = require("validator");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minLenght: 4,
      maxLength: 30,
      trim: true,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("*Check your gender");
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowerCase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong");
        }
      },
    },

  },
  { timestamps: true }
);

userSchema.methods.getJwt = async function(){
    const user = this 
    const token = await jwt.sign({_id:user._id},"Mahesh@Token",{expiresIn:"10d"})
    return token
}

userSchema.methods.validatePassword = async function(password){
    const user = this 
    const hashedPassword = user.password 

    const isValid = await bcrypt.compare(password,hashedPassword)

    return isValid
}
    



const Users = mongoose.model("Users",userSchema)

module.exports = {Users}