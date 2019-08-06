const jwt = require("jsonwebtoken");
const User = require("../../../models/user");

/*
    POST /api/auth
    {
        username,
        password
    }
*/
exports.register = (req, res) => {
  const { username, password } = req.body;
  let newUser = null;

  const create = user => {
    if (user) {
      // 이미 회원이므로 등록 불가
      throw new Error("username exists");
    } else {
      return User.create(username, password);
    }
  };

  const count = user => {
    newUser = user;
    return User.countDocuments({}).exec();
  };

  const assign = count => {
    if (count === 1) {
      return newUser.assignAdmin();
    } else {
      return Promise.resolve(false); // 그냥 return 하면 Promise 가 안되므로, Promise.resolve() 로 결과 리턴
    }
  };

  const respond = isAdmin => {
    res.json({
      message: "registered successfully",
      admin: isAdmin ? true : false
    });
  };

  // run when there is an error (username exists)
  const onError = error => {
    res.status(409).json({
      message: error.message
    });
  };

  // check username duplication
  User.findOneByUsername(username) // findOneByUsername 이 null 이면 회원이 없음
    .then(create) // user 가 null 이면 create 호출
    .then(count) // create 후 user 수 확인
    .then(assign) // 첫 회원이면 admin 으로 설정하고
    .then(respond) // response 를 회신함
    .catch(onError); // 등록 회원이면 에러 메시지 노출
};

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/
exports.login = (req, res) => {
  const { username, password } = req.body;
  const secret = req.app.get("jwt-secret"); // app.js 에서 'jwt-secret' 을 설정함

  // check the user info & generate the jwt
  const check = user => {
    if (!user) {
      // user does not exist
      throw new Error("login failed");
    } else {
      // user exists, check the password
      if (user.verify(password)) {
        // create a promise that generates jwt asynchronously
        const p = new Promise((resolve, reject) => {
          jwt.sign(
            {
              _id: user._id,
              username: user.username,
              admin: user.admin
            },
            secret,
            {
              expiresIn: "7d",
              issuer: "velopert.com",
              subject: "userInfo"
            },
            (err, token) => {
              if (err) reject(err);
              resolve(token);
            }
          );
        });
        return p;
      } else {
        throw new Error("login failed");
      }
    }
  };

  // respond the token
  const respond = token => {
    res.json({
      message: "logged in successfully",
      token
    });
  };

  // error occured
  const onError = error => {
    res.status(403).json({
      message: error.message
    });
  };

  // find the user
  User.findOneByUsername(username)
    .then(check)
    .then(respond)
    .catch(onError);
};

/*
    GET /api/auth/check
*/
exports.check = (req, res) => {
  res.json({
    success: true,
    info: req.decoded
  });
};
