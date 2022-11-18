<template>
  <div class="top-view-container">
    <div class="title">{{ title }}</div>
    <div class="subtitle">{{ subtitle }}</div>
    <div class="infoText" v-html="infoText"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'SetupTopView',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: false,
    },
    infoText: {
      type: String,
      required: false,
    },
  },
})
</script>

<style lang="scss" scoped>
@import '@/app-shared/styles/_imports.scss';
.top-view-container {
  @include font-mulish-light;
  text-align: center;
  max-width: 620px;
  margin: 0 auto;
  margin-bottom: 15px;

  .title {
    margin-bottom: 20px;
    font-size: 32px;
    font-weight: 300;
  }

  .subtitle {
    @include font-mulish-light;
    margin-bottom: 26px;
    font-size: 21px;
    font-weight: 300;
    font-variation-settings: 'wght' 300;
  }

  .infoText {
    font-size: 18px !important;
  }
}
</style>
