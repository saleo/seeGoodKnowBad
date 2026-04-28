const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  void event

  try {
    const { OPENID } = cloud.getWXContext()

    const db = cloud.database()
    const userCollection = db.collection('users')

    let user = await userCollection.where({ _openid: OPENID }).get()

    if (user.data.length === 0) {
      await userCollection.add({
        data: {
          _openid: OPENID,
          nickName: '微信用户',
          avatarUrl: '',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      openid: OPENID,
      message: '登录成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}
