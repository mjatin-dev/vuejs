<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Channels</h2>

      <div>
        <!-- <Button
          v-if="canUserManagePlanUsersChannelsSubscriptions"
          icon="pi pi-plus-circle"
          label="Add Channel"
          @click="handleEditChannel()"
        /> -->

        <Button
          @click="$emit('complete')"
          label="Close"
          class="p-button-outlined p-ml-2"
        />
      </div>
    </div>
    <div class="plan-settings-modal-content">
      <div class="p-field">
        <div class="p-d-flex top-items">
          <p class="channel-title">
            Add and customize Channels. Modify Tactic Types and Platforms to
            suit your planning needs.
          </p>
        </div>
      </div>
      <div class="channels-container">
        <Draggable
          v-for="(channel, channelIndex) in filteredChannels"
          :key="channel.id.intID"
          class="setup-channel"
          :class="{'is-empty': channel.name === 'Initiatives'}"
        >
          <PlanSettingsChannelDetail
            :channel="channel"
            :channelIndex="channelIndex"
            :canUserEdit="canCurrentUserEditChannel(channel)"
          />
        </Draggable>
      </div>
    </div>

    <div class="add-channel">
      <div class="add-field__inputs">
        <ColorPicker
          @colorSelected="
            (color, e) => {
              currentChannel.uiColor = color
            }
          "
            :selectedColor="currentChannel.uiColor"
        />
        <InputText
          id="name"
          type="text"
          v-model="currentChannel.name"
          placeholder="New Channel"
        />
      </div>

      <div class="add-field__btn p-mr-4" @click="() => addChanel()">
        <span class="pi pi-plus-circle"></span>
        <span>Channel</span>
      </div>
    </div>

    <Dialog
      :header="`Channel Settings: ${
        selectedChannel.name !== '' ? selectedChannel.name : 'New Channel'
      }`"
      :visible.sync="shouldShowChanelDetail"
      :modal="true"
    >
      <ChannelDetail
        :selectedChannel="selectedChannel"
        @ChannelChanged="refreshView"
      />
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Dialog from 'primevue/dialog'
import Plan from '@/app-shared/models/Plan'
import ChannelDetail from '@/app-shared/views/ChannelDetail.vue'
import ID from '@/app-shared/models/ID'
import Channel from '@/app-shared/models/Channel'
import Role from '@/app-shared/models/Role'
import {AlertMessageSeverity} from '../models/AlertMessage'
import PlanSettingsChannelDetail from '@/app-shared/views/PlanSettingsChannelDetail.vue'
import {Draggable} from 'vue-smooth-dnd'
import TacticType from '@/app-shared/models/TacticType'
import TacticField, {TacticFieldType} from '@/app-shared/models/TacticField'
import TacticPlatform from '../models/TacticPlatform'
import ColorPicker from '@/app-shared/components/ColorPicker.vue'

Vue.component('Dialog', Dialog)

export default Vue.extend({
  name: 'PlanSettingsChannels',
  components: {
    ChannelDetail,
    PlanSettingsChannelDetail,
    Draggable,
    ColorPicker,
  },
  data: () => {
    return {
      selectedChannel: {} as Channel,
      shouldShowChanelDetail: false,
      newChannel: {} as Channel,
      channels: [] as Channel[],
      currentChannelIntId: 0 as number,
      invalidFields: [] as string[],

      currentTypeIntId: 0 as number,
      isPaidMediaInputEnabled: true as boolean,
      isTacticFlaggingInputEnabled: true as boolean,
    }
  },
  mounted: function () {
    this.newChannel = new Channel()
  },
  computed: {
    isCreateChannel(): boolean {
      return this.currentChannelIntId != 0 ? false : true
    },
    fieldTypeOptions(): {}[] {
      return [
        {
          label: 'Text',
          value: TacticFieldType.string,
        },
        {
          label: 'Number',
          value: TacticFieldType.number,
        },
        {
          label: 'URL',
          value: TacticFieldType.url,
        },
        {
          label: 'Image',
          value: TacticFieldType.image,
        },
      ]
    },
    currentChannel(): Channel {
      const returnChannel = this.$store.getters.currentPlan.channels.find(
        (channel) => channel.id.intID == this.currentChannelIntId
      )

      return this.newChannel
    },
    currentType(): TacticType {
      const returnType = this.allTypesInChannel.find(
        (type) => type.id.intID == this.currentTypeIntId
      )
      return returnType || new TacticType()
    },
    currentFields(): TacticField[] {
      return this.currentType.tacticFields
    },
    allTypesInChannel(): TacticType[] {
      return this.currentChannel.tacticTypes
    },
    visibleTypesInChannel(): TacticType[] {
      return this.currentChannel.tacticTypes.filter(
        (type) =>
          type.name.toLowerCase() !== this.$store.getters.monthlyFocusTypeName
      )
    },
    allPlatformsForPlan(): TacticPlatform[] {
      return this.$store.getters.currentPlan.tacticPlatforms.filter(
        (platform) => !platform.isNested
      )
    },
    allPlatformsForType(): TacticPlatform[] {
      return this.currentType.tacticPlatforms
    },
    shouldShowCurrentMonthlyFocus: {
      get(): boolean {
        return this.currentChannel.useMonthlyFocusType
      },
      set(newValue: boolean) {
        this.currentChannel.useMonthlyFocusType = newValue
      },
    },
    socialChannelName(): string {
      return Channel.CHANNEL_NAME_SOCIAL
    },
    isPaidMedia: {
      get(): boolean {
        return this.currentChannel.isPaidMedia
      },
      set(value: boolean) {
        this.isTacticFlaggingInputEnabled = !value
        this.currentChannel.isPaidMedia = value
      },
    },
    enableTacticFlagging: {
      get(): boolean {
        return this.currentChannel.enableTacticFlagging
      },
      set(value: boolean) {
        this.isPaidMediaInputEnabled = !value
        this.currentChannel.enableTacticFlagging = value
      },
    },

    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    isLeadPlan(): boolean {
      return this.plan.plans.length ? true : false
    },
    canUserEditPlanProperties(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    canUserManagePlanUsersChannelsSubscriptions(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    filteredChannels(): Channel[] {
      const localCurrentChannels = [...this.$store.getters.currentPlan.channels]
      return localCurrentChannels
    },
  },
  methods: {
    canCurrentUserEditChannel(channel): boolean {
      let hasChannelEditRights = true
      const currentUserRole = this.$store.getters.currentPlan.users.find(
        (userRole) =>
          userRole.user.id.intID === this.$store.getters.currentUser.id.intID
      )
      if (currentUserRole) {
        hasChannelEditRights = currentUserRole.channels.find(
          (channelId) => channelId.intID === channel.id.intID
        )
          ? true
          : false
      }
      return this.canUserManagePlanUsersChannelsSubscriptions && hasChannelEditRights
    },
    refreshView(){
      this.$emit('ChannelChanged');
    },
    handleWeekStartDayChange() {
      this.plan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans.update(this.plan).then((plan) => {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.success,
          summary: 'Plan updated.',
          life: 3000,
        })
        this.$store.dispatch('updateCurrentPlan', plan)
      })
    },
    handleDeleteChannel(channelId: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.channels
            .delete([channelId.intID])
            .then(() => {
              this.$store.dispatch('refreshCurrentPlan')
            })
        },
        reject: () => {
          // Reject item delete
        },
      })
    },
    handleEditChannel(channel) {
      //TODO: use $store currentChannel instead of local data property?
      if (channel) {
        this.selectedChannel = channel
      } else {
        this.selectedChannel = new Channel()
      }

      this.shouldShowChanelDetail = true
    },
    areChannelFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.currentChannel.name == '') {
        isFormValid = false
        this.invalidFields.push('channel-name')
      }
      return isFormValid
    },
    addChanel() {
      // Validate fields
      if (!this.areChannelFieldsValid()) {
        return false
      }
     
      return new Promise((resolve, reject) => {
        this.currentChannel.planId = this.$store.getters.currentPlan.id
        if (this.isCreateChannel) {
          this.currentChannel.creatorId = this.$store.getters.currentUser.id
          this.$store.getters.services.channels
            .create(this.currentChannel)
            .then(
              (returnedChannel) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Channel created.',
                  life: 3000,
                })
                this.$store.getters.currentPlan.channels.push(returnedChannel)
                this.currentChannelIntId = returnedChannel.id.intID

                // Add monthly focus if needed
                if (this.currentChannel.useMonthlyFocusType == true) {
                  //this.addMonthlyFocusType()
                }
                resolve(returnedChannel)
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error creating channel.',
                  detail: error,
                })
                reject(error)
              }
            )
        } else {
          this.$store.getters.services.channels
            .update(this.currentChannel)
            .then(
              (returnedChannel) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Channel updated.',
                  life: 3000,
                })
                this.$store.dispatch('refreshCurrentPlan')
                resolve(returnedChannel)
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error updating channel.',
                  detail: error,
                })
                reject(error)
              }
            )
        }
        this.$emit('ChannelChanged')
      })
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.channels-container {
  .channel-name.is-lead {
    display: flex;
    column-gap: 1rem;

    &::before {
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
}

.top-items {
  justify-content: center;
}
.channel-title {
  @include font-mulish-light;
  font-size: 18px;
}

.add-channel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  cursor: pointer;
      padding-bottom: 30px;
}
</style>
