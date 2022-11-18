<template>
  <div>
    <div class="tactic-container">
      <div class="tactic-content">
      <h1 class="title-tactics">Enter Tactics</h1>
      <p> Begin planning by entering a tactic <br>
        into the calender.</p>
      <span>You can access a full tutorial at any time by clicking on Role: Account Owner in the middle top of the </span><br>
      <span>application or by visiting Guides under Help in the bottom left corner of the application.</span>
      </div>
       <hr class="p-my-5" />
        <img
        class="p-mt-4"
        alt="Tactics Sketch"
        src="@/assets/tactics-sketch.png"
        style="width:100%"
      />
      <hr class="p-my-5" />
    </div>
    <div class="actions-container">
      <Button
        @click="handleClickContinue"
        class="tactics-get-started"
        label="Get Started"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Button from 'primevue/button'

Vue.component('Button', Button)

export default Vue.extend({
  name: 'SetupTactics',
  methods: {
    handleClickContinue() {
      // TODO: call API to update this.$store.getters.currentSetupPlan object
      this.$emit('setup-step-complete')
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.title-tactics{
  @include font-mulish-light;
    font-size: 32px;
    margin-bottom: -10px;
  }

.tactic-container{
  text-align: center;
  .tactic-content{
    padding-bottom: 25px;
  }

  p {
   @include font-mulish-light;
    font-size: 21px;
   }

   span{
   @include font-mulish-light;
    font-size: 12px;
   }

}
.tactics-get-started{
  @include font-mulish-light;
  color: #ffffff;
  background: #000000;
  border: 1px solid #000000;
  padding: 0.8rem 1.6rem;
  font-size: 1.1rem;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  border-radius: 5;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
}

</style>

