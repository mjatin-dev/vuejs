<template>
  <div class="central-content">
    <Checkbox
      :id="`calendar-${index}`"
      v-model="calendar.selected"
      :binary="true"
      class="p-mr-2 custom__checkbox"
      @click="handleClick(calendar.selected)"
    />
    <div class="calendar__trigger calendar-label" v-if="!calendar.opened">
      {{ calendar.name }}
    </div>
    <div v-else class="custom__opened">
      <div class="calendar-field">
        <div>
          <label :for="`calendar-${calendar.id.intID}-name`">Name</label>
        </div>
        <InputText
          :id="`calendar-${calendar.id.intID}-name`"
          type="text"
          v-model="calendar.editValues.name"
          v-if="isEditable"
        />
        <h3 v-else class="text-detail">{{ calendar.editValues.name }}</h3>
        <span class="">
          <i
            class="pi pi-trash trash-icon"
            @click="() => handleCalendarDelete(calendar, calendar.id.intID)"
            v-if="isEditable"
          />
          <i
            class="pi pi-check save-icon"
            @click="() => handleCalendarEdit(calendar)"
            v-if="isEditable"
          />
        </span>
      </div>
      <div class="calendar-field">
        <div><label for="">Description</label></div>
        <TextArea
          type="text"
          v-model="calendar.editValues.description"
          v-if="isEditable"
        />
        <h3 v-else class="text-detail">
          {{ calendar.editValues.description }}
        </h3>
      </div>
      <div class="calendar-field" v-if="isEditable">
        <div><label for="">Public address in iCal format</label></div>
        <p class="calendar-path">
          {{ calendar.calendarPath }}
        </p>
      </div>
    </div>
    <span
      :class="`calendar__arrow pi pi-chevron-${
        calendar.opened ? 'down' : 'right'
      }`"
      @click="() => (calendar.opened = !calendar.opened)"
    ></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import TextArea from 'primevue/textarea'
import Subscription from '@/app-shared/models/Subscription'

Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('TextArea', TextArea)

export default Vue.extend({
  name: 'PlanSettingsSubscriptionDetail',
  data: () => {
    return {
      customCalendars: [] as Subscription[],
    }
  },
  props: {
    calendar: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isEditable: {
      type: Boolean,
    },
  },
  components: {},
  created() {
    this.customCalendars = this.$store.getters.allSubscriptions.filter(
      (subscription) => subscription.accountId.intID !== 0
    )
  },
  computed: {
    defaultCalendars(): Subscription[] {
      return this.$store.getters.allSubscriptions.filter(
        (subscription) => subscription.accountId.intID === 0
      )
    },
  },

  methods: {
    handleCalendarEdit(calendar) {
      calendar.name = calendar.editValues.name
      calendar.description = calendar.editValues.description
      calendar.organization = calendar.editValues.organization
      this.$store.getters.services.accounts
        .updateSubscription(calendar)
        .then(() => {
          calendar.opened = false
        })
    },
    handleCalendarDelete(calendar, calendarId) {
      this.$store.getters.services.accounts
        .deleteSubscription(calendarId)
        .then(() => {
          calendar.opened = false
          this.$emit('deleteSubscription',calendarId)
        })
    },
    handleClick(selected) {
      const getPrevious = this.defaultCalendars.filter(
        (item) => item.id.intID === this.calendar.id.intID
      )

      if (selected !== getPrevious[0].selected) {
        this.$emit('changesMade')
      }
    },
  },
  watch: {
    calendar: {
      // This will let Vue know to look inside the array
      deep: true,

      // We have to move our method to a handler field
      handler() {
        console.log('The list of colours has chanddged!')
      },
    },
  },
})
</script>


<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.main_title {
  font-size: 17px;
}
.calendars-container {
  max-width: 1020px;
  width: 100%;
  margin: 0 auto;
  li {
    padding: 10px;
    border-bottom: 1px solid black;
    min-height: 40px;
    &:first-child {
      border-top: 1px solid black;
    }
  }

  .custom-calendars-text {
    @include font-mulish-light;
    text-align: center;
    font-size: 14px !important;
  }

  .calendar_arrow {
    float: right;
  }

  .title {
    @include font-mulish-light;
    font-size: 21px !important;
    background-color: white;
  }

  .subtitle {
    display: none;
  }

  .infoText {
    font-size: 16px !important;
  }
}

.standard {
  position: relative;
  .checkbox {
    position: absolute;
    .p-checkbox-icon {
      transform: translate(8px, -2px);
    }
  }
  .calendar-label {
    @include font-mulish-light;
    padding-left: 30px;
    font-size: 16px;
  }
  .calendar-field {
    // padding: 10px;
    padding: 0px 10px 10px 10px;
  }
  .calendar__opened {
    padding-left: 25px;
    input {
      min-width: 800px;
    }
  }
  .central-content {
    position: relative;
  }
  span {
    position: absolute;
    top: 5px;
    right: 10px;
  }
}
.custom {
  position: relative;

  li:last-child {
    border: none;
  }

  .title {
    @include font-mulish-light;
    font-size: 21px !important;
    background-color: white;
    margin-bottom: 4px !important;
  }
  .infoText {
    font-size: 16px !important;
    margin-bottom: 20px !important;
    a {
      color: #0074daff !important;
      border-bottom: 1px solid #0074daff;
    }
  }

  &__checkbox {
    position: absolute;
  }
  .calendar-label {
    @include font-mulish-light;
    padding-left: 30px;
    font-size: 16px;
  }
  .calendar-field {
    // padding: 10px;
    padding: 0px 10px 10px 10px;
    @include font-mulish-light;
    label {
      @include font-mulish-light;
      font-size: 11px;
    }
  }

  .calendar-path {
    @include font-mulish-light;
    font-size: 16px;
    max-width: 700px;
    overflow-wrap: anywhere;
    margin-top: 0;
  }

  .save-icon,
  .trash-icon {
    margin-right: 15px;
    float: right;
    font-size: 20px;
    width: 27px;
    height: 27px;
    text-align: center;
    padding-top: 3px;
    border-radius: 3px;
    background-color: transparent;
  }
  .custom__opened {
    padding-left: 25px;
    input {
      min-width: 800px;
    }
  }
  .central-content {
    position: relative;
  }
  .calendar__arrow {
    position: absolute;
    top: 5px;
    right: 10px;
  }
}
.input-bottom-container {
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  .input-bottom {
    width: 350px;
  }
}

.p-inputtextarea {
  width: 100%;
  max-width: 800px;
  min-height: 60px;
  resize: none;
}
.calendar-data-field {
  margin-bottom: 20px;
  @include font-mulish-light;
  h3 {
    @include font-mulish-light;
    margin: 0;
    margin-bottom: 3px;
  }
}

.add-calendar {
  @include font-mulish-light;
  font-size: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .pi-plus-circle {
    font-size: 13px;
  }
}

.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.onboarding-calendar-setup {
  .title {
    @include font-mulish-light;
    // margin-bottom: 0px !important;
  }
  .subtitle {
    display: none !important;
  }
  .infoText {
    @include font-mulish-light;
    font-size: 21px !important;
  }
}
.standard-cal-text {
  font-family: 'MulishLight', Helvetica, Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  max-width: 700px;
  overflow-wrap: anywhere;
  margin-top: 0;
}

.text-detail {
  @include font-mulish-light;
}
</style>
