<template>
  <div class="view-main" :class="{'full-viewport': isFullViewport}">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ViewMain',
  props: {
    isFullViewport: Boolean,
  }
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.global-nav-collapsed {
  .view-main {
    left: $navCollapseButtonWidth;
    width: calc(100% - 3.2rem); //TODO: should use $navCollapseButtonWidth but having issues with calc()
    transition: left 0.3s, width 0.3s;
  }
}
.view-main {
  position: relative;
  left: $globalNavWidth;
  width: 85%;
  height: 100%;
  padding: 0 2.4rem 1.6rem 1.6rem;
  overflow: auto;
  transition: left 0.3s, width 0.3s;
  background: #fff;

  &.full-viewport {
    width: 100%;
    left: 0;
    margin-top: -1rem;
    padding-top: 1rem;
    padding-bottom: 3rem;
    padding-left: 2.4rem;
    z-index: 2;
  }
}
</style>
