export default class AccessToken {
    constructor(
        public token: string = 'null'
        ) {}

    get expiryDate() {
        const tokenPayload = JSON.parse(atob(this.token.substring(this.token.indexOf('.') + 1, this.token.lastIndexOf('.'))));
        return new Date(tokenPayload.exp * 1000);
    }
  }
  