<template>
  <div class="tactics-row" ref="rowEl">
    <template v-for="(tactic, index) in filteredTactics">
      <a
        :title="getTitleForTactic(tactic)"
        :key="tactic.title + tactic.id.intID + index"
        :style="getStyleObjectForTactic(tactic)"
        :class="getClassStringForTactic(tactic)"
        @click="showTactic(tactic)"
        @contextmenu="(e) => showContextMenu(e, tactic)"
      >
        <div class="bkg" :style="getStyleObjectForBackground()"></div>
        <span class="tactic-title" :style="getStyleObjectForTacticTitle(tactic)"
          ><span class="meta">{{ getMetaForTactic(tactic) }}</span
          >{{ getTitleForTactic(tactic) }}</span
        ></a
      >
    </template>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import Tactic from '@/app-shared/models/Tactic'
import FlowSubRow from '@/app-shared/models/FlowSubRow'

export default Vue.extend({
  name: 'CalendarFlowRow',
  props: {
    tactics: Array as () => Tactic[],
    dayWidth: Number,
    millisecondsPerDay: Number,
    dateRange: Array as () => Date[],
    isSubscription: Boolean,
    isHiddenFromNestedPlans: Boolean,
    tacticBackgroundColor: String,
  },
  data: () => {
    return {
      buttonHeightInRems: 2.8 as number,
      buttonTopMarginInRems: 0.4 as number,
      buttonTitleMaxWidthNumDays: 5 as number, //Number of dayWidth units that button titles are truncated to
      nonReactive: {} as any,
    }
  },
  computed: {
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    localDateRange(): Date[] {
      return this.$store.getters.currentDateRange
    },
    filteredTactics(): Tactic[] {
      return this.tactics
        .filter((tactic) => {
          return (
            tactic.startDate <= this.dateRange[1] &&
            tactic.endDate >= this.dateRange[0]
          )
        })
        .sort((a, b) => {
          return a.startDate.getTime() - b.startDate.getTime()
        })
    },
  },
  watch: {
    localDateRange() {
      this.resetNonReactiveValues()
      this.calculateSubRows()
      this.updateDisplayWithNonReactiveValues()
    },
  },
  beforeMount: function () {
    this.resetNonReactiveValues()
    this.calculateSubRows()
  },
  mounted: function () {
    this.updateDisplayWithNonReactiveValues()
  },
  methods: {
    resetNonReactiveValues: function () {
      //Reset subrows
      this.nonReactive.subRows = [new FlowSubRow(0)]
    },
    calculateSubRows: function () {
      //Calculate each tactic's position in subrow
      this.filteredTactics.forEach((tactic) => {
        let isTacticAddedToSubRow = false

        this.nonReactive.subRows.some((subRow) => {
          let canTacticBeAddedToThisRow = true

          if (subRow.tactics.length) {
            subRow.tactics.some((testTactic) => {
              if (testTactic.id.intID == tactic.id.intID) {
                return true
              }

              //Check startDate and endDate against all other tactics for overlap
              const tacticEndDate: Date =
                tactic.endDate.getTime() - tactic.startDate.getTime() <
                this.millisecondsPerDay * this.buttonTitleMaxWidthNumDays
                  ? new Date(
                      tactic.startDate.getTime() +
                        this.millisecondsPerDay *
                          this.buttonTitleMaxWidthNumDays
                    )
                  : tactic.endDate
              const testTacticEndDate: Date =
                testTactic.endDate.getTime() - testTactic.startDate.getTime() <
                this.millisecondsPerDay * this.buttonTitleMaxWidthNumDays
                  ? new Date(
                      testTactic.startDate.getTime() +
                        this.millisecondsPerDay *
                          this.buttonTitleMaxWidthNumDays
                    )
                  : testTactic.endDate
              if (
                (tactic.startDate.getTime() >= testTactic.startDate.getTime() &&
                  tactic.startDate.getTime() <= testTacticEndDate.getTime()) || //start overlaps
                (tacticEndDate.getTime() >= testTactic.startDate.getTime() &&
                  tacticEndDate.getTime() <= testTacticEndDate.getTime()) || //end overlapps
                (tactic.startDate.getTime() <= testTactic.startDate.getTime() &&
                  tacticEndDate.getTime() >= testTacticEndDate.getTime()) || //testTactic inside tactic
                (tactic.startDate.getTime() >= testTactic.startDate.getTime() &&
                  tacticEndDate.getTime() <= testTacticEndDate.getTime()) //tactic inside testTactic
              ) {
                // Found overlap, don't add to FlowSubRow
                canTacticBeAddedToThisRow = false
                return true
              }
            })
          }
          if (canTacticBeAddedToThisRow) {
            subRow.tactics.push({
              id: tactic.id.clone(),
              startDate: tactic.startDate,
              endDate: tactic.endDate,
            })
            isTacticAddedToSubRow = true
            return true
          }
        })
        // If tactic has not been added to FlowSubRow, create new FlowSubRow and add tactic
        if (!isTacticAddedToSubRow) {
          this.nonReactive.subRows.push(
            new FlowSubRow(this.nonReactive.subRows.length, [
              {
                id: tactic.id.clone(),
                startDate: tactic.startDate,
                endDate: tactic.endDate,
              },
            ])
          )
        }
      })
    },
    updateDisplayWithNonReactiveValues: function () {
      const rowRef = this.$refs.rowEl as HTMLDivElement
      rowRef.style.height =
        Number(
          this.nonReactive.subRows.length *
            (this.buttonHeightInRems + this.buttonTopMarginInRems * 2)
        ).toString() + 'rem'
    },
    showTactic: function (tactic: Tactic) {
      if (
        !tactic.isInitiative &&
        !this.isSubscription &&
        ((this.isLeadPlan && tactic.isLead) ||
          (!this.isLeadPlan && !tactic.isLead))
      ) {
        this.$emit('showTactic', tactic)
      }
    },
    showContextMenu: function (e: MouseEvent, tactic: Tactic) {
      if (!this.isSubscription && !tactic.isInitiative) {
        this.$emit('showContextMenu', {e, tactic})
      }
    },
    getStyleObjectForTactic: function (tactic: Tactic): object {
      let utcRangeStart = 0
      let utcRangeEnd = 0
      if (this.dateRange[0]) {
        utcRangeStart = Date.UTC(
          this.dateRange[0].getFullYear(),
          this.dateRange[0].getMonth(),
          this.dateRange[0].getDate()
        )
      }
      if (this.dateRange[1]) {
        utcRangeEnd = Date.UTC(
          this.dateRange[1].getFullYear(),
          this.dateRange[1].getMonth(),
          this.dateRange[1].getDate()
        )
      }
      const utcStartDate = Date.UTC(
        tactic.startDate.getFullYear(),
        tactic.startDate.getMonth(),
        tactic.startDate.getDate()
      )
      const utcEndDate = Date.UTC(
        tactic.endDate.getFullYear(),
        tactic.endDate.getMonth(),
        tactic.endDate.getDate() + 1 // Adding 1 here accounts for end dates on all-day events stopping at 11:59pm the day before the intended end date
      )
      let leftPos =
        this.dayWidth *
        ((utcStartDate - utcRangeStart) / this.millisecondsPerDay)
      let width = Math.max(
        this.dayWidth,
        this.dayWidth * ((utcEndDate - utcStartDate) / this.millisecondsPerDay)
      )

      //Prevent items from appearing off canvas
      if (leftPos < 0) {
        width = width + leftPos
        leftPos = 0
      }
      if (leftPos == 0 && width > 100) {
        width = 100
      }

      // Find index for the subrow that includes this tactic
      let subRowIndexForTactic = 0
      this.nonReactive.subRows.forEach((subRow) => {
        subRow.tactics.forEach((tacticAbstract) => {
          if (tacticAbstract.id.intID == tactic.id.intID) {
            subRowIndexForTactic = subRow.index
          }
        })
      })

      const returnObject = {
        top:
          (
            this.buttonTopMarginInRems +
            subRowIndexForTactic *
              (this.buttonHeightInRems + this.buttonTopMarginInRems)
          ).toString() + 'rem',
        left: leftPos.toString() + '%',
        width: width.toString() + '%',
        height: this.buttonHeightInRems.toString() + 'rem',
      }

      return returnObject
    },
    getStyleObjectForTacticTitle(tactic: Tactic) {
      if (
        tactic.endDate.getTime() - tactic.startDate.getTime() <
        this.millisecondsPerDay * this.buttonTitleMaxWidthNumDays
      ) {
        return {
          'max-width':
            Number(this.buttonTitleMaxWidthNumDays * 150).toString() + '%',
        }
      }
      return {}
    },
    getStyleObjectForBackground() {
      //Apply custom color from Channel.uiColor if available
      if (this.tacticBackgroundColor) {
        return {'background-color': this.tacticBackgroundColor}
      }
      return {}
    },
    getMetaForTactic(tactic: Tactic) {
      let returnString = ''
      if (tactic.tacticPlatforms && tactic.tacticPlatforms.length) {
        tactic.tacticPlatforms.forEach((platformOnTactic)=>{
          returnString += this.$store.getters.currentPlan.tacticPlatforms.find(
            (platform) => platform.id.intID === platformOnTactic.id.intID
          )?.name + ' '
        })
      }
      return returnString
    },
    getTitleForTactic(tactic: Tactic) {
      let returnString = tactic.title
      if (this.isLeadPlan && tactic.abbreviatedPlanName !== '') {
        if (returnString.length > 0) {
          returnString = tactic.abbreviatedPlanName + ' > ' + returnString
        } else {
          returnString = tactic.abbreviatedPlanName
        }
      }

      const txt = document.createElement('textarea')
      txt.innerHTML = returnString
      return txt.value
    },
    getClassStringForTactic(tactic: Tactic) {
      let returnString = 'tactic-button'
      if (this.isSubscription == true) {
        returnString += ' subscription'
      } else {
        returnString +=
          ' ' + tactic.channelName.toLowerCase().replaceAll(' ', '-')
      }
      if (
        this.$store.getters.paidChannelNames.includes(
          tactic.channelName.toLowerCase()
        )
      ) {
        returnString += ' paid-media'
      }
      if (
        tactic.endDate.getTime() - tactic.startDate.getTime() <
        this.millisecondsPerDay * this.buttonTitleMaxWidthNumDays
      ) {
        returnString += ' short'
      }
      if (tactic.isNested) {
        returnString += ' is-nested'
      }
      if (tactic.isLead) {
        returnString += ' is-lead'
      }
      if (this.isHiddenFromNestedPlans) {
        returnString += ' is-hidden-from-nested-plans'
      }
      return returnString
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.tactics-row {
  .tactic-button {
    position: absolute;
    display: flex;
    align-items: center;
    width: max-content;
    min-height: 2.8rem;
    padding: 0.4rem 0.6rem;
    border-radius: 0;
    border: none;
    box-shadow: none;
    color: #0a0a0a;
    font-size: 0.9rem;
    line-height: 1rem;
    text-align: left;
    z-index: 0;
    cursor: pointer;

    .bkg {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: $tacticColorDefaultBkg;
      z-index: -1;
      opacity: $nestedBkgColorOffset;
    }

    &.subscription {
      cursor: default;
      border-bottom: 0.1rem solid $tacticColorSubscription;
      border-left: 0.1rem solid $tacticColorSubscription;

      .bkg {
        background-color: $tacticColorSubscriptionBkg;
      }
    }
    &.initiatives {
      cursor: default;
      border-color: $tacticColorInitiatives;

      .bkg {
        background-color: $tacticColorInitiativesBkg;
      }
    }
    &.website {
      border-color: $tacticColorWebsite;

      .bkg {
        background-color: $tacticColorWebsiteBkg;
      }
    }
    &.email {
      border-color: $tacticColorEmail;

      .bkg {
        background-color: $tacticColorEmailBkg;
      }
    }
    &.social-media {
      border-color: $tacticColorSocialMedia;

      .bkg {
        background-color: $tacticColorSocialMediaBkg;
      }
    }
    &.collateral {
      border-color: $tacticColorCollateral;

      .bkg {
        background-color: $tacticColorCollateralBkg;
      }
    }
    &.direct-mail {
      border-color: $tacticColorDirectMail;

      .bkg {
        background-color: $tacticColorDirectMailBkg;
      }
    }
    &.pr {
      border-color: $tacticColorPR;

      .bkg {
        background-color: $tacticColorPRBkg;
      }
    }
    &.advertising-assets {
      border-color: $tacticColorAdvertisingAssets;

      .bkg {
        background-color: $tacticColorAdvertisingAssetsBkg;
      }
    }
    &.paid-media {
      border-color: $tacticColorPaidMedia !important;

      .bkg {
        background-color: $tacticColorPaidMediaBkg !important;
      }
    }
    &.signage {
      border-color: $tacticColorSignage;

      .bkg {
        background-color: $tacticColorSignageBkg;
      }
    }

    &.short {
      display: block;
      overflow: visible;

      .tactic-title {
        display: inline-block;
        overflow: hidden;
        line-height: 1.6rem;
      }
    }

    &.is-lead {
      background-color: $tacticColorDefaultBkg;
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-end;
      cursor: default;

      &:not(.is-hidden-from-nested-plans) {
        &::after {
          content: '\e925'; // pi-home
          display: inline-block;
          padding-right: 0.6rem;
          font-family: 'primeicons';
          font-size: 1.2rem;
          line-height: 1.6rem;
          speak: none;
          font-style: normal;
          font-weight: normal;
          font-variant: normal;
          text-transform: none;
        }
      }

      .bkg {
        opacity: 1;
      }
    }

    .tactic-title {
      white-space: nowrap;
      overflow: visible;
      text-overflow: ellipsis;
    }
    .meta {
      display: block;
      font-size: 0.7rem;
      line-height: 0.9rem;
    }
  }
}
.is-lead-plan {
  .tactics-row {
    .tactic-button {
      &.is-nested {
        cursor: default;
      }
      &.is-lead {
        cursor: pointer;
      }
    }
  }
}
</style>
