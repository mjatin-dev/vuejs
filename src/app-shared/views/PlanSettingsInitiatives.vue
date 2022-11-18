<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Initiatives</h2>
      <div>
        <!-- <Button
          v-if="canUserManagePlanUsersChannelsSubscriptions"
          label="Add Initiative"
          icon="pi pi-plus-circle"
          @click="handleAddInitiative"
        /> -->
        <Button
          @click="$emit('complete')"
          label="Close"
          class="p-button-outlined p-ml-2"
        />
      </div>
    </div>
    <div class="plan-settings-modal-content">
      <div class="initiatives-container">
        <div>
          <p class="heading-text">
            Enter Campaigns, Promotions, and Key Dates to view in the Plan
            <br />
            and to tag and filter Tactics in the calendar views.
          </p>
        </div>
        <ul class="type" v-for="type in tacticTypes" :key="type.id.intID">
          <div v-if="type.tactics.length > 0">
            <li>
              <h3 class="type__title">{{ type.name }}</h3>
            </li>
            <li class="type__headers">
              <p class="tactic__name">Name</p>
              <p class="tactic__startDate">Start Date</p>
              <p class="tactic__endDate">End Date</p>
            </li>
            <li
              v-for="(tactic, tacticInd) in type.tactics"
              :key="tactic.id.intID"
              class="tactic custom-style-tactic"
            >
              <PlanSettingsInitiativeDetail
                :tactic="tactic"
                :tacticIndex="tacticInd"
                :isSetup="true"
              />
            </li>
          </div>
        </ul>
      </div>
    </div>
    <div class="add-tactic">
      <div class="field">
        <label for="add-tactic-input">Category </label>
        <Dropdown v-model="newTacticCategory" :options="categoryOptions" />
      </div>
      <div class="field">
        <label for="add-tactic-input">Name </label>
        <InputText type="text" v-model="newTacticName" />
      </div>
      <div class="add-tactic-btn" @click="() => addTactic()">
        <i class="pi pi-plus-circle p-mr-2"></i> Initiative
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Plan, {PlanType} from '@/app-shared/models/Plan'
import ID from '@/app-shared/models/ID'
import Role from '@/app-shared/models/Role'
import PlanSettingsInitiativeDetail from './PlanSettingsInitiativeDetail.vue'
import Channel from '../models/Channel'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Tactic from '../models/Tactic'
import TacticType from '../models/TacticType'

export default Vue.extend({
  name: 'PlanSettingsInitiatives',
  data: () => ({
    fileTypes: '.jpg,.jpeg,.png,.gif,.webp' as string,
    topViewContent: {
      title: 'Initiatives',
      infoText:
        'Enter priority Initiatives to view in the plan and connect related Tactics.',
    },
    shouldShowTagList: false,
    newTacticNames: {},
    newTacticName: '',
    newTacticCategory: '',
    // plan: {} as Plan,
    // initiativeChannel: {} as Channel,
  }),
  computed: {
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    initiativeChannel(): Channel {
      return this.$store.getters.currentPlan.initiativeChannel
    },
    categoryOptions(): string[] {
      return [...this.initiativeChannel.tacticTypes].map((el) => el.name)
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
        Role.LEVEL_CONTRIBUTOR
        ? true
        : false
    },
    tacticTypes(): TacticType[] {
      // Add tactic refs to TacticType objects
      this.initiativeChannel.tacticTypes.forEach((type) => {
        type.tactics = this.plan.tactics.filter(
          (tactic) => tactic.tacticTypeId.intID == type.id.intID
        )
      })
      return this.initiativeChannel.tacticTypes
    },
  },
  methods: {
    addTactic() {
      const typeIndex: number = this.initiativeChannel.tacticTypes.findIndex(
        (el) => el.name === this.newTacticCategory
      )
      const type = this.initiativeChannel.tacticTypes[typeIndex]

      if (!type) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must select a type',
        })
        return
      }

      if (!this.newTacticName) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must enter a name',
        })
        return
      }
      const newTactic: Tactic = Tactic.fromResponseObject({
        title: this.newTacticName,
        plan: this.plan.id.intID,
        creator: this.$store.getters.currentUser.id.intID,
        isInitiative: true,
      })
      newTactic.tacticType = type
      newTactic.tacticTypeId = type.id

      this.$store.getters.services.tactics
        .create(newTactic)
        .then((newDBTactic) => {
          newDBTactic.tacticType.opened = true
          newDBTactic.opened = true
          this.initiativeChannel.tacticTypes[typeIndex].tactics.push(
            newDBTactic
          )
          this.newTacticName = ''
          this.newTacticCategory = ''

          this.$store.dispatch('refreshCurrentPlan')
        })
    },
    handleAddInitiative(id) {
      const targetIntID = id.intID ? id.intID : 0
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/initiative/${targetIntID}`,
      })
    },
    handleDeleteInitiative(tacticId: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.tactics
            .delete([tacticId.intID])
            .then(() => {
              this.$store.dispatch('refreshCurrentPlan')
            })
        },
        reject: () => {
          // Reject item delete
        },
      })
    },
    refreshPlan() {
      this.$store.dispatch('refreshCurrentPlan')
    },
  },
  components: {PlanSettingsInitiativeDetail},
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.initiatives-container {
  .initiative-title.is-lead {
    display: flex;
    column-gap: 1rem;

    &::before {
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
}

.heading-text {
  @include font-mulish-light;
  text-align: center;
  font-size: 18px;
}

.add-tactic {
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;

  .field {
    @include font-mulish-light;
    display: flex;
    flex-direction: column;
    label {
      padding-left: 0px !important;
    }
  }

  .add-tactic-btn {
    @include font-mulish-light;
    font-size: 14px;
    padding-top: 14px;
    display: inline-block;
    cursor: pointer;
    .pi {
      font-size: 12px;
    }
  }
}
</style>
