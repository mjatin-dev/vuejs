<template>
  <div>
    <Dialog :visible="$store.getters.isFeedbackModalOpen" :modal="true" :closable="false">
      <template #header>
        <div class="annum-feedback-modal-header p-d-flex p-ai-center p-jc-between">
          <h3 class="p-mb-0">Provide User Feedback</h3>
          <Button
            icon="pi pi-times-circle"
            class="p-button-text"
            @click="closeModal"
          />
        </div>
      </template>

      <form @submit="handleFormSubmit" class="p-mb-6">
        <div class="p-field">
          <label for="annum-feedback-comment">Comment</label>
          <Textarea id="annum-feedback-comment" v-model="userFeedback.comment" :autoResize="true" rows="5" cols="30" />
        </div>
        <div class="p-field">
          <label for="annum-feedback-type">Feedback Type</label>
          <Dropdown v-model="userFeedback.type" :options="feedbackTypeOptions" optionLabel="label" optionValue="value" placeholder="" />
        </div>
      </form>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeModal" />
        <Button label="Submit" icon="pi pi-check" autofocus @click="handleFormSubmit" :disabled="!userFeedback.type || !userFeedback.comment" />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';

import UserFeedback, { UserFeedbackType } from '@/app-shared/models/UserFeedback'
import {
  AlertMessageSeverity,
} from '@/app-shared/models/AlertMessage'

Vue.component('Dialog', Dialog)
Vue.component('Button', Button)
Vue.component('Textarea', Textarea)
Vue.component('Dropdown', Dropdown)

export default Vue.extend({
    name: 'UserFeedback',
    data() {
      return {
        isOpen: false as boolean,
        userFeedback: new UserFeedback() as UserFeedback
      }
    },
    methods: {
      closeModal() {
        this.$store.dispatch('updateFeedbackModal', false) 
      },
      handleFormSubmit(e) {
        e.preventDefault()
        this.$store.getters.services.feedback.sendFeedback(this.userFeedback)
          .then(response => {
            this.handleFeedbackNotification(response.data?.response?.ok)
            this.closeModal()
          })
          .catch(() => this.handleFeedbackNotification(false))
      },
      handleFeedbackNotification(isSuccessful) {
        if (isSuccessful) {
          this.userFeedback = new UserFeedback()
        }
        Vue.prototype.$toast.add({
          severity: isSuccessful ? AlertMessageSeverity.success : AlertMessageSeverity.error,
          summary: isSuccessful ? 'Success!' : 'Error submitting feedback',
          detail: isSuccessful ? 'Thank you for submitting your feedback!' : 'Sorry, there was an error submitting your feedback, please try again later.',
          life: 3000,
        })
      }
    },
    computed: {
      feedbackTypeOptions() {
        const types = [] as object[]
        for (const type in UserFeedbackType) {
          types.push({
            label: type,
            value: type
          })
        }
        return types
      }
    }
    
})
</script>

<style>
.annum-feedback-modal-header {
  width: 100%;
}
</style>