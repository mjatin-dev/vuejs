export default class DuplicateSubscriptionEventMapping {
  constructor(
    public subscriptionId: number = 0,
    public eventId: number = 0,
    public duplicateSubscriptionId: number = 0,
    public duplicateEventId: number = 0,
  ) {}
}
