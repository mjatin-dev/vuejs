import Budget from '../models/Budget'
import axios from 'axios'

const BUDGET_PATH = 'budgets'

export default class BudgetsService {
  public create(newBudget: Budget) {
    return new Promise((resolve, reject) => {
      axios.post(BUDGET_PATH, {...newBudget.forRequestObject(), id: null}).then(
        (response) => {
          resolve(Budget.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${BUDGET_PATH}/${ids.toString()}`).then(
        (response) => {
          ids.length !== 0
            ? resolve(Budget.fromResponseObject(response.data))
            : resolve(response.data.map((budget) => Budget.fromResponseObject(budget)))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedBudget: Budget, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios.put(`${BUDGET_PATH}/${updatedBudget.id.intID}`, {...updatedBudget.forRequestObject()}).then(
        (response) => {
          resolve(Budget.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public delete(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${BUDGET_PATH}/${ids.toString()}`).then(
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
