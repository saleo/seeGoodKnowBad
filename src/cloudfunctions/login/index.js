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
    // 如果集合不存在，返回更友好的错误提示
    if (err.message.includes('DATABASE_COLLECTION_NOT_EXISTS') || err.message.includes('collection not exists')) {
      return {
        success: false,
        error: '数据库初始化中，请稍后重试',
        code: 'DB_NOT_READY'
      }
    }
    return {
      success: false,
      error: err.message
    }
  }
}