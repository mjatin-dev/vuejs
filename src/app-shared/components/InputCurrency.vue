<template>
  <div class="anm-inputcurrency">
    <InputText
      v-model="localStringValue"
      :id="id"
      :disabled="disabled"
      type="text"
      autocomplete="off"
      placeholder="0"
      @focus="onTextFocus($event)"
      @blur="onTextBlur($event)"
      @input="onTextInput($event)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputnumber'

Vue.component('InputNumber', InputNumber)
Vue.component('InputText', InputText)

export default Vue.extend({
  name: 'InputCurrency',
  props: {
    value: Number,
    id: String,
    disabled: Boolean,
  },
  data: () => {
    return {
      localStringValue: '' as string,
    }
  },
  watch: {
    value() {
      this.updateInitialLocalStringValue()
    },
  },
  mounted: function () {
    this.updateInitialLocalStringValue()
  },
  methods: {
    updateInitialLocalStringValue() {
      if (this.localStringValue == '' && this.value) {
        this.localStringValue = this.value.toString()
        this.formatLocalStringValue(true)
      }
    },
    formatLocalStringValue(isBlur = false) {
      let returnString = this.localStringValue

      // Remove non-numeric characters and leading zero
      returnString = returnString.replace(/[^0-9.]/g, '')
      if (returnString[0] == '0') {
        returnString = returnString.substr(1)
      }

      // Manage decimals and commas if field lost focus
      if (isBlur && returnString.length) {
        // Manage decimals
        const firstDecimalIndex = returnString.indexOf('.')
        if (firstDecimalIndex < 0) {
          // Add cents
          returnString = returnString + '.00'
        } else if (firstDecimalIndex < returnString.length - 3) {
          // Only allow two decimal places
          returnString = returnString.substring(0, firstDecimalIndex + 3)
        } else if (firstDecimalIndex == returnString.length - 2) {
          // Update cents to two decimal places
          returnString = returnString + '0'
        } else if (firstDecimalIndex == returnString.length - 1) {
          // Add two decimal places if decimal is end of string
          returnString = returnString + '00'
        }

        // Round to nearest integer - Remove this section if API is updated to use doubles instead of ints for currency values
        returnString = Math.round(Number(returnString)).toString() + '.00'

        // Add commas
        const decimalSplitString = returnString.split('.')
        returnString =
          decimalSplitString[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
          '.' +
          decimalSplitString[1]
      }

      this.localStringValue = returnString
    },
    onTextInput(event) {
      // Round to nearest integer - Remove this section if API is updated to use doubles instead of ints for currency values
      const numberValue = Math.round(Number(event.replace(',', '')))
      this.$emit('update:value', numberValue)
      this.$emit('input', event)
    },
    onTextFocus(event) {
      this.$emit('focus', event)
    },
    onTextBlur(event) {
      this.formatLocalStringValue(true)
      this.$emit('blur', event)
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.anm-inputcurrency {
  position: relative;

  &:before {
    content: '$';
    display: block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 1rem;
  }
  input {
    padding-left: 1.6rem;

    &::placeholder {
      color: $primaryDarkColor;
    }
  }
}
</style>
