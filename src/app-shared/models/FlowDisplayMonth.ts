import FlowDisplayWeek from './FlowDisplayWeek'
import { PlanWeekStartDay } from './Plan'

export default class FlowDisplayMonth {
  constructor(
    public index: number = 0,
    public name: string = 'null',
    public firstDay: number = 0,
    public lastDay: number = 0,
    public month: number = 0,
    public year: number = 0,
    public weekStartDay: string = PlanWeekStartDay.Sunday
  ) {}

  public get numDays(): number {
    return this.lastDay - this.firstDay + 1
  }

  public get firstDate(): Date {
    return new Date(this.year, this.month, this.firstDay)
  }

  public get weeks(): FlowDisplayWeek[] {
    const returnArray = [] as FlowDisplayWeek[]
    const firstDate = new Date(this.year, this.month, 1)
    const lastDate = new Date(this.year, this.month + 1, 0)
    const numDays = lastDate.getDate()

    let index = 0
    let start = 1
    let end = 7 - firstDate.getDay()
    if (this.weekStartDay === PlanWeekStartDay.Monday) {
      if (firstDate.getDay() === 0) {
        end = 1
      } else {
        end = 7 - firstDate.getDay() + 1
      }
    }
    while (start <= numDays) {
      if(start > this.firstDay){
        if(end < this.lastDay){
          returnArray.push(new FlowDisplayWeek(index, start, end))
        }else if(end < this.lastDay + 7){
          returnArray.push(new FlowDisplayWeek(index, start, this.lastDay))
        }
      }else if(end >= this.firstDay){
        returnArray.push(new FlowDisplayWeek(index, this.firstDay, end, true))
      }
      start = end + 1
      end = end + 7
      end = start === 1 && end === 8 ? 1 : end
      if (end > numDays) {
        end = numDays
      }
      index += 1
    }
    return returnArray
  }
}
