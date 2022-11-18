import Tag from '../models/Tag'
import axios from 'axios'

const TAG_PATH = 'tags'

export default class TagsService {
  public create(newTag: Tag) {
    return new Promise((resolve, reject) => {
      axios.post(TAG_PATH, {...newTag.forRequestObject(), id: null}).then(
        (response) => {
          resolve(Tag.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${TAG_PATH}/${ids.toString()}`).then(
        (response) => {
          ids.length !== 0
            ? resolve(Tag.fromResponseObject(response.data))
            : resolve(response.data.map((tag) => Tag.fromResponseObject(tag)))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedTag: Tag, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TAG_PATH}/${updatedTag.id.intID}`, {
          ...updatedTag.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(Tag.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(id: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TAG_PATH}/${id}`).then(
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
