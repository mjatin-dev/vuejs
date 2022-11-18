<template>
  <div class="p-timepicker annum-timepicker">
    <div class="p-hour-picker">
      <button type="button" class="p-link" @click="incrementHours">
        <span class="pi pi-chevron-up"></span>
      </button> 
      <input type="number" max="12" min="0" @change="e => setHour(e.target.value)" :value="dateHour < 10 ? '0' + dateHour : dateHour"  @click="(e) => focusField(e)" @focus="(e) => focusField(e)" />
      <button type="button" class="p-link" @click="decrementHours">
        <span class="pi pi-chevron-down"></span>
      </button>
    </div>
    <div class="p-separator">
      <span>:</span>
    </div>
    <div class="p-minute-picker">
      <button type="button" class="p-link" @click="incrementMinutes">
        <span class="pi pi-chevron-up"></span>
      </button>
      <input type="number" max="59" min="0" @change="e => setMinutes(e.target.value)" :value="dateMinutes < 10 ? '0' + dateMinutes : dateMinutes"  @click="(e) => focusField(e)" @focus="(e) => focusField(e)" />
      <button type="button" class="p-link" @click="decrementMinutes">
        <span class="pi pi-chevron-down"></span>
      </button>
    </div>
    <div class="p-separator">
      <span>:</span>
    </div>
    <div class="p-ampm-picker">
      <button type="button" class="p-link" @click="toggleAmPm">
        <span class="pi pi-chevron-up"></span>
      </button>
      <span @click="toggleAmPm">{{ dateAmOrPm }}</span>
      <button type="button" class="p-link"  @click="toggleAmPm">
        <span class="pi pi-chevron-down"></span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { setMinutes, setHours } from 'date-fns'

export default Vue.extend({
  name: 'TimePicker',
  props: {
    date: Date as new () => Date,
    setDate: Function
  },
  methods: {
    setHour(hour) {
      if (hour > 0 && hour < 13) {
        this.setDate(setHours(this.date, hour))
      } else {
        this.$forceUpdate() // return back to previous
      }
    },
    setMinutes(minutes) {
      if (minutes > -1 && minutes < 60) {
        this.setDate(setMinutes(this.date, minutes))
      } else {
        this.$forceUpdate() // return back to previous
      }
    },
    toggleAmPm() {
      const difference = this.date.getHours() >= 13 ? -12 : 12
      this.setDate(setHours(this.date, this.date.getHours() + difference))
    },
    incrementHours() {
      this.setHour(this.date.getHours() === 23 ? 0 : this.date.getHours() + 1)
    },
    decrementHours() {
      this.setHour(this.date.getHours() === 0 ? 23 : this.date.getHours() - 1)
    },
    incrementMinutes() {
      this.setMinutes(this.date.getMinutes() === 59 ? 0 : this.date.getMinutes() + 1)
    },
    decrementMinutes() {
      this.setMinutes(this.date.getMinutes() === 0 ? 59 : this.date.getMinutes() - 1)
    },
    focusField(e) {
      setTimeout(() => e.target.select(), 5)
    }
  },
  computed: {
    dateHour(): number {
      let newHour = this.date.getHours() > 12 ? this.date.getHours() - 12 : this.date.getHours()
      newHour = newHour === 0 ? 12 : newHour
      return newHour < 10 ? Number(`0${newHour}`) : newHour
    },
    dateMinutes(): number {
      return this.date.getMinutes()
    },
    dateAmOrPm(): string {
      return this.date.getHours() > 11 ? 'PM' : 'AM'
    }
  }
})
</script>

<style lang="scss">
.annum-timepicker {
  padding-top: 1rem;
  input[type=number] {
    width: 20px;
    padding: 0;
    border: 0;
    text-align: center;
    font-family: "MulishSemibold", Helvetica, Arial, sans-serif;
    font-size: 1.286rem;

    &:focus, &:active {
      border: 1px solid black;
    }
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
}
</style>