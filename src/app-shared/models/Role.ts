import ID from './ID'

export default class Role {
  constructor(
    public id: ID = new ID(),
    public level: number = 0,
    public title: string = '',
    public description: string = ''
  ) {}

  public static LEVEL_ACCOUNT_OWNER = 100
  public static LEVEL_ACCOUNT_ADMIN = 150
  public static LEVEL_MASTER_PLAN_ADMIN = 200
  public static LEVEL_PLAN_ADMIN = 250
  public static LEVEL_CONTRIBUTOR = 300
  public static LEVEL_VIEWER = 350

  public static USER_LEVELS = [
    {
      level: 100,
      name: 'Account Owner',
    },
    {
      level: 150,
      name: 'Account Admin',
    },
    {
      level: 200,
      name: 'Master Plan Admin',
    },
    {
      level: 250,
      name: 'Plan Admin',
    },
    {
      level: 300,
      name: 'Contributor',
    },
    {
      level: 350,
      name: 'Viewer',
    },
  ]

  public static fromResponseObject(obj): Role {
    if (!obj) return new Role()

    return new Role(
      ID.fromResponseObject(obj.id, 'roles'),
      obj.level,
      obj.title,
      obj.description
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      level: this.level,
      title: this.title,
      description: this.description,
    }
  }
}
