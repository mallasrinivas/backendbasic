const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const registerController = async (req, res) => {
  // console.log("first", req.body);

  try {
    const existingUserQuery = `SELECT * FROM users WHERE email = ?`;
    const [existingUser] = await db.execute(existingUserQuery, [
      req.body.email,
    ]);

    if (existingUser.length > 0) {
      return res
        .status(200)
        .send({ message: "User Already Exists", success: false });
    }

    const password = req.body.password; // Note: Changed from obj.password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const insertUserQuery = `
      INSERT INTO users 
      (name, email, mobile_number, password, date_of_birth) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      req.body.name,
      req.body.email,
      req.body.mobileNumber,
      req.body.password,
      req.body.dateOfBirth,
    ];

    await db.execute(insertUserQuery, values);

    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  // console.log("first", req.body);
  try {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;
    const [user] = await db.execute(query, [email]);

    if (!user || user.length === 0) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid password", success: false });
    }

    const token = jwt.sign(
      { id: user[0].id },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: "1d",
      }
    );

    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error in login ctrl ${error.message}` });
  }
};

module.exports = {
  loginController,
  registerController,
};
