<template>
  <div>
    <SetupTopView
      :title="topViewContent.title"
      :subtitle="topViewContent.subtitle"
      :infoText="topViewContent.infoText"
    />
    <Container
      class="setup-channels-container setup-content"
      drag-handle-selector=".drag-icon--channel"
      @drop="onChannelDrop"
    >
    
      <Draggable
        v-for="(channel, channelIndex) in channels"
        :key="channel.id.intID"
        class="setup-channel"
        :class="{'is-empty': channel.name === 'Initiatives'}"
      >
        <PlanSettingsChannelDetail :channel="channel" :channelIndex="channelIndex" />
      </Draggable>
      
      <div class="add-field">
        <div class="add-field__inputs">
          <ColorPicker
            @colorSelected="(color) => (newChannel.uiColor = color)"
            :selectedColor="newChannel.uiColor"
          />
          <InputText v-model="newChannel.name" placeholder="New Channel" />
        </div>

        <div
          class="add-field__btn"
          @click="() => addChannel(newChannel.name, newChannel.uiColor)"
        >
          <span class="pi pi-plus-circle"></span>
          <span>Channel</span>
        </div>
      </div>
    </Container>
    <div class="actions-container">
      <Button
        @click="handleClickContinue"
        class="continue-button onboarding-button-style"
        label="Continue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

import Tooltip from 'primevue/tooltip'
import SetupTopView from '@/app-shared/components/SetupTopView.vue'
import ColorPicker from '@/app-shared/components/ColorPicker.vue'
import {applyDrag} from '@/app-shared/utils/applyDrag'
import {Container, Draggable} from 'vue-smooth-dnd'
import TacticField, {TacticFieldType} from '@/app-shared/models/TacticField'
import Plan from '@/app-shared/models/Plan'
import Channel from '@/app-shared/models/Channel'
import ID from '@/app-shared/models/ID'
import User from '@/app-shared/models/User'

import Role from '@/app-shared/models/Role'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import PlanSettingsChannelDetail from '@/app-shared/views/PlanSettingsChannelDetail.vue'


Vue.component('Button', Button)
Vue.component('Checkbox', Checkbox)
Vue.component('Dropdown', Dropdown)
Vue.component('InputText', InputText)

const fieldOptions = {
  string: 'Text',
  number: 'Number',
  url: 'Link',
  image: 'Image',
}

