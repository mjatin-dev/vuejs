import PlanDocument from '../models/PlanDocument'
import PlanDocumentCategory from '../models/PlanDocumentCategory'
import axios from 'axios'

const DOCUMENT_PATH = 'plan_documents'
const DOCUMENT_CATEGORIES_PATH = 'plan_document_categories'

export default class DocumentsService {
  public get(id) {
    return new Promise((resolve, reject) => {
      axios.get(`${DOCUMENT_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public create(newDocument: PlanDocument) {
    return new Promise((resolve, reject) => {
      axios
        .post(DOCUMENT_PATH, {...newDocument.forRequestObject(), id: null})
        .then(
          (response) => {
            resolve(response.data)
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public update(updatedDocument: PlanDocument) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${DOCUMENT_PATH}/${updatedDocument.id}`, {
          ...updatedDocument.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(response.data)
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(id) {
    return new Promise((resolve, reject) => {
      axios.delete(`${DOCUMENT_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getCategories() {
    return new Promise((resolve, reject) => {
      axios.get(`${DOCUMENT_CATEGORIES_PATH}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getCategory(id) {
    return new Promise((resolve, reject) => {
      axios.get(`${DOCUMENT_CATEGORIES_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createCategory(newDocumentCategory: PlanDocumentCategory) {
    return new Promise((resolve, reject) => {
      axios
        .post(DOCUMENT_CATEGORIES_PATH, {
          ...newDocumentCategory.forRequestObject(),
          id: null,
        })
        .then(
          (response) => {
            resolve(response.data)
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public updateCategory(updatedCategory: PlanDocumentCategory) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${DOCUMENT_CATEGORIES_PATH}/${updatedCategory.id.intID}`, {
          ...updatedCategory.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(response.data)
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public deleteCategory(id) {
    return new Promise((resolve, reject) => {
      axios.delete(`${DOCUMENT_CATEGORIES_PATH}/${id}`).then(
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
