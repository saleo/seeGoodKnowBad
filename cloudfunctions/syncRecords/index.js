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
    return {
      success: false,
      error: err.message
    }
  }
}
