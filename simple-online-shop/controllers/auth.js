const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("errorUser");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  UserModel.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("errorUser", "Invalid Email or Password"); // alert user if email & passowrd invalid
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true; // create session
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          console.log("Incorrect Password");
          return res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignUp = (req, res) => {
  let message = req.flash("errorUser");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postSignUp = (req, res) => {
  const email = req.body.email; // get value from form
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  UserModel.findOne({ email: email })
    .then((userDoc) => {
      req.flash("errorUser", "Email Address Already Exist");
      if (userDoc) {
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new UserModel({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          console.log("Register Successful");
          res.redirect("/");
        });
    })
    .catch((err) => {
      console.log("Register Failed", err);
    });
};