export default Vue.extend({
  name: 'SetupCustomChannels',
  components: {
    SetupTopView,
    ColorPicker,
    Container,
    Draggable,
    PlanSettingsChannelDetail
},
  directives: {
    tooltip: Tooltip,
  },
  data: () => ({
    //updatingChannel: false,
    topViewContent: {
      title: 'Customize Channels',
      subtitle:
        'Create your own custom Channels and modify Tactic types and platforms to suit your planning needs.',
      infoText:
        'You must have a Channel set up with a Tactic Type in order to enter a Tactic into the Plan.',
    },
    newChannel: {
      name: '',
      uiColor: '#F1F6BC',
    },
    channels: [] as Channel[],
    channelsForUpdate: {},
    newChannelColor: '',
    // paidMediaHelpText:
    //   "Paid Media Channels show the timing of in market advertising. When you designate a Channel as Paid Media, it's multi week/month tactics are included in the In Market Media module in the Overstory on Day and Month views so as not to clutter up the individual day fields in these calendars.",
    hideInFlowViewHelpText:
      "The Flow view was designed to show a high level multi month overview of marketing plans. For Channels, such as Social Media, with multiple tactics per week or day, this feature gives you the ability to hide the Channel's tactics in the Flow view. These tactics will still be viewable in the Day, Month, and Table views. VIP tactics can be flagged in the Tactic Detail so they are still seen in the Flow view. <br/><br/>When choosing to hide tactics in a Channel, we suggest adding a Monthly Focus to provide a higher level summary of activity in the Flow view.",
    monthlyFocusHelpText:
      'A Monthly Focus can be added to a Channel to serve as a planning prompt or summary of activity in the Overstory of the Day and Month views and within the Flow view.',
    tacticTypeHelpText:
      'Tactic Types are used to differentiate various marketing vehicles used within a marketing channel.',
    platformsHelpText:
      'Platforms are the third party media, publishing and advertising companies such as Instagram, The New York Times, and Clear Channel Outdoor, that you use to promote your brand. Once entered, a Platform can be accessed in any Channel from a dropdown list.',
    customFieldsHelpText:
      'Beyond the default data associated with each Tactic, you can use Custom Fields to add additional information in the form of text, a number, an image, or a URL.',

   helpTextTooltipText: 'Demo tooltip',
  }),
  computed: {
    isAdmin(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel ==
        Role.LEVEL_ACCOUNT_ADMIN
      )
    },
    platforms(): string[] {
      return this.$store.getters.socialTacticPlatformNamesDict
    },
    types(): {} {
      return Object.keys(TacticFieldType).map((key) => {
        return {
          code: key,
          label: fieldOptions[key],
        }
      })
    },
    fieldOptions(): {} {
      return fieldOptions
    },
    currentUser(): User {
      return this.$store.getters.currentUser
    },
    currentPlan(): Plan {
      return this.$store.getters.currentSetupPlan
    },
  },
  created() {
    this.updateLocalChanels(this.currentPlan.channels)
  },
  methods: {
    updateLocalChanels(channels: Channel[]) {
      this.channels = channels
        .filter((c) => c.isVisibleCustomChannel)
        .map((c) => {
          c.tacticTypes = c.tacticTypes.filter(
            (t) => t.isVisibleCustomTacticType
          )
          return c
        })
        .map((channel) => {
          channel.planId = this.currentPlan.id
          channel.tacticTypes = channel.tacticTypes
            .filter((t) => t.name.toLowerCase() !== 'monthly focus')
            .map((tacticType) => {
              tacticType.tacticFields = tacticType.tacticFields.sort(
                (a, b) => a.orderIndex - b.orderIndex
              )
              return tacticType
            })
            .sort((a, b) => a.orderIndex - b.orderIndex)
          return channel
        })
        .sort((a, b) => a.orderIndex - b.orderIndex)
    },
    filterPlatforms(currentPlatforms) {
      if (!currentPlatforms.length) {
        return this.platforms
      }
      const platformNames = currentPlatforms.map((p) => p.name)
      return this.platforms.filter((p) => !platformNames.includes(p))
    },
    // Reordable methods
    onChannelDrop(dropResult) {
      const items = this.channels
      const newItems = applyDrag(items, dropResult)
      this.channels = newItems
      this.channels = this.channels.map((el, i) => {
        el.orderIndex = i
        this.editChannel('', el, i)
        return el
      })

      const newSetupPlan = this.$store.getters.currentSetupPlan
      newSetupPlan.channels = newItems
      this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
    },

    // Channel methods
    addChannel(name: string, uiColor: string) {
      if (!name) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must enter a name for the channel',
        })
        return
      }

      const channel = new Channel(
        new ID(),
        (this as any).currentUser.id,
        (this as any).currentPlan.id,
        name
      )
      channel.uiColor = uiColor
      channel.isVisibleCustomChannel = true
      channel.orderIndex = this.channels.length

      this.$store.getters.services.channels
        .create(channel)
        .then((newChannel: Channel) => {
          const newSetupPlan = this.$store.getters.currentSetupPlan
          newChannel.opened = true
          newSetupPlan.channels.push(newChannel)
          this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
          this.updateLocalChanels(newSetupPlan.channels)
        })
      this.newChannel = {
        name: '',
        uiColor: '#F1F6BC',
      }
    },
    editChannel(e, channel: Channel, channelIndex: number) {
      if (e) {
        e.stopPropagation()
      }
      channel.name = channel.editedChannelName
      channel.orderIndex = channelIndex

      this.$store.getters.services.channels.update(channel).then(() => {
        channel.editing = false
      })
    },
    handleImportFromCSV(e) {
      e.stopPropagation()
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentSetupPlan.id.intID}/import`,
      })
    },
    stopPropagation(e) {
      e.stopPropagation()
    },
    handleClickContinue() {
      this.$emit('setup-step-complete')
    },
  },
})
</script>
