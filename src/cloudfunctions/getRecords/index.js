const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const db = cloud.database()
    const recordCollection = db.collection('records')

    const result = await recordCollection
      .where({ _openid: OPENID })
      .orderBy('createdAt', 'desc')
      .get()

    return {
      success: true,
      records: result.data
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
