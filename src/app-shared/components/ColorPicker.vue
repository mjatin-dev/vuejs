<template>
  <div class="picker" @click="(e) => e.stopPropagation()">
    <div
      :class="`picker__trigger ${colorOptions[selectedColorIndex]}`"
      :style="`background-color: ${selectedColor}; opacity: ${colorOptionOpacity};`"
      @click="() => (isOpen = !isOpen)"
    ></div>
    <div class="picker__popup" v-show="isOpen">
      <div
        v-for="(color, ind) in colorOptions"
        :class="`color-option ${ind === selectedColorIndex && 'isSelected'}`"
        :key="ind"
        :style="`background-color: ${color}; opacity: ${colorOptionOpacity};`"
        @click="(e) => handleColorClick(color, e)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ColorPicker',
  props: {
    selectedColor: {
      type: String,
    },
    isLeadPlan: {
      type: Boolean,
    },
  },
  data() {
    return {
      isOpen: false,
      colorOptions: [
        '#FFD967', // Website
        '#FF9767', // Email
        '#F3739F', // Social Media
        '#DD79EB', // Collateral
        '#BE779C', // Direct Mail
        '#C38D6D', // PR

        '#E3ED79', // Advertising Assets
        '#91D395', // Paid Media
        '#7CE4DA', // Signage
        '#67CDFF', // Custom
        '#8D97D9', // Custom
        '#A77AE1', // Custom
      ],
    }
  },
  computed: {
    selectedColorIndex(): number {
      return this.colorOptions.indexOf(this.selectedColor)
    },
    colorOptionOpacity(): number {
      if (
        this.isLeadPlan ||
        this.$store.getters.currentPlan.isLead ||
        this.$store.getters.currentSetupPlan.isLead
      ) {
        return 1
      }
      return 0.6
    },
  },
  methods: {
    handleColorClick(color, e) {
      this.isOpen = false
      this.$emit('colorSelected', color, e)
    },
  },
})
</script>

<style lang="scss" scoped>
.picker {
  position: relative;
  // padding-top: 5px;
  &__trigger {
    width: 20px;
    height: 20px;
    background-color: #e3ed79;
  }
  &__popup {
    position: absolute;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 180px;
    gap: 5px;
    padding: 15px;
    background-color: white;
    border: solid 1px black;
    z-index: 5;

    .color-option {
      width: calc((100% / 6) - 5px);
      border-radius: 50%;
      background-color: #e3ed79;
      aspect-ratio: 1;
      cursor: pointer;
      position: relative;

      &.isSelected {
        &:after {
          content: '';
          position: absolute;
          width: 5px;
          height: 10px;
          border-right: solid 2px white;
          border-bottom: solid 2px white;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }
      }
    }
  }
}
</style>
