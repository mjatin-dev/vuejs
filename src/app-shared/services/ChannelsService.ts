import Channel from '../models/Channel'
import axios from 'axios'
import TacticType from '../models/TacticType'
import TacticField from '../models/TacticField'
import ID from '../models/ID'
import TacticPlatform from '../models/TacticPlatform'

const CHANNEL_PATH = 'channels'
const TACTIC_PLATFORM_PATH = 'tactic_platforms'
const TACTIC_TYPE_PATH = 'tactic_types'
const TACTIC_FIELD_PATH = 'tactic_fields'

export default class ChannelsService {
  public create(newChannel: Channel) {
    return new Promise((resolve, reject) => {
      axios
        .post(CHANNEL_PATH, {...newChannel.forRequestObject(), id: null})
        .then(
          (response) => {
            resolve(Channel.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${CHANNEL_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(
            response.data.map((channel) => Channel.fromResponseObject(channel))
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedChannel: Channel, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${CHANNEL_PATH}/${updatedChannel.id.intID}`, {
          ...updatedChannel.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(Channel.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }
  public delete(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${CHANNEL_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createTacticPlatform(newPlatform: TacticPlatform) {
    return new Promise((resolve, reject) => {
      axios
        .post(TACTIC_PLATFORM_PATH, {
          ...newPlatform.forRequestObject(),
          id: null,
        })
        .then(
          (response) => {
            resolve(TacticPlatform.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public updateTacticPlatform(updatedPlatform: TacticPlatform) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TACTIC_PLATFORM_PATH}/${updatedPlatform.id.intID}`, {
          ...updatedPlatform.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(TacticPlatform.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public deleteTacticPlatform(platformIntId: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TACTIC_PLATFORM_PATH}/${platformIntId.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createTacticType(newType: TacticType) {
    return new Promise((resolve, reject) => {
      axios
        .post(TACTIC_TYPE_PATH, {...newType.forRequestObject(), id: null})
        .then(
          (response) => {
            resolve(TacticType.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public updateTacticType(updatedType: TacticType) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TACTIC_TYPE_PATH}/${updatedType.id.intID}`, {
          ...updatedType.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(TacticType.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public deleteTacticType(typeIntId: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TACTIC_TYPE_PATH}/${typeIntId.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public createTacticField(newField: TacticField) {
    return new Promise((resolve, reject) => {
      axios
        .post(TACTIC_FIELD_PATH, {...newField.forRequestObject(), id: null})
        .then(
          (response) => {
            resolve(TacticField.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public updateTacticField(updatedField: TacticField) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TACTIC_FIELD_PATH}/${updatedField.id.intID.toString()}`, {
          ...updatedField.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(TacticField.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public deleteTacticField(fieldIntId: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TACTIC_FIELD_PATH}/${fieldIntId.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public exportChannel(channelId: ID, typeIds: ID[], format = 'csv') {
    return new Promise((resolve, reject) => {
      axios
        .post(`/channels-export`, {
          channel: channelId.intID,
          tacticTypes: typeIds.map((id) => id.intID),
          exportType: format,
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

  public getChannels() {
    return new Promise((resolve, reject) => {
      axios.get(`${CHANNEL_PATH}`).then(
        (response) => {
          resolve(
            response.data.map((channel) => Channel.fromResponseObject(channel))
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }
}
