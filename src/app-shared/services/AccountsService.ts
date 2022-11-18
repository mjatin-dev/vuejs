import Account from '../models/Account'
import Role from '../models/Role'
import Subscription from '../models/Subscription'
import axios from 'axios'
import Tactic from '../models/Tactic'

const ACCOUNT_PATH = 'accounts'
const ROLE_PATH = 'roles'
const SUBSCRIPTION_PATH = 'subscriptions'

export default class AccountsService {
  public create(newAccount: Account) {
    return new Promise((resolve, reject) => {
      axios
        .post(ACCOUNT_PATH, {...newAccount.forRequestObject(), id: null})
        .then(
          (response) => {
            resolve(Account.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${ACCOUNT_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(
            ids.length === 0
              ? response.data.map((account) =>
                  Account.fromResponseObject(account)
                )
              : Account.fromResponseObject(response.data)
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedAccount: Account, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${ACCOUNT_PATH}/${updatedAccount.id.intID}`, {
          ...updatedAccount.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(Account.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${ACCOUNT_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getRoles() {
    return new Promise((resolve, reject) => {
      axios.get(`${ROLE_PATH}`).then(
        (response) => {
          resolve(response.data.map((role) => Role.fromResponseObject(role)))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getSubscriptions(accountId?: number) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          accountId
            ? `${SUBSCRIPTION_PATH}?account_equals_or_null=${accountId}`
            : `${SUBSCRIPTION_PATH}`
        )
        .then(
          (response) => {
            if (response.data.length) {
              resolve(
                response.data.map((subscriptionObj) => {
                  return Subscription.fromResponseObject(subscriptionObj)
                })
              )
            } else {
              reject('No Subscriptions Available.')
            }
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public getSubscriptionEvents(subscription: Subscription) {
    return new Promise((resolve, reject) => {
      axios.get(`${SUBSCRIPTION_PATH}/${subscription.id.intID}/events`).then(
        (response) => {
          resolve(
            response.data.events.map((subscriptionEvent) =>
              Tactic.fromResponseObject(subscriptionEvent)
            )
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createSubscription(subscription: Subscription) {
    return new Promise((resolve, reject) => {
      axios
        .post(SUBSCRIPTION_PATH, {...subscription.forRequestObject()})
        .then((response) => resolve(response.data))
    })
  }

  public updateSubscription(newSubscription: Subscription) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${SUBSCRIPTION_PATH}/${newSubscription.id.intID}`, {
          ...newSubscription.forRequestObject(),
        })
        .then((response) => resolve(response.data))
    })
  }

  public deleteSubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
      axios.delete(`${SUBSCRIPTION_PATH}/${subscriptionId}`).then(
        (response) => {
          resolve(response)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }
}
