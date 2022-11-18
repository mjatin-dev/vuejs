export enum UserFeedbackType {
  'Bug Report' = 'Bug Report',
  'Feature Request' = 'Feature Request',
}

export default class UserFeedback {
  constructor(
    public comment: string = '',
    public type: UserFeedbackType = UserFeedbackType['Bug Report'],
    public browser: string = '',
    public os: string = ''
  ) {}
}