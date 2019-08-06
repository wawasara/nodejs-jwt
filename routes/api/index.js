const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth");
const auth = require("./auth");
const user = require("./user");

router.use("/auth", auth);
router.use("/user", authMiddleware); // authMiddleware 에서 검증되지 않으면 아래 /user 가 실행 안됨
router.use("/user", user);

module.exports = router;
