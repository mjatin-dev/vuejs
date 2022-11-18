import CustomView from '../models/CustomView'
import axios from 'axios'

const CUSTOM_VIEW_PATH = 'custom_views'

export default class CustomViewsService {
  public create(newCustomView: CustomView) {
    return new Promise((resolve, reject) => {
      axios.post(CUSTOM_VIEW_PATH, {...newCustomView.forRequestObject(), id: null}).then(
        (response) => {
          resolve(CustomView.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${CUSTOM_VIEW_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(
            response.data.map((view) => CustomView.fromResponseObject(view))
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedCustomView: CustomView, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${CUSTOM_VIEW_PATH}/${updatedCustomView.id.intID}`, {...updatedCustomView.forRequestObject()})
        .then(
          (response) => {
            resolve(CustomView.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${CUSTOM_VIEW_PATH}/${ids.toString()}`).then(
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
