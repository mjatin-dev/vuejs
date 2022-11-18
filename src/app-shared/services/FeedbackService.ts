import axios from 'axios'
import browserInfo from 'browser-info'

const FEEDBACK_PATH = '/site-feedback'

export default class FeedbackService {
  public sendFeedback(userFeedback) {

    return new Promise((resolve, reject) => {
      const info = browserInfo()

      axios
        .post(FEEDBACK_PATH, {
          ...userFeedback,
          comment: userFeedback.comment,
          browser: `${info.name} v${info.fullVersion}`,
          os: info.os
        })
        .then(resolve, (error) => {
          reject(error)
        })
    })
  }
}