const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { action, profile } = event

  try {
    const { OPENID } = cloud.getWXContext()
    const db = cloud.database()
    const userCollection = db.collection('users')

    if (action === 'updateProfile') {
      await userCollection.where({ _openid: OPENID }).update({
        data: {
          nickName: profile.nickName,
          avatarUrl: profile.avatarUrl,
          updatedAt: db.serverDate()
        }
      })

      return {
        success: true,
        message: '资料更新成功'
      }
    }

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
