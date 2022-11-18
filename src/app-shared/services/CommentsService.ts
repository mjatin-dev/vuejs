import Comment from '../models/Comment'
import axios from 'axios'

const COMMENT_PATH = 'comments'

export default class CommentsService {
  public create(newComment: Comment) {
    return new Promise((resolve, reject) => {
      axios.post(COMMENT_PATH, {...newComment.forRequestObject(), id: null}).then(
        (response) => {
          resolve(Comment.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${COMMENT_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(
            response.data.map((comment) =>
              Comment.fromResponseObject(comment.data)
            )
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedComment: Comment, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios.put(`${COMMENT_PATH}/${updatedComment.id}`, {...updatedComment.forRequestObject()}).then(
        (response) => {
          resolve(Comment.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public delete(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${COMMENT_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }
}
