export enum RecurrenceFrequency {
  'DAILY' = 'DAILY',
  'WEEKLY' = 'WEEKLY',
  'MONTHLY' = 'MONTHLY',
  'YEARLY' = 'YEARLY',
}

export enum RecurrenceByweekday {
  'SU' = 'SU',
  'MO' = 'MO',
  'TU' = 'TU',
  'WE' = 'WE',
  'TH' = 'TH',
  'FR' = 'FR',
  'SA' = 'SA'
}

export default class CustomRecurrence {
  constructor(
    public interval: number = 1,
    public freq: RecurrenceFrequency = RecurrenceFrequency[
      'MONTHLY'
    ],
    public byweekday: RecurrenceByweekday = RecurrenceByweekday['MO'],
    public monthlyRule: string = '',
    public recurrenceText: string = ''
  ) {}
}
