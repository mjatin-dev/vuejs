import User from '../models/User'
import UserInvite from '../models/UserInvite'
import axios from 'axios'
import UserRole from '../models/UserRole'
import InitialResponse from '../models/InitialResponse'

const USER_PATH = 'user'
const USERS_PATH = 'users'
const USER_INVITE_PATH = 'user_invites'
const USER_TOKEN_PATH = 'usertoken'
const SET_PASSWORD_PATH = 'user-password-with-token'
const USER_ROLES_PATH = 'user_roles'

export default class UsersService {
  public create(newUser: User) {
    return new Promise((resolve, reject) => {
      axios.post(USERS_PATH, {...newUser.forRequestObject(), id: null}).then(
        (response) => {
          resolve(User.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public get(id: number) {
    return new Promise((resolve, reject) => {
      axios.get(`${USERS_PATH}/${id}`).then(
        (response) => {
          resolve(User.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Users endpoint no longer accpets array of ID values, leaving this method in place in case array of IDs is allowed in the future - JV 03.09.22
  public getUsers(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(USERS_PATH, {params: ids.join('&ids[]=')}).then(
        // axios.get(`${USERS_PATH}?ids[]=${ids.join('&ids[]=')}`).then(

        (response) => {
          resolve(
            response.data.map((userData) => User.fromResponseObject(userData))
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getRoles(ids: any[]): Promise<UserRole[]> {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `${USER_ROLES_PATH}?${ids
            .map((id) => 'ids[]=' + id.toString())
            .join('&')}`
        )
        .then(
          (response) => {
            ids.length === 0
              ? resolve([UserRole.fromResponseObject(response.data)])
              : resolve(
                  response.data.map((user) => User.fromResponseObject(user))
                )
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public getRolesByPlan(planId: number) {
    return new Promise((resolve, reject) => {
      axios.get(`${USER_ROLES_PATH}?plan.id=${planId}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedUser: User) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${USERS_PATH}/${updatedUser.id.intID}`, {
          ...updatedUser.forRequestObject(),
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

  public delete(userToDelete: User) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${USERS_PATH}/${userToDelete.id.intID.toString()}`, {
          ...userToDelete,
          idDeleted: true,
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

  public invite(newUserInvite: UserInvite) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${USER_INVITE_PATH}`, {...newUserInvite.forRequestObject()})
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

  public deleteUserInvite(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${USER_INVITE_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getUserRole(updatedUserRole: UserRole) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${USER_ROLES_PATH}/${updatedUserRole.id.intID}`, {
          ...updatedUserRole.forRequestObject(),
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

  public updateUserRole(updatedUserRole: UserRole) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${USER_ROLES_PATH}/${updatedUserRole.id.intID}`, {
          ...updatedUserRole.forRequestObject(),
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

  public forgotPassword(emailAddress: string) {
    return new Promise((resolve, reject) => {
      axios.post(`${USER_PATH}/forgotpassword/${emailAddress}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public changePassword(token: string, newPassword: string) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${USER_TOKEN_PATH}/${token}`, {
          password: newPassword,
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

  public setPassword(token: string, newPassword: string) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${SET_PASSWORD_PATH}/${token}`, {
          password: newPassword,
        })
        .then(
          (response) => {
            resolve(InitialResponse.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public mediaAsset(file) {
    return new Promise((resolve, reject) => {
      axios.post(`media_assets`, file).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createUserRole(newUserRole: UserRole) {
    return new Promise((resolve, reject) => {
      axios.post(`${USER_ROLES_PATH}`, newUserRole.forRequestObject()).then(
        (response) => {
          resolve(UserRole.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public deleteUserRole(id: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${USER_ROLES_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public resendInvite(id: number) {
    return new Promise((resolve, reject) => {
      axios.get(`${USERS_PATH}/${id}/resend-invitation`).then(
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
