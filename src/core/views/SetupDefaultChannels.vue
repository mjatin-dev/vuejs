<template>
  <div>
    <SetupTopView
      :title="topViewContent.title"
      :subtitle="topViewContent.subtitle"
      :infoText="topViewContent.infoText"
    />
    <ul class="setup-default-channels-container">
      <li class="setup-channel all-channels">
        <Checkbox
          :id="`all-channels`"
          :binary="true"
          v-model="allSelected"
          class="p-mr-3"
        />
        <label class="setup-channel__trigger">All</label>
      </li>
      <li
        v-for="(channel, i) in channels"
        :key="i"
        class="setup-channel setup-channel--default"
      >
        <div
          v-if="channel.name !== 'Initiatives'"
          class="setup-channel__trigger"
        >
          <Checkbox
            :id="`channel-${i}`"
            v-model="channel.isVisibleCustomChannel"
            :binary="true"
            class="p-mr-3"
          />
          <label :for="`channel-${i}`" class="setup-channel__trigger">
            {{ channel.name }}
          </label>
        </div>
      </li>
    </ul>
    <div class="actions-container p-mt-6">
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
import RadioButton from 'primevue/radiobutton'

import SetupTopView from '@/app-shared/components/SetupTopView.vue'
import Channel from '@/app-shared/models/Channel'

Vue.component('Button', Button)
Vue.component('Checkbox', Checkbox)
Vue.component('RadioButton', RadioButton)

export default Vue.extend({
  components: {
    SetupTopView,
  },
  data: () => ({
    topViewContent: {
      title: 'Default Channels',
      subtitle:
        'Select from our default marketing Channels to start. Then you can customize Tactic types and add Channels of your own.',
      infoText:
        'You must have a Channel set up with a Tactic Type in order to enter a Tactic into the Plan.',
    },
    channels: [] as any,
  }),
  created() {
    this.channels = this.$store.getters.currentSetupPlan.channels.map((c) => {
      if (c.name === 'Initiatives') {
        return {
          ...c,
          isVisibleCustomChannel: true,
        }
      }
      return {
        ...c,
        isVisibleCustomChannel: false,
      }
    })
  },
  computed: {
    allSelected: {
      set(newVal: boolean) {
        this.selectAll(newVal)
      },
      get() {
        return (
          this.channels.filter((channel) => !channel.isVisibleCustomChannel)
            .length === 0
        )
      },
    },
  },
  methods: {
    selectAll(shown = true) {
      this.channels = this.channels.map((channel) => ({
        ...channel,
        isVisibleCustomChannel: shown,
      }))
    },
    handleTacticTypeToggle(tactic) {
      tactic.isVisibleCustomTacticType = !tactic.isVisibleCustomTacticType
    },
    handleClickContinue() {
      const newChanels = this.channels
        .filter((el: Channel) => el.isVisibleCustomChannel)
        .map(({opened, ...channel}: any) => ({
          ...channel,
          tacticTypes: channel.tacticTypes.filter(
            (type) => type.isVisibleCustomTacticType
          ),
        }))

      const newPlan = this.$store.getters.currentSetupPlan
      newPlan.channels = this.channels
      newPlan.accountId = this.$store.getters.currentAccount.id

      Promise.allSettled(
        newChanels.map((c: Channel) => {
          const channel = new Channel(
            c.id,
            c.creatorId,
            c.planId,
            c.name,
            c.description,
            c.isShared,
            c.tacticTypes,
            c.enableTacticFlagging,
            c.currentMonthlyFocus,
            c.isPaidMedia
          )
          channel.isVisibleCustomChannel = c.isVisibleCustomChannel
          channel.uiColor = c.uiColor

          return this.$store.getters.services.channels.update(channel)
        })
      )
        .then((res: any) => res.value)
        .then(() => {
          newPlan.accountId = this.$store.getters.currentAccount.id
          this.$store.getters.services.plans.update(newPlan).then((p) => {
            this.$emit('setup-step-complete')
          })
        })
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.border {
  border: 1px solid #ccc !important;
}
.tactic {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  padding-bottom: 30px !important;
  &__radio {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid #ccc;
    position: absolute;
    left: 40px;
    margin-right: 10px;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: black;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s linear;
      opacity: 0;
    }
    &.hasFlag {
      &:before {
        opacity: 1;
      }
    }
  }
}
.all-channels {
  display: flex;
  flex-direction: row;
  position: relative;
  padding-bottom: 30px !important;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 60px;
    height: 1px;
    background-color: #979797;
  }
}

.selected-tactics {
  margin-left: 15px;
  font-weight: 400;
}

.setup-default-channels-container {
  @include font-mulish-light;
  .setup-channel {
    padding-bottom: 15px;
    border: none;
    display: flex;
    align-items: center;
  }

  .setup-channel__trigger {
    justify-content: flex-start;
  }
}

.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}
</style>
