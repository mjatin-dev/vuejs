import UserSetup from '../models/UserSetup'
import InitialResponse from '../models/InitialResponse'
import axios from 'axios'

/* eslint-disable @typescript-eslint/camelcase */

export default class AuthenticationService {
  constructor(public isDevMode: boolean = false) {}

  public login(userData: UserSetup) {
    if (this.isDevMode) {
      return new Promise((resolve, reject) => {
        axios
          .post('authenticate', {
            emailAddress: userData.email,
            password: userData.password,
          })
          .then(
            (response) => {
              window.localStorage.setItem('dev-email', userData.email)
              window.localStorage.setItem('dev-password', userData.password)
              window.localStorage.removeItem('lgo')
              resolve(InitialResponse.fromResponseObject(response.data))
            },
            (error) => {
              window.localStorage.setItem('lgo', '1')
              reject(error)
            }
          )
      })
    }

    return new Promise((resolve, reject) => {
      axios
        .post(
          'authenticate',
          {
            emailAddress: userData.email,
            password: userData.password,
          },
          {
            withCredentials: true
          }
        )
        .then(
          (response) => {
            window.localStorage.removeItem('lgo')
            resolve(InitialResponse.fromResponseObject(response.data))
          },
          (error) => {
            window.localStorage.setItem('lgo', '1')
            reject(error)
          }
        )
    })
  }

  public refreshAccessToken() {
    if (this.isDevMode) {
      return new Promise((resolve, reject) => {
        axios
          .post('authenticate', {
            emailAddress: window.localStorage.getItem('dev-email'),
            password: window.localStorage.getItem('dev-password'),
          })
          .then(
            (response) => {
              window.localStorage.removeItem('lgo')
              resolve(InitialResponse.fromResponseObject(response.data))
            },
            (error) => {
              window.localStorage.setItem('lgo', '1')
              reject(error)
            }
          )
      })
    }

    return new Promise((resolve, reject) => {
      axios
        .post(
          'refreshToken',
          {},
          {
            withCredentials: true
          }
        )
        .then(
          (response) => {
            window.localStorage.removeItem('lgo')
            resolve(InitialResponse.fromResponseObject(response.data))
          },
          (error) => {
            window.localStorage.setItem('lgo', '1')
            reject(error)
          }
        )
    })
  }

  public logout() {
    if (this.isDevMode) {
      window.localStorage.removeItem('dev-email')
      window.localStorage.removeItem('dev-password')
    }

    //Set "logged out" flag
    window.localStorage.setItem('lgo', '1')
  }
}
