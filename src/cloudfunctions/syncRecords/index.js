const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { records } = event
  const { OPENID } = cloud.getWXContext()

  try {
    const db = cloud.database()
    const recordCollection = db.collection('records')

    for (const record of records) {
      await recordCollection.add({
        data: {
          _openid: OPENID,
          type: record.type,
          content: record.content,
          createdAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      message: '同步成功'
    }
  } catch (err) {
    // 处理集合不存在的错误
    if (err.message && (err.message.includes('DATABASE_COLLECTION_NOT_EXISTS') || err.message.includes('collection not exists'))) {
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
