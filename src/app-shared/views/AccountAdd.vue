<template>
  <div class="account-add-container">
    <div class="p-d-flex p-mb-4">
      <div class="p-field p-mr-4">
        <label for="accountName">Account Name</label>
        <InputText id="accountName" type="text" v-model="localAccountName" />
      </div>
    </div>
    <div class="p-d-flex p-mb-4">
      <div class="p-field p-mr-4">
        <label for="ownerFirstName">Owner First Name</label>
        <InputText id="ownerFirstName" type="text" v-model="localFirstName" />
      </div>
      <div class="p-field p-mr-4">
        <label for="ownerLastName">Owner Last Name</label>
        <InputText id="ownerLastName" type="text" v-model="localLastName" />
      </div>
      <div class="p-field">
        <label for="email">Owner Email address</label>
        <InputText
          id="email"
          type="email"
          v-model="localEmail"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
    </div>
    <div class="p-d-flex">
      <Button @click="handleCreateAccount">Create Account</Button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputText from 'primevue/inputtext'
import {AlertMessageSeverity} from '../models/AlertMessage'
import Account from '../models/Account'
import ID from '../models/ID'

Vue.component('InputText', InputText)

export default Vue.extend({
  name: 'AccountAdd',
  data: () => {
    return {
      localAccountName: '' as string,
      localFirstName: '' as string,
      localLastName: '' as string,
      localEmail: '' as string,
    }
  },
  computed: {},
  methods: {
    handleCreateAccount() {
      if (
        this.localAccountName == '' ||
        this.localFirstName == '' ||
        this.localLastName == '' ||
        this.localEmail == ''
      ) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'Please complete all fields.',
          life: 3000,
        })
        return
      }

      const newAccount = new Account()
      newAccount.contactCompanyName = this.localAccountName
      newAccount.contactFirstName = this.localFirstName
      newAccount.contactLastName = this.localLastName
      newAccount.contactEmail = this.localEmail

      this.$store.getters.services.accounts.create(newAccount).then(
        (returnedAccount) => {
          this.$store.getters.services.users
            .createUserRole(
              ID.fromResponseObject(3, 'users'),
              ID.fromResponseObject(2, 'roles'),
              returnedAccount.id,
              null
            )
            .then(
              (returnedUserRole) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Account created',
                })
                this.$emit('accountAdded')
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error adding user role to account.',
                  detail: error,
                })
              }
            )
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error creating account.',
            detail: error,
          })
        }
      )
    },
  },
})
</script>

<style lang="scss">
// @import '@/app-shared/styles/_imports.scss';
// .account-add-container {}
</style>
