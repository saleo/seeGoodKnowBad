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
    return {
      success: false,
      error: err.message
    }
  }
}
