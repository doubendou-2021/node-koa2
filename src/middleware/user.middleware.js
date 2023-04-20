const bcrypt = require('bcryptjs');
const { getUserInfo } = require('../service/user.service');
const {
  userAlreadyExisted,
  userValidate,
  userRegisterError,
} = require('../constant/err.type');

// 验证用户是否为空
const userValidator = async (ctx, next) => {
  const { user_name, password } = ctx.request.body;
  if (!user_name || !password) {
    console.error('用户名或密码为空！', ctx.request.body);
    ctx.app.emit('error', userValidate, ctx);
    return;
  }

  await next();
};

// 验证用户是否已经存在
const verifyUser = async (ctx, next) => {
  const { user_name } = ctx.request.body;

  try {
    const res = await getUserInfo({ user_name });
    if (res) {
      console.error('用户名已经存在！', { user_name });
      ctx.app.emit('error', userAlreadyExisted, ctx);
      return;
    }
  } catch (err) {
    console.error('获取用户信息错误', err);
    ctx.app.emit('error', userRegisterError, ctx);
    return;
  }
  await next();
};

// 密码加密
const cryptPassword = async (ctx, next) => {
  const { password } = ctx.request.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  ctx.request.body.password = hash;

  await next();
};

module.exports = {
  userValidator,
  verifyUser,
  cryptPassword,
};