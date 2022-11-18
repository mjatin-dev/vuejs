import Plan from '../models/Plan'
import axios from 'axios'
import Channel from '../models/Channel'
import TacticPlatform from '../models/TacticPlatform'

const PLAN_PATH = 'plan'
const PLANS_PATH = 'plans'
const VISITED_USER_PATH = 'plan-visited'
const UPDATE_VISITED_USER_PATH = 'user-visited-plan'

export default class PlansService {
  public create(newPlan: Plan, shouldCreateDefaultChannels = true) {
    return new Promise((resolve, reject) => {
      axios
        .post(PLANS_PATH, {
          ...newPlan.forRequestObject(),
          id: null,
          shouldCreateDefaultChannels: shouldCreateDefaultChannels,
        })
        .then(
          (response) => {
            resolve(Plan.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${PLANS_PATH}/${ids.toString()}`).then(
        (response) => {
          ids.length !== 0
            ? resolve(Plan.fromResponseObject(response.data))
            : resolve(
                response.data.map((plan) => Plan.fromResponseObject(plan))
              )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // TODO: remove super plan methods
  public getChannelsFromSuperPlan() {
    return new Promise((resolve, reject) => {
      axios.get(`${PLANS_PATH}/${Plan.SUPER_PLAN_ID.toString()}`).then(
        (response) => {
          resolve(
            response.data.channels.map((channel) =>
              Channel.fromResponseObject(channel)
            )
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // TODO: remove super plan methods
  public getPlatformsFromSuperPlan() {
    return new Promise((resolve, reject) => {
      axios.get(`${PLANS_PATH}/${Plan.SUPER_PLAN_ID.toString()}`).then(
        (response) => {
          resolve(
            response.data.tacticPlatforms.map((platform) =>
              TacticPlatform.fromResponseObject(platform)
            )
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedPlan: Plan, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${PLANS_PATH}/${updatedPlan.id.intID}`, {
          ...updatedPlan.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(Plan.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(ids) {
    return new Promise((resolve, reject) => {
      axios.delete(`${PLANS_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public export(id: number) {
    return new Promise((resolve, reject) => {
      axios.get(`${PLAN_PATH}/${id}/export`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public freeze(id: number) {
    return new Promise((resolve, reject) => {
      axios.patch(`${PLAN_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public unfreeze(id: number) {
    return new Promise((resolve, reject) => {
      axios.patch(`${PLAN_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getViewedRoles() {
    return new Promise((resolve, reject) => {
      axios.get(`${VISITED_USER_PATH}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public updateVisitedPlan(payload) {
    return new Promise((resolve, reject) => {
      axios.post(UPDATE_VISITED_USER_PATH, payload).then(
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
