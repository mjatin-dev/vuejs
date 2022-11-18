export default class ID {
  constructor(public intID: number = 0, public apiID: string = '') {}

  public static fromResponseObject(obj, path): ID {
    if (!obj) return new ID()
    if (obj.id) obj = obj.id
    if(typeof obj == 'number'){
      return new ID(obj, `/api/${path}/${obj}`)
    }else if(typeof obj == 'string') {
      return new ID(Number(obj.split(/[/ ]+/).pop()), obj)
    }else{
      return new ID()
    }
  }

  public clone(): ID {
    return new ID(this.intID, this.apiID)
  }
}
