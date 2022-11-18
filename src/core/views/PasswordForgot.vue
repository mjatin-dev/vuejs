<template>
  <div
    class="logged-out-container p-d-flex p-flex-column p-jc-center p-ai-center"
  >
    <div class="logged-out-form">
      <h1>Forgot Password</h1>
      <div class="form-container" v-if="!isEmailSent">
        <div class="p-field">
          <label for="log_in_email">Email Address</label>
          <InputText
            id="log_in_email"
            type="email"
            v-model="emailAddress"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        <Button @click="onSubmitClick" label="Submit" />
      </div>
      <div class="success-message-container" v-if="isEmailSent">
        <p>An email has been sent to you with a link to reset your password.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('InputText', InputText)
Vue.component('Password', Password)
Vue.component('Button', Button)

export default Vue.extend({
  name: 'PasswordForgot',
  data: () => {
    return {
      emailAddress: '' as string,
      emailPattern: new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,20}$/),
      isEmailSent: false as boolean,
    }
  },
  computed: {
    isFormValid: function () {
      if (this.emailPattern.test(this.emailAddress)) {
        return true
      }
      return false
    },
  },
  methods: {
    onSubmitClick: function () {
      if(!this.isFormValid){
        Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Please complete all fields.',
            life: 3000,
          })
        return
      }

      this.$store.getters.services.users.forgotPassword(this.emailAddress).then(
        (response) => {
          this.$store.getters.services.authentication.logout()
          this.isEmailSent = true
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Email sent.',
            life: 3000,
          })
        },
        (error) => {
          this.$store.getters.services.authentication.logout()
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error sending email address. Please try again.',
            life: 3000,
          })
        }
      )
    },
  },
})
</script>

<style lang="scss">
</style>