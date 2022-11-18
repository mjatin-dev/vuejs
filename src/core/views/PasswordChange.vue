<template>
  <div
    class="logged-out-container p-d-flex p-flex-column p-jc-center p-ai-center"
  >
    <div class="logged-out-form">
      <h1>Change Password</h1>
      <div class="form-container">
        <div class="p-field">
          <label for="new_password">New Password</label>
          <Password
            id="new_password"
            :feedback="true"
            v-model="newPassword"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        <Button @click="onSubmitClick" label="Submit" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Password from 'primevue/password'
import Button from 'primevue/button'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('Password', Password)
Vue.component('Button', Button)

export default Vue.extend({
  name: 'PasswordChange',
  data: () => {
    return {
      newPassword: '' as string,
    }
  },
  computed: {
    isFormValid: function () {
      if (this.newPassword != '') {
        return true
      }
      return false
    },
  },
  created: function () {
    if (!this.$route.query.token) {
      this.$router.push('/sign-in')
    }
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

      this.$store.getters.services.users
        .changePassword(this.$route.query.token, this.newPassword)
        .then(
          (response) => {
            this.$store.getters.services.authentication.logout()
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Password changed.',
              life: 3000,
            })
            this.$router.push('/sign-in')
          },
          (error) => {
            this.$store.getters.services.authentication.logout()
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error changing password. Please try again.',
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