<template>
  <div class="calendar-container" :class="{'is-lead-plan': isLeadPlan}">
    <FullCalendar
      ref="fullCalendar"
      :options="fullcalendarOptions"
      :events="filteredTactics"
    />
    <ContextMenu ref="menu" :model="contextMenuItems" appendTo="body" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {differenceInHours, isSameDay} from 'date-fns'
import {UserMostRecentView} from '@/app-shared/models/User'
import {CalendarApi} from '@fullcalendar/vue'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import interactionPlugin from '@fullcalendar/interaction'
import Button from 'primevue/button'
import ID from '@/app-shared/models/ID'
import Tactic from '@/app-shared/models/Tactic'
import TacticPlatform from '@/app-shared/models/TacticPlatform'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Subscription from '@/app-shared/models/Subscription'
import ContextMenuItem from '@/app-shared/models/ContextMenuItem'
import ContextMenu from 'primevue/contextmenu'
import Plan, {PlanType} from '@/app-shared/models/Plan'
// import {mapGetters} from 'vuex'

Vue.component('Button', Button)
Vue.component('ContextMenu', ContextMenu)

export default Vue.extend({
  name: 'CalendarGrid',
  components: {
    FullCalendar,
  },
  data() {
    return {
      fullCalendarApi: {} as CalendarApi,
      forceTacticsListUpdate: 0 as number,
      rightClickedTacticId: {} as ID,
    }
  },
  computed: {
    // ...mapGetters(['events']),
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    contextMenuItems(): ContextMenuItem[] {
      return [
        {
          label: 'Copy Tactic',
          icon: 'pi pi-fw pi-copy',
          command: this.openTacticDetailWithCopyId,
        },
      ]
    },
    dateRange(): Date[] {
      return this.$store.getters.currentDateRange
    },
    fullcalendarOptions(): {} {
      return {
        plugins: [
          rrulePlugin,
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ],
        initialView: 'dayGridMonth',
        headerToolbar: {
          start: '',
          center: '',
          end: '',
        },
        editable: true,
        navLinks: true,
        events: this.filteredTactics,
        eventContent: (arg) => {
          return {html: this.getHtmlStringForEvent(arg.event)}
        },
        eventClick: (info) => {
          if (
            info.event.extendedProps.internalId &&
            !info.event.extendedProps.isInitiative &&
            ((this.isLeadPlan && info.event.extendedProps.isLead) ||
              (!this.isLeadPlan && !info.event.extendedProps.isLead))
          ) {
            this.showTacticById(info.event.extendedProps.internalId)
          }
        },
        eventDidMount: (info) => {
          if (info.event.extendedProps.internalId) {
            info.el.addEventListener(
              'contextmenu',
              (e) => {
                if (
                  !info.event.extendedProps.isInitiative &&
                  (this.isLeadPlan && info.event.extendedProps.isLead) ||
                  (!this.isLeadPlan && !info.event.extendedProps.isLead)
                ) {
                  e.preventDefault()
                  this.rightClickedTacticId =
                    info.event.extendedProps.internalId
                  this.showContextMenu(e)
                }
              },
              false
            )
          }
        },
        eventDrop: (info) => {
          this.onFullCalendarTacticDateUpdate(info)
        },
        eventResize: (info) => {
          this.onFullCalendarTacticDateUpdate(info)
        },
        eventAllow: (dropLocation, draggedEvent) => {
          if (
            (this.isLeadPlan && draggedEvent.extendedProps.isLead) ||
            (!this.isLeadPlan && !draggedEvent.extendedProps.isLead)
          ) {
            return true
          } else {
            return false
          }
        },
        navLinkDayClick: (event) => {
          this.$store.dispatch('updateCurrentDateRange', [event, event])
          this.$router.push({
            path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/calendar/day`,
          })
        },
      }
    },
    filteredTactics(): Tactic[] {
      this.forceTacticsListUpdate
      const returnArray = [] as Tactic[]
      this.$store.getters.selectedChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          if (
            type.name.toLowerCase() !== this.$store.getters.monthlyFocusTypeName
          ) {
            //Only show "Monthly Focus" tactics in masthead
            type.tactics.forEach((tactic) => {
              //Ensure tactic belongs on grid and not masthead
              if (
                !this.isTacticInFilteredOutPlan(tactic) &&
                !this.isTacticRelatedToDeselectedTag(tactic) &&
                !this.isTacticRelatedToDeselectedInitiative(tactic) &&
                (!this.isTacticLongerThanThreshold(tactic, 21) ||
                  (this.isTacticLongerThanThreshold(tactic, 21) &&
                    !this.isTacticInPaidChannel(tactic)))
              ) {
                //FullCalendar uses id property, so copy id value for internal use
                tactic.internalId = tactic.id
                //Add classes for channel name and paid-media
                const tacticClassNames = [
                  tactic.channelName.toLowerCase().replace(' ', '-'),
                ]
                if (
                  this.$store.getters.paidChannelNames.includes(
                    tactic.channelName.toLowerCase()
                  )
                ) {
                  tacticClassNames.push('paid-media')
                }
                if (tactic.isNested) {
                  tacticClassNames.push('is-nested')
                }
                if (tactic.isLead) {
                  tacticClassNames.push('is-lead')
                }
                if (type.shouldHideTacticsFromNestedPlans) {
                  tacticClassNames.push('is-hidden-from-nested-plans')
                }
                tactic.classNames = tacticClassNames

                //Apply custom color from Channel.uiColor if available
                if (channel.uiColor) {
                  tactic.backgroundColor = channel.uiColor
                }

                // add UNTIL if the recurrence ends at some point
                if (
                  tactic.recurrenceEndDate &&
                  tactic.rrule?.indexOf('UNTIL') < 0
                ) {
                  const year = tactic.recurrenceEndDate.getFullYear()
                  const month =
                    tactic.recurrenceEndDate.getMonth() > 8
                      ? tactic.recurrenceEndDate.getMonth() + 1
                      : '0' + (tactic.recurrenceEndDate.getMonth() + 1)
                  const date =
                    tactic.recurrenceEndDate.getDate() > 9
                      ? tactic.recurrenceEndDate.getDate()
                      : '0' + tactic.recurrenceEndDate.getDate()
                  const hours =
                    tactic.recurrenceEndDate.getHours() > 9
                      ? tactic.recurrenceEndDate.getHours()
                      : '0' + tactic.recurrenceEndDate.getHours()
                  const minutes =
                    tactic.recurrenceEndDate.getMinutes() > 9
                      ? tactic.recurrenceEndDate.getMinutes()
                      : '0' + tactic.recurrenceEndDate.getMinutes()
                  const seconds =
                    tactic.recurrenceEndDate.getSeconds() > 9
                      ? tactic.recurrenceEndDate.getSeconds()
                      : '0' + tactic.recurrenceEndDate.getSeconds()
                  tactic.rrule += `;UNTIL=${year}${month}${date}T${hours}${minutes}${seconds}`
                }
                //Add to return array for display on calendar
                returnArray.push(tactic)
              }
            })
          }
        })
      })

      this.$store.getters.selectedSubscriptions.forEach((subscription) => {
        subscription.events.forEach((tactic) => {
          if (tactic.rrule) {
            const year = tactic.startDate.getFullYear()
            const month =
              tactic.startDate.getMonth() > 8
                ? tactic.startDate.getMonth() + 1
                : '0' + (tactic.startDate.getMonth() + 1)
            const date =
              tactic.startDate.getDate() > 9
                ? tactic.startDate.getDate()
                : '0' + tactic.startDate.getDate()
            const hours =
              tactic.startDate.getHours() > 9
                ? tactic.startDate.getHours()
                : '0' + tactic.startDate.getHours()
            const minutes =
              tactic.startDate.getMinutes() > 9
                ? tactic.startDate.getMinutes()
                : '0' + tactic.startDate.getMinutes()
            const seconds =
              tactic.startDate.getSeconds() > 9
                ? tactic.startDate.getSeconds()
                : '0' + tactic.startDate.getSeconds()

            const dtStart = tactic.startDate
              ? `DTSTART=${year}${month}${date}T${hours}${minutes}${seconds}\n`
              : ''

            if (tactic.rrule?.indexOf('DTSTART') < 0) {
              tactic.rrule = `${dtStart}RRULE:${tactic.rrule}`
            }

            const isMultiDayEvent = !isSameDay(tactic.startDate, tactic.endDate)
            if (isMultiDayEvent) {
              const diffInHours = differenceInHours(
                tactic.endDate,
                tactic.startDate
              )
              tactic.duration = `${diffInHours}:00`
            }
          }

          if (
            !this.isTacticLongerThanThreshold(tactic, 21) &&
            !this.isEventDuplicate(tactic, subscription)
          ) {
            tactic.editable = false
            tactic.classNames = ['subscription']
            returnArray.push(tactic)
          }
        })
      })
      return returnArray
    },
    isGlobalNavCollapsed(): boolean {
      return this.$store.getters.isGlobalNavCollapsed
    },
  },
  mounted: function () {
    this.fullCalendarApi = (this.$refs.fullCalendar as any).getApi()
    this.checkForDayView()
    this.fullCalendarApi.gotoDate(this.dateRange[0])
    this.fullCalendarApi.setOption('height', 'auto')
    this.fullCalendarApi.setOption('fixedWeekCount', false)
    this.fullCalendarApi.setOption('eventOrder', '-isSubscriptionEvent')

    //Update date range to cover entire month of start date
    this.$store.dispatch('updateCurrentDateRange', [
      this.dateRange[0],
      new Date(
        this.dateRange[0].getFullYear(),
        this.dateRange[0].getMonth() + 1,
        0
      ),
    ])

    this.$store.dispatch(
      'updateMostRecentCoreView',
      UserMostRecentView.calendar
    )
  },
  watch: {
    dateRange: function () {
      this.fullCalendarApi.gotoDate(this.dateRange[0])
    },
    isGlobalNavCollapsed: function () {
      window.setTimeout(() => {
        this.fullCalendarApi.updateSize()
      }, 301)
    },
    $route: function (to, from) {
      if (to.path.indexOf('calendar') > -1) {
        //Force re-render of calendar by forcing update of tactics list when returning from TacticDetail
        this.forceTacticsListUpdate++
      }
      this.checkForDayView()
    },
  },
  methods: {
    checkForDayView() {
      if (this.$route.path.includes('/day')) {
        this.fullCalendarApi.changeView('timeGridDay')
      }
    },
    isTacticInFilteredOutPlan(tactic: Tactic): boolean {
      if (tactic.isLead && !this.$store.getters.isLeadPlanVisible) {
        return true
      }
      if (
        tactic.isNested &&
        !this.$store.getters.visibleNestedPlansIntIds?.find(
          (planIntId) => planIntId === tactic.planId.intID
        )
      ) {
        return true
      }
      return false
    },
    isTacticMultiMonth(tactic: Tactic): boolean {
      return (
        (this.$store.getters.currentDateRange[0] > tactic.startDate &&
          this.$store.getters.currentDateRange[0] < tactic.endDate) ||
        (this.$store.getters.currentDateRange[1] > tactic.startDate &&
          this.$store.getters.currentDateRange[1] < tactic.endDate)
      )
    },
    isTacticEntireMonth(tactic: Tactic): boolean {
      return (
        this.$store.getters.currentDateRange[0] <= tactic.startDate &&
        this.$store.getters.currentDateRange[1] >= tactic.endDate
      )
    },
    isTacticExactMonth(tactic: Tactic): boolean {
      return (
        this.dateRange[0].getFullYear() == tactic.startDate.getFullYear() &&
        this.dateRange[0].getMonth() == tactic.startDate.getMonth() &&
        this.dateRange[0].getDate() == tactic.startDate.getDate() &&
        this.dateRange[1].getFullYear() == tactic.endDate.getFullYear() &&
        this.dateRange[1].getMonth() == tactic.endDate.getMonth() &&
        this.dateRange[1].getDate() == tactic.endDate.getDate()
      )
    },
    isTacticLongerThanThreshold(
      tactic: Tactic,
      thresholdInDays: number
    ): boolean {
      return (
        Math.floor(
          (Date.UTC(
            tactic.endDate.getFullYear(),
            tactic.endDate.getMonth(),
            tactic.endDate.getDate()
          ) -
            Date.UTC(
              tactic.startDate.getFullYear(),
              tactic.startDate.getMonth(),
              tactic.startDate.getDate()
            )) /
            (1000 * 60 * 60 * 24)
        ) > thresholdInDays
      )
    },
    isTacticInPaidChannel(tactic: Tactic): boolean {
      return (
        this.$store.getters.paidChannelNames.indexOf(
          tactic.channelName.toLowerCase()
        ) > -1
      )
    },
    isTacticRelatedToDeselectedTag(tactic: Tactic): boolean {
      if (this.$store.getters.isTagFilterActive && tactic.tags.length == 0) {
        //Tag filters are selected and tactic has no tags assigned
        return true
      }
      if (
        this.$store.getters.isTagFilterActive &&
        this.$store.getters.selectedTags.length == 1
      ) {
        //Only one tag has been selected, show any tactics that have selected tag
        return tactic.tags.filter(
          (tag) =>
            this.$store.getters.selectedTags.filter(
              (selectedTag) => selectedTag.id.intID == tag.id.intID
            ).length > 0
        ).length
          ? false
          : true
      }
      //Multiple tags are selected, show tactics that have all of the selected tags
      return tactic.tags.filter(
        (tag) =>
          this.$store.getters.deselectedTags.filter(
            (deselectedTag) => deselectedTag.id.intID == tag.id.intID
          ).length > 0
      ).length
        ? true
        : false
    },
    isTacticRelatedToDeselectedInitiative(tactic: Tactic): boolean {
      if (
        this.$store.getters.isInitiativeFilterActive &&
        tactic.campaignId.intID == 0 &&
        tactic.promotionId.intID == 0 &&
        tactic.keyDateId.intID == 0
      ) {
        //Initiative filters are selected and tactic has no initiatives assigned
        return true
      }
      const relatedInitiatives = [
        tactic.campaignId.intID,
        tactic.promotionId.intID,
        tactic.keyDateId.intID,
      ]
      if (
        this.$store.getters.isInitiativeFilterActive &&
        this.$store.getters.selectedInitiatives.length == 1
      ) {
        //Only one initiative has been selected, show any tactics that have selected initiative
        return relatedInitiatives.filter(
          (intID) =>
            this.$store.getters.selectedInitiatives.filter(
              (selectedInitiative) => selectedInitiative.id.intID == intID
            ).length > 0
        ).length
          ? false
          : true
      }
      //Multiple initiatives are selected, show tactics that have all of the selected initiatives
      return relatedInitiatives.filter(
        (intID) =>
          this.$store.getters.deselectedInitiatives.filter(
            (deselectedInitiative) => deselectedInitiative.id.intID == intID
          ).length > 0
      ).length
        ? true
        : false
    },
    isEventDuplicate(event: Tactic, subscription: Subscription): boolean {
      let returnValue = false
      const duplicateMappingsForTactic = subscription.duplicateEventsMap.filter(
        (duplicateMapping) => duplicateMapping.eventId == event.id.intID
      )
      // Only check for duplicates if there is a duplicate for the provided event
      if (duplicateMappingsForTactic.length) {
        duplicateMappingsForTactic.forEach((duplicateMapping) => {
          // Check if subscription with duplicate is visible
          const selectedSubscriptionWithDuplicate =
            this.$store.getters.selectedSubscriptions.find(
              (selectedSubscription) =>
                selectedSubscription.id.intID ==
                duplicateMapping.duplicateSubscriptionId
            )
          if (selectedSubscriptionWithDuplicate) {
            // Check if subscription with duplicate has a lower ID value than the provided subscription - event with lowest subscription ID will be shown
            if (
              duplicateMapping.duplicateSubscriptionId <
              duplicateMapping.subscriptionId
            ) {
              returnValue = true
            }
          }
        })
      }
      return returnValue
    },
    onFullCalendarTacticDateUpdate(info) {
      const thisTactic: Tactic = this.$store.getters.currentPlan.tactics.find(
        (tactic) => tactic.id.intID == info.event.extendedProps.internalId.intID
      )
      if (thisTactic) {
        //Calculate new end date
        let newEndDate = new Date(info.event.end)
        if (thisTactic.isAllDay) {
          //All day
          if (
            thisTactic.startDate.getFullYear() ==
              thisTactic.endDate.getFullYear() &&
            thisTactic.startDate.getMonth() == thisTactic.endDate.getMonth() &&
            thisTactic.startDate.getDate() == thisTactic.endDate.getDate()
          ) {
            newEndDate = new Date(info.event.start)
          } else {
            newEndDate.setMinutes(newEndDate.getMinutes() - 1)
          }
        } else {
          if (
            thisTactic.startDate.getFullYear() ==
              thisTactic.endDate.getFullYear() &&
            thisTactic.startDate.getMonth() == thisTactic.endDate.getMonth() &&
            thisTactic.startDate.getDate() == thisTactic.endDate.getDate()
          ) {
            //Specific time
            newEndDate = new Date(info.event.start)
          } else {
            //Multi-day with specific time
            const newStartDate = new Date(info.event.start)
            newEndDate = new Date(
              newStartDate.getTime() +
                (thisTactic.endDate.getTime() - thisTactic.startDate.getTime())
            )
          }
        }
        //Set new dates
        thisTactic.startDate = info.event.start
        thisTactic.endDate = newEndDate
        //Persist date updates
        this.$store.getters.services.tactics.update(thisTactic).then(
          (updatedTactic) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Date updated.',
              life: 3000,
            })
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error updating date.',
              detail: error,
            })
          }
        )
      }
    },
    showTacticById(id: ID) {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/tactic/${id.intID}`,
      })
    },
    showContextMenu(e: MouseEvent) {
      (this.$refs.menu as Vue & {show: (e) => boolean}).show(e)
    },
    openTacticDetailWithCopyId() {
      this.$router.push({
        path:
          `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/tactic/0?copyof=${this.rightClickedTacticId.intID}`
      })
    },
    getHtmlStringForEvent(event): string {
      let htmlString = '<div class="tactic-item">'
      if(event.backgroundColor !== ''){
        htmlString += '<div class="bkg" style="background-color: ' + event.backgroundColor + ';"></div>'
      }else{
        htmlString += '<div class="bkg"></div>'
      }
      htmlString +=
        '<span class="title">' + this.getDisplayTitleForEvent(event) + '</span>'
      htmlString += '</div>'
      return htmlString
    },
    getDisplayTitleForEvent(event): string {
      if (event.extendedProps.isSubscriptionEvent) {
        //Subscription Events
        return event.title
      }
      //Tactics
      let prefix = event.extendedProps.channelName
      const suffix = event.extendedProps.tacticType?.name
      let tacticTitle = event.title
      if (
        this.$store.getters.paidChannelNames.indexOf(
          event.extendedProps.channelName.toLowerCase()
        ) > -1
      ) {
        prefix = '$' + prefix
      }
      // Replace channel name with platform name if available
      if (event.extendedProps.tacticPlatforms && event.extendedProps.tacticPlatforms.length) {
        prefix = ''
        event.extendedProps.tacticPlatforms.forEach((platformOnTactic)=>{
          prefix += this.$store.getters.currentPlan.tacticPlatforms.find(
            (platform) => platform.id.intID === platformOnTactic.id.intID
          )?.name + ' '
        })
      }
      // Prefix tactic title with plan name if nested
      if (
        this.isLeadPlan &&
        event.extendedProps.isNested &&
        event.extendedProps.abbreviatedPlanName !== ''
      ) {
        tacticTitle =
          event.extendedProps.abbreviatedPlanName + ' > ' + tacticTitle
      }
      return (
        '<span class="meta">' +
        prefix +
        ' &bull; ' +
        suffix +
        '</span> ' +
        tacticTitle
      )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.calendar-container {
  --fc-event-bg-color: #000;
  --fc-event-border-color: #000;
  --fc-event-text-color: #0a0a0a;
  --fc-today-bg-color: #efefef;
  --fc-border-color: #efefef;

  .fc-scroller {
    overflow: visible !important;
  }
  .fc-col-header,
  .fc-daygrid-body,
  .fc-timegrid-body,
  .fc-scrollgrid-section-body table,
  .fc-scrollgrid-section-footer table {
    width: 100% !important;
  }
  .fc-daygrid-day-frame {
    min-height: 10rem;
  }
  .fc-day-sat,
  .fc-day-sun {
    &:not(.fc-col-header-cell) {
      background-color: #fcfcfc;
    }
  }
  .fc .fc-view-harness {
    th.fc-col-header-cell {
      padding: 0.4rem;
      border-left-color: #efefef;
      border-right-color: #efefef;
      background-color: #efefef;
      font-size: 1rem;
      line-height: 1.6rem;
      border: 0;
    }
    .fc-scrollgrid,
    th,
    td {
      border: 1px solid var(--fc-border-color, #ddd);
    }
    table.fc-scrollgrid {
      border-width: 0;
    }
    .fc-event,
    .fc-event-main {
      color: #0a0a0a !important;
      background-color: transparent;
      border: 0;
    }
    .fc-daygrid,
    .fc-timegrid {
      .fc-event {
        background-color: transparent !important; 

        .tactic-item {
          display: flex;
          align-items: center;
          min-height: 2.8rem;
          padding: 0.4rem 0.6rem;
          border-radius: 0;
          border: none;
          box-shadow: none;
          background-color: transparent;
          color: #0a0a0a;
          white-space: unset;
          font-size: 0.9rem;
          line-height: 1rem;
          overflow: hidden;

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
          .title {
            white-space: normal;
          }
        }

        &.subscription {
          cursor: default;
          border: 0.1rem solid $tacticColorSubscription;
          border-radius: 0;

          .bkg {
            background-color: $tacticColorSubscriptionBkg;
          }
        }
        &.initiatives {
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

          .tactic-item:before {
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

        &.is-lead {
          .tactic-item {
            flex-direction: row-reverse;
            justify-content: flex-end;
            column-gap: 1rem;
            cursor: default;
          }

          &:not(.is-hidden-from-nested-plans) {
            .tactic-item::after {
              content: '\e925'; // pi-home
              display: block;
              font-family: 'primeicons';
              font-size: 1.6rem;
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

        .meta {
          display: block;
          margin-bottom: 0.2rem;
          font-size: 0.7rem;
          line-height: 0.9rem;
        }
        .social-icon {
          display: inline-block;
          width: 0.75rem;
          height: 0.75rem;
          margin-right: 0.25rem;
          color: #fff;
          border: 0.05rem solid #fff;
          border-radius: 50%;

          &.icon-facebook {
            background-color: #1877f2;
          }
          &.icon-instagram {
            background-color: #c32aa3;
          }
          &.icon-pinterest {
            background-color: #bd081c;
          }
          &.icon-linkedin {
            background-color: #007bb5;
          }
          &.icon-twitter {
            background-color: #1da1f2;
          }
          &.icon-snapchat {
            background-color: #fffc00;
          }
          &.icon-whatsapp {
            background-color: #25d366;
          }
          &.icon-tumblr {
            background-color: #35465d;
          }
          &.icon-reddit {
            background-color: #ff4500;
          }
          &.icon-tiktok {
            background-color: #010101;
          }
        }
      }
    }
  }

  &.is-lead-plan {
    .fc .fc-view-harness {
      .fc-daygrid,
      .fc-timegrid {
        .fc-event {
          &.is-nested {
            cursor: default;
          }
          &.is-lead {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>