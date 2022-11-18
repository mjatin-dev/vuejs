<template>
  <div class="date-range-container">
    <form id="dateRangeForm" class="p-field">
      <template v-if="isRangeView">
        <div class="range p-d-flex">
          <div class="p-field p-mr-2">
            <label for="startDate">Start Date</label>
            <Calendar
              id="startDate"
              v-model="dateRangeStart"
              :manualInput="false"
              :monthNavigator="true"
              :yearNavigator="true"
              :yearRange="$store.getters.datePickerYearRange"
              :showIcon="true"
              selectionMode="single"
              dateFormat="mm/dd/yy"
            />
          </div>
          <div class="p-field">
            <label for="endDate">End Date</label>
            <Calendar
              id="endDate"
              v-model="dateRangeEnd"
              :manualInput="false"
              :monthNavigator="true"
              :yearNavigator="true"
              :yearRange="$store.getters.datePickerYearRange"
              :showIcon="true"
              selectionMode="single"
              dateFormat="mm/dd/yy"
            />
          </div>
        </div>
      </template>

      <template v-if="isMonthView">
        <label for="dateMonth">Month</label>
        <div class="month p-d-flex p-buttonset">
          <Button
            icon="pi pi-chevron-left"
            class="btn-previous-month p-button-outlined"
            @click="onClickPreviousMonth"
          />
          <Calendar
            id="dateMonth"
            v-model="dateMonth"
            :manualInput="false"
            :yearNavigator="true"
            :yearRange="$store.getters.datePickerYearRange"
            :showIcon="true"
            selectionMode="single"
            dateFormat="MM yy"
            view="month"
          />
          <Button
            icon="pi pi-chevron-right"
            class="btn-next-month p-button-outlined"
            @click="onClickNextMonth"
          />
        </div>
      </template>

      <template v-if="isDayView">
        <label for="dateDay">Day</label>
        <div class="day p-d-flex p-buttonset">
          <Button
            icon="pi pi-chevron-left"
            class="btn-previous-day p-button-outlined"
            @click="onClickPreviousDay"
          />
          <Calendar
            id="dateDay"
            v-model="dateDay"
            :manualInput="false"
            :yearNavigator="true"
            :yearRange="$store.getters.datePickerYearRange"
            :showIcon="true"
            selectionMode="single"
            dateFormat="D, MM d yy"
            view="date"
          />
          <Button
            icon="pi pi-chevron-right"
            class="btn-next-day p-button-outlined"
            @click="onClickNextDay"
          />
        </div>
      </template>
    </form>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import Calendar from 'primevue/calendar'

Vue.component('Calendar', Calendar)

export default Vue.extend({
  name: 'DateRangePicker',
  props: {
    isRangeView: {
      type: Boolean,
      default: false,
    },
    isMonthView: {
      type: Boolean,
      default: false,
    },
    isDayView: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      tempDateRange: [] as Date[],
    }
  },
  computed: {
    dateRangeStart: {
      get(): Date[] {
        return this.$store.getters.currentDateRange[0]
      },
      set(newDate: Date) {
        this.tempDateRange[0] = newDate
        this.$store.dispatch('updateCurrentDateRange', this.tempDateRange)
      },
    },
    dateRangeEnd: {
      get(): Date[] {
        return this.$store.getters.currentDateRange[1]
      },
      set(newDate: Date) {
        this.tempDateRange[1] = newDate
        this.$store.dispatch('updateCurrentDateRange', this.tempDateRange)
      },
    },
    dateMonth: {
      get(): Date {
        return this.$store.getters.currentDateRange[0]
      },
      set(newMonth: Date) {
        this.$store.dispatch('updateCurrentDateRange', [
          newMonth,
          new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
        ])
      },
    },
    dateDay: {
      get(): Date {
        return this.$store.getters.currentDateRange[0]
      },
      set(newDay: Date) {
        this.$store.dispatch('updateCurrentDateRange', [newDay, newDay])
      },
    },
  },
  mounted: function () {
    this.tempDateRange = this.$store.getters.currentDateRange
  },
  methods: {
    onClickPreviousMonth: function () {
      this.dateMonth = new Date(
        this.dateMonth.getFullYear(),
        this.dateMonth.getMonth() - 1,
        1
      )
    },
    onClickNextMonth: function () {
      this.dateMonth = new Date(
        this.dateMonth.getFullYear(),
        this.dateMonth.getMonth() + 1,
        1
      )
    },
    onClickPreviousDay: function () {
      this.dateDay = new Date(
        this.dateDay.getFullYear(),
        this.dateDay.getMonth(),
        this.dateDay.getDate() - 1
      )
    },
    onClickNextDay: function () {
      this.dateDay = new Date(
        this.dateDay.getFullYear(),
        this.dateDay.getMonth(),
        this.dateDay.getDate() + 1,
        1
      )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.date-range-container {
  .range {
    .p-inputtext {
      padding-right: 2.4rem;
    }
  }
  .month,
  .day {
    .p-datepicker-trigger {
      display: none;
    }
  }
  .btn-previous-month,
  .btn-next-month,
  .btn-previous-day,
  .btn-next-day {
    width: 3.2rem;
  }
  .btn-previous-month,
  .btn-previous-day {
    border-right: 0;

    &:hover {
      border-right: 0 !important;
    }
  }
  .btn-next-month,
  .btn-next-day {
    border-left: 0;

    &:hover {
      border-left: 0 !important;
    }
  }
  .p-datepicker-trigger {
    margin-left: -2.4rem;
    background: transparent;
    border: none;

    &:hover {
      background: transparent;
      border: none;
    }

    .p-button-icon {
      font-size: 1.2rem;
      color: #000;
    }
  }
  .p-inputtext {
    @include font-bold;
    color: #000;
  }
}
</style>
