export enum AlertMessageSeverity {
  'success' = 'success',
  'info' = 'info',
  'warn' = 'warn',
  'error' = 'error',
}

export default class AlertMessage {
  constructor(
      public severity: AlertMessageSeverity, 
      public summary: string,
      public detail?: string,
      public life?: number
      ) {}
}
