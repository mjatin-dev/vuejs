import Tactic from '../models/Tactic'
import axios from 'axios'
import TacticFieldValue from '../models/TacticFieldValue'
import ID from '../models/ID'
import TacticsImportMapping from '../models/TacticsImportMapping'
import MediaAsset from '../models/MediaAsset'

const TACTICS_PATH = 'tactics'
const TACTIC_PATH = 'tactic'
const TACTIC_FIELD_VALUES_PATH = 'tactic_field_values'

export default class TacticsService {
  public create(newTactic: Tactic) {
    return new Promise((resolve, reject) => {
      axios
        .post(TACTICS_PATH, { ...newTactic.forRequestObject(), id: null })
        .then(
          (response) => {
            resolve(Tactic.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public get(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.get(`${TACTICS_PATH}/${ids.toString()}`).then(
        (response) => {
          ids.length !== 0
            ? resolve(Tactic.fromResponseObject(response.data))
            : resolve(
              response.data.map((tactic) => Tactic.fromResponseObject(tactic))
            )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public update(updatedTactic: Tactic, changedFields?: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TACTICS_PATH}/${updatedTactic.id.intID}`, {
          ...updatedTactic.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(Tactic.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public delete(id: number) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TACTICS_PATH}/${id}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public import(fileBinary: string) {
    return new Promise((resolve, reject) => {
      axios.post(`${TACTIC_PATH}/import}`, fileBinary).then(
        (response) => {
          resolve(
            response.data.map((tactic) => Tactic.fromResponseObject(tactic))
          )
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public search(
    planId: number,
    keyword: string,
    widesearch?: boolean,
    startDate?: Date,
    endDate?: Date,
    userId?: number,
    channelId?: number,
    typeId?: number
  ) {
    return new Promise((resolve, reject) => {
      //TODO: must send empty body with Content-Type header set to application/ld+json
      axios
        .post(`${TACTICS_PATH}/${planId}/search`, {}, {
          params: {
            keyword,
            widesearch,
            startDate,
            endDate,
            userId,
            channelId,
            typeId,
          },
        })
        .then(
          (response) => {
            resolve(
              response.data.map((tactic) => Tactic.fromResponseObject(tactic))
            )
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public createTacticFieldValue(newFieldValue: TacticFieldValue) {
    return new Promise((resolve, reject) => {
      axios
        .post(TACTIC_FIELD_VALUES_PATH, {
          ...newFieldValue.forRequestObject(),
          id: null,
        })
        .then(
          (response) => {
            resolve(TacticFieldValue.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public updateTacticFieldValue(
    updatedFieldValue: TacticFieldValue,
    changedFields?: string[]
  ) {
    return new Promise((resolve, reject) => {
      axios
        .put(`${TACTIC_FIELD_VALUES_PATH}/${updatedFieldValue.id.intID}`, {
          ...updatedFieldValue.forRequestObject(),
        })
        .then(
          (response) => {
            resolve(TacticFieldValue.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public deleteTacticFieldValue(ids: number[]) {
    return new Promise((resolve, reject) => {
      axios.delete(`${TACTIC_FIELD_VALUES_PATH}/${ids.toString()}`).then(
        (response) => {
          resolve(response.data)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public importTacticsFile(tacticTypeIntId: number, fileToImport) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${TACTICS_PATH}/import/${tacticTypeIntId.toString()}`, fileToImport)
        .then(
          (response) => {
            resolve(TacticsImportMapping.fromResponseObject(response.data))
          },
          (error) => {
            reject(error)
          }
        )
    })
  }

  public importCustomFieldImage(tacticId: number, tacticTypeIntId: number, fileToImport) {
    return new Promise((resolve, reject) => {
      axios.post(`media_assets`, fileToImport).then(
        (response) => {
          resolve(MediaAsset.fromResponseObject(response.data))
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  public getMediaAsset(id: number) {
    return axios
      .get(`media_assets/${id}`)
      .then((response) => MediaAsset.fromResponseObject(response.data))
  }

  public mapTacticsImport(tacticImportMapping: TacticsImportMapping) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${TACTICS_PATH}/import-column-definitions`,
          tacticImportMapping.forRequestObject()
        )
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

  public confirmTacticsImport(tacticsImportMapping: TacticsImportMapping, planId: ID, rowIndiciesToCreate: number[]) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${TACTICS_PATH}/import-confirm`, {
          id: tacticsImportMapping.id,
          confirm: true,
          planId: planId.apiID,
          rows: rowIndiciesToCreate,
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
}
