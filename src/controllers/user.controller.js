import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponce } from '../utils/ApiResponce.js'

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend   
  //validation  - not empty
  //check if user aleary exist - username and email
  //check for images , check for avatar
  //upload them to cloudinary , avatar 
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation 
  //return res

  const { username, email, fullName, password, Avatar } = req.body
  console.log(`email: ${email} \n password: ${password} \n Avatar: ${Avatar} \n username: ${username} \n fullname: ${fullName} `)

  if (
    [fullName, email, username, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  //displaying the above variables
  console.log(`avatarLocalPath =>${(avatarLocalPath)} \n\n coverImageLocalPath=> ${coverImageLocalPath}`)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar localpath does not exist")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImageocalPath is not found")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage,
    email,
    password,
    username: username.toLowerCase()
  })


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestring the user")
  }

  return res.status(201).json(new ApiResponce(200, createdUser, "User register successfully"))
})



export { registerUser }


