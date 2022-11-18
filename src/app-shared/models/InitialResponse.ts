import AccessToken from './AccessToken'
import User from './User'
import Role from './Role'
import Account from './Account'

export default class InitialResponse {
  constructor(
    public accessToken: AccessToken = new AccessToken(),
    public refreshToken: string = 'null',
    public user: User = new User(),
    public accounts: Account[] = [],
    public roles: Role[] = []
  ) {}

  public static fromResponseObject(obj): InitialResponse {
    if (!obj) return new InitialResponse()

    const accounts = [] as Account[]
    if (Array.isArray(obj.account)) {
      obj.account.forEach((element) => {
        accounts.push(Account.fromResponseObject(element))
      })
    } else if (obj.accounts) {
      obj.accounts.forEach((element) => {
        accounts.push(Account.fromResponseObject(element))
      })
    } else {
      accounts.push(Account.fromResponseObject(obj.account))
    }

    const roles = [] as Role[]
    if (obj.roles) {
      obj.roles.forEach((element) => {
        roles.push(Role.fromResponseObject(element))
      })
    }

    return new InitialResponse(
      new AccessToken(obj.accessToken.token),
      obj.accessToken.refreshToken,
      User.fromResponseObject(obj.user),
      accounts,
      roles
    )
  }
}
