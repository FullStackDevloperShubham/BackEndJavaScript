import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponce } from '../utils/ApiResponce.js'


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "something went wrong while generating refresh and access token")
  }
}





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



const loginUser = asyncHandler(async (req, res) => {

  //req body -> data
  // username or email
  // find the user 
  // password check 
  // access and refresh token 
  // send cookies


  const { email, username, password } = req.body
  if (!username || !password) {
    throw new ApiError(400, "username and password are required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(400, "User not found")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is not correct")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password , -refreshToken")

  const options = {
    httpOnly: true,
    secire: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedInUser, accessToken,
          refreshToken
        },
        "User is logged in successfully"
      )
    )

})


//logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true,
    }
  )
  const options = {
    httpOnly: true,
    secire: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "user logged out"))
})


export { registerUser, loginUser, logoutUser }


