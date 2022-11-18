<template>
  <div class="view-wrapper">
    <ViewHeader
      :titleLabel="planTypeName + ' Plan'"
      :title="this.isCreatePlan ? `New ${planTypeName} Plan` : this.plan.name"
      :hideSectionHomeButton="true"
      :isFullViewport="true"
    >
      <template #actions>
        <Button
          v-if="canUserEditPlanProperties && !isCreatePlan"
          @click="handleDelete($event)"
          icon="pi pi-trash"
          class="p-button-text p-mr-auto"
        />
        <Button
          @click="showCancelConfirmationPopUp($event)"
          :label="saveButtonDisabled ? 'Close' : 'Cancel'"
          class="p-button-outlined p-mr-2"
        />
        <Button
          v-if="
            canUserEditPlanProperties ||
            canUserManagePlanUsersChannelsSubscriptions
          "
          :class="saveButtonDisabled ? 'p-disabled' : null"
          :disabled="saveButtonDisabled"
          @click="handleCreatePlan"
          :label="saveButtonLabel"
        />
      </template>
    </ViewHeader>
    <ViewMain :isFullViewport="true">
      <div class="plan-detail-wrapper">
        <div class="defails-container">
          <h2>Plan Details</h2>
          <div class="p-d-flex">
            <!-- <h2>
                Plan Type: {{ plan.type }}
                <span style="font-size: 0.75em" v-if="masterPlan"
                  >(Child of {{ masterPlan.name }})</span
                >
              </h2> -->
            <div class="p-field p-mr-4">
              <label for="name">Plan Name</label>
              <InputText
                id="name"
                type="text"
                v-model="plan.name"
                :disabled="!canUserEditPlanProperties"
                @input="compareValues"
                autocomplete="off"
                :class="{'p-invalid': this.invalidFields.includes('name')}"
              />
            </div>
            <div class="p-field p-mr-4">
                <label for="useBudgets">Use Budgets</label>
                <InputSwitch
                  id="useBudgets"
                  v-model="plan.useBudgets"
                  :disabled="!canUserEditPlanProperties"
                  @input="compareValues"
                />  
            </div>
            <!-- TODO: remove after self-onboarding is implemented -->
            <div class="p-field p-mr-2" v-if="plan.useBudgets">
                <label for="totalBudget">Total Plan Budget</label>
                <InputCurrency
                  id="totalBudget"
                  :value.sync="plan.totalBudget"
                  :disabled="!canUserEditPlanProperties"
                  @input="compareValues"
                />
            </div>
            <!-- Media section hidden for MVP -->
            <!-- <div class="p-field p-mr-2">
                <label for="ratingPointsType">Rating Points Type</label>
                <Dropdown
                  id="ratingPointsType"
                  v-model="plan.ratingPointsType"
                  :options="ratingPointsOptions"
                  optionLabel="label"
                  optionValue="value"
                  :disabled="!canUserEditPlanProperties"
                />
              </div> -->
          </div>
        </div>

        <div class="time-frame-container">
          <hr class="p-my-5" />
          <h2>Time Frame</h2>
          <div class="p-d-flex">
            <div class="p-field p-mr-2">
              <label for="start">Start Date</label>
              <Calendar
                id="start"
                v-model="plan.startDate"
                :disabled="!canUserEditPlanProperties"
                @date-select="
                  () => {
                    onCalendarDateSelect()
                    compareValues()
                  }
                "
              />
            </div>
            <div class="p-field p-mr-2">
              <label for="end">End Date</label>
              <Calendar
                id="end"
                v-model="plan.endDate"
                :disabled="!canUserEditPlanProperties"
                @date-select="
                  () => {
                    onCalendarDateSelect()
                    compareValues()
                  }
                "
              />
            </div>
            <div class="p-field p-ml-4">
              <label>Week Starts On:</label>
              <div class="p-d-flex">
                <div class="p-d-flex p-mr-3">
                  <RadioButton
                    id="weekStart_sunday"
                    name="weekStart"
                    value="sunday"
                    v-model="plan.weekStartDay"
                    :disabled="!canUserEditPlanProperties"
                    class="p-mr-2"
                    @change="compareValues"
                  />
                  <label for="weekStart_sunday">Sunday</label>
                </div>
                <div class="p-d-flex">
                  <RadioButton
                    id="weekStart_monday"
                    name="weekStart"
                    value="monday"
                    v-model="plan.weekStartDay"
                    :disabled="!canUserEditPlanProperties"
                    class="p-mr-2"
                    @change="compareValues"
                  />
                  <label for="weekStart_monday">Monday</label>
                </div>
              </div>
            </div>
          </div>
          <hr class="p-my-5" />
        </div>

        <!-- Channels -->
        <div
          class="channels-container p-mb-6"
          :class="{'disabled-section': plan.id.intID == 0}"
        >
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>Channels</h2>
            <Button
              v-if="canUserManagePlanUsersChannelsSubscriptions"
              icon="pi pi-plus-circle"
              label="Add Channel"
              @click="handleEditChannel()"
            />
          </div>
          <div>
            <DataTable :value="allPlanChannels">
              <Column field="name" header="Channel Name" sortable>
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-between">
                    <div
                      class="p-d-flex p-ai-center channel-name"
                      :class="{
                        'is-nested': slotProps.data.isNested,
                        'is-lead': slotProps.data.isLead,
                      }"
                    >
                      <template v-if="isLeadPlan && slotProps.data.isNested">
                        {{ slotProps.data.abbreviatedPlanName }} > {{ slotProps.data.name }}
                      </template>
                      <template v-else>
                        {{ slotProps.data.name }}
                      </template>
                    </div>
                    <div v-if="(isLeadPlan && slotProps.data.isLead) || (!isLeadPlan && !slotProps.data.isLead)">
                      <Button
                        icon="pi pi-trash"
                        label="Delete"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="handleDeleteChannel(slotProps.data.id, $event)"
                      />
                      <Button
                        icon="pi pi-pencil"
                        label="Edit"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="handleEditChannel(slotProps.data)"
                      />
                    </div>
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Channels</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- Users -->
        <div
          class="users-container p-mb-6"
          :class="{'disabled-section': plan.id.intID == 0}"
        >
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>Team Members</h2>
            <Button
              v-if="canUserManagePlanUsersChannelsSubscriptions"
              label="Add Member"
              icon="pi pi-plus-circle"
              @click="shouldShowInviteUser = true"
            />
          </div>
          <div>
            <DataTable
              :value="usersInPlan"
              sortField="user.firstName"
              :sortOrder="1"
            >
              <Column field="user.firstName" header="Name" sortable>
                <template #body="slotProps">
                  {{ getAccountUserForId(slotProps.data.user.id).firstName }}
                  {{ getAccountUserForId(slotProps.data.user.id).lastName }}
                </template>
              </Column>
              <Column field="user.emailAddress" header="Email" sortable />
              <Column header="Role">
                <template #body="slotProps">
                  <template v-if="getRoleForId(slotProps.data.roleId)">
                    {{ getRoleForId(slotProps.data.roleId).title }}
                  </template>
                </template>
              </Column>
              <Column>
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-end">
                    <Button
                      label="Remove"
                      icon="pi pi-trash"
                      class="p-button-text"
                      @click="handleRemoveUserFromPlan(slotProps.data, $event)"
                    />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Team Members</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- Plan Elements / Strategic Priorities -->
        <div
          class="plan-elements-container plan-tags-container p-mb-6"
          :class="{'disabled-section': plan.id.intID == 0}"
        >
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>Strategic Priorities</h2>
            <Button
              v-if="canUserEditPlanProperties"
              label="Add Strategic Tag"
              icon="pi pi-plus-circle"
              @click="shouldShowTagList = true"
            />
          </div>
          <div>
            <DataTable :value="allPlanTags" sortField="type" :sortOrder="1">
              <Column field="type" header="Type" sortable />
              <Column field="title" header="Title" sortable>
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-between">
                    <div class="p-d-flex p-ai-center" :class="{
                        'is-nested': slotProps.data.isNested,
                        'is-lead': slotProps.data.isLead,
                      }">
                      <template v-if="isLeadPlan && slotProps.data.isNested">
                        {{ slotProps.data.abbreviatedPlanName }} > {{ slotProps.data.title }}
                      </template>
                      <template v-else>
                        {{ slotProps.data.title }}
                      </template>
                    </div>
                    <div>
                      <Button
                        label="Delete"
                        icon="pi pi-trash"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="handleDeleteTag(slotProps.data.id, $event)"
                      />
                      <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="() => handleEditTag(slotProps.data.id)"
                      />
                    </div>
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Strategic Priorities</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- Initiatives -->
        <div
          class="initiatives-container p-mb-6"
          :class="{'disabled-section': plan.id.intID == 0}"
        >
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>Initiatives</h2>
            <Button
              v-if="canUserManagePlanUsersChannelsSubscriptions"
              label="Add Initiative"
              icon="pi pi-plus-circle"
              @click="handleAddInitiative"
            />
          </div>
          <div>
            <DataTable :value="allPlanInitiatives">
              <Column field="tacticTypeName" header="Type" sortable />
              <Column field="title" header="Title" sortable>
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-between">
                    <div
                      class="p-d-flex p-ai-center initiative-title"
                      :class="{
                        'is-lead': slotProps.data.isLead,
                        'is-nested': slotProps.data.isNested,
                      }"
                    >
                      {{ slotProps.data.title }}
                    </div>
                    <div
                      v-if="!slotProps.data.isLead && !slotProps.data.isNested"
                    >
                      <Button
                        label="Delete"
                        icon="pi pi-trash"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="
                          handleDeleteInitiative(slotProps.data.id, $event)
                        "
                      />
                      <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="() => handleAddInitiative(slotProps.data.id)"
                      />
                    </div>
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Initiatives</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- Subsctiptions -->
        <div
          class="subscriptions-container p-mb-6"
          :class="{'disabled-section': plan.id.intID == 0}"
        >
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>Calendars of Interest</h2>
            <Button
              v-if="canUserManagePlanUsersChannelsSubscriptions"
              label="Add Calendar"
              icon="pi pi-plus-circle"
              @click="shouldShowSubscriptionList = true"
            />
          </div>
          <div>
            <DataTable :value="plan.subscriptions">
              <Column field="name" header="Name" sortable>
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-between">
                    <div class="p-d-flex p-ai-center">
                      {{ slotProps.data.name }}
                    </div>
                    <div>
                      <Button
                        label="Remove"
                        icon="pi pi-trash"
                        class="p-button-text"
                        v-if="canUserManagePlanUsersChannelsSubscriptions"
                        @click="
                          handleRemoveSubscription(slotProps.data.id, $event)
                        "
                      />
                    </div>
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Calendars of Interest</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <Dialog
        header="Add Member"
        :visible.sync="shouldShowInviteUser"
        :modal="true"
      >
        <UserAdd
          :shouldShowAddFromAccount="true"
          @shouldHide="shouldShowInviteUser = false"
        />
      </Dialog>

      <Dialog
        :header="
          (selectedChannel.name !== '' ? selectedChannel.name : 'New') +
          ' Channel'
        "
        :visible.sync="shouldShowChanelDetail"
        :modal="true"
      >
        <ChannelDetail :selectedChannel="selectedChannel" />
      </Dialog>

      <Dialog
        header="Select Subscription"
        :visible.sync="shouldShowSubscriptionList"
        :modal="true"
      >
        <SubscriptionList />
      </Dialog>

      <Dialog
        header="Strategic Priorities"
        :visible.sync="shouldShowTagList"
        :modal="true"
      >
        <TagList :allowEdit="true" :allowSelect="false" :allowCreate="true" />
      </Dialog>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import TagList from '@/app-shared/views/TagList.vue'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import UserAdd from '@/app-shared/views/UserAdd.vue'
import RadioButton from 'primevue/radiobutton'
import Plan, {
  PlanType,
  PlanWeekStartDay,
  PlanRatingPointsType,
} from '@/app-shared/models/Plan'
import ChannelDetail from '@/app-shared/views/ChannelDetail.vue'
import ID from '@/app-shared/models/ID'
import Channel from '@/app-shared/models/Channel'
import Tag from '@/app-shared/models/Tag'
import AlertMessage, {
  AlertMessageSeverity,
} from '@/app-shared/models/AlertMessage'
import TacticType from '@/app-shared/models/TacticType'
import TacticField, {TacticFieldType} from '@/app-shared/models/TacticField'
import Role from '@/app-shared/models/Role'
import Tactic from '@/app-shared/models/Tactic'
import SubscriptionList from '@/app-shared/views/SubscriptionList.deprecated.vue'
import UserRole from '@/app-shared/models/UserRole'
import InputCurrency from '@/app-shared/components/InputCurrency.vue'
import TacticPlatform from '@/app-shared/models/TacticPlatform'
import User from '@/app-shared/models/User'
import InputSwitch from 'primevue/inputswitch'

Vue.component('Checkbox', Checkbox)
Vue.component('RadioButton', RadioButton)
Vue.component('Dialog', Dialog)
Vue.component('InputSwitch', InputSwitch)

export default Vue.extend({
  name: 'PlanDetail',
  components: {
    ViewHeader,
    ViewMain,
    UserAdd,
    ChannelDetail,
    TagList,
    SubscriptionList,
    InputCurrency,
  },
  data: () => {
    return {
      selectedChannel: {},
      shouldShowInviteUser: false,
      shouldShowChanelDetail: false,
      shouldShowTagList: false,
      shouldShowSubscriptionList: false,
      initialName: '' as string,
      initialNumber: null as number | null, // TODO: remove after self-onboarding is implemented
      initialUseBudgets: false as boolean,
      initialStartDate: '' as string,
      initialEndDate: '' as string,
      initalWeekDay: '' as string,
      saveButtonDisabled: true as boolean,
      invalidFields: [] as string[],
      superPlanPlatformMappings: {} as {},
      parentPlan: null as null | Plan,
    }
  },
  computed: {
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    isLeadPlan(): boolean {
      return this.plan.plans.length ? true : false
    },
    isCreatePlan(): boolean {
      if (this.plan.id && this.plan.id.intID != 0) {
        return false
      }
      return this.$route.params.planId == '0' ? true : false
    },
    saveButtonLabel(): string {
      return this.isCreatePlan ? 'Create Plan' : 'Save'
    },
    masterPlan(): Plan | null {
      if (this.plan.parentId && this.plan.parentId.intID != 0) {
        return this.$store.getters.currentAccount.plans.find(
          (plan) => plan.id.intID == this.plan.parentId.intID
        )
      }
      return null
    },
    ratingPointsOptions(): object[] {
      return Object.keys(PlanRatingPointsType).map((key) => {
        return {
          label: key,
          value: PlanRatingPointsType[key],
        }
      })
    },
    canUserEditPlanProperties(): boolean {
      // let permissionLevel = Role.LEVEL_PLAN_ADMIN
      // if (this.plan.type == PlanType.Master) {
      //   permissionLevel = Role.LEVEL_MASTER_PLAN_ADMIN
      // }
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    canUserManagePlanUsersChannelsSubscriptions(): boolean {
      // let permissionLevel = Role.LEVEL_PLAN_ADMIN
      // if (this.plan.type == PlanType.Master) {
      //   permissionLevel = Role.LEVEL_MASTER_PLAN_ADMIN
      // }
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    usersInPlan(): UserRole[] {
      return this.plan.users.filter((userRole) => userRole.planId?.intID !== 0)
    },
    planTypeName() {
      if (this.$route.query.type && typeof this.$route.query.type == 'string') {
        switch (this.$route.query.type) {
          case 'Sub':
            return 'Nested'
          case 'Individual':
            return 'Individual'
          case 'Master':
            return 'Lead'
        }
      }else if(this.plan.plans.length){
        return 'Lead'
      }else if(this.plan.parentId.intID !== 0){
        return 'Nested'
      }
      return 'Individual'
    },
    allPlanChannels(): Channel[] {
      const localCurrentChannels = [...this.$store.getters.currentChannels]
      return localCurrentChannels.sort((a, b) => {
        if (a.isLead && !b.isLead) {
          return -1
        }
        if (!a.isLead && b.isLead) {
          return 1
        }
        return 0
      })
    },
    allPlanTags(): Tag[] {
      return this.plan.tags
    },
    allPlanInitiatives(): Tactic[] {
      return this.$store.getters.currentInitiatives
    },
  },
  mounted: function () {
    if (this.isCreatePlan) {
      this.$store.dispatch('updateCurrentPlan', new Plan()).then(() => {
        //Ensure new plan properties are reset if creating new plan after cancelling previously
        this.plan.name = ''
        this.plan.startDate = new Date()
        this.plan.endDate = new Date()

        // if the type and parent are set from the create button, add those
        if (
          this.$route.query.type &&
          typeof this.$route.query.type == 'string'
        ) {
          this.plan.type = PlanType[this.$route.query.type]
        }

        if (
          this.$route.query.parentid &&
          typeof this.$route.query.parentid == 'string'
        ) {
          this.plan.parentId = JSON.parse(this.$route.query.parentid)
        }

        this.$forceUpdate()
      })
    } else {
      //TODO: display loading blocker until refreshCurrentPlan API call returns values
      this.$store.commit(
        'updateCurrentPlanIntID',
        Number(this.$route.params.planId)
      )

      //TODO: This is in place because Plan is the only API that returns whole objects for Channels, Categories, Types, Fields and Tactics. Consider revising this system with API and/or UI changes to be more efficient in the future.
      this.$store.dispatch('refreshCurrentPlan').then(() => {
        this.setInitialValues()
        this.compareValues()
        // TODO: hide loading blocker
      })

      // if the current plan has a parent (lead) plan, then get it
      // so we can add the channels, tags, and initiatives
      if (
        this.$store.getters.currentPlan.parentId?.intID &&
        this.$store.getters.currentPlan.parentId.intID != 0
      ) {
        this.$store.getters.services.plans
          .get([this.$store.getters.currentPlan.parentId?.intID])
          .then((response) => {
            this.parentPlan = response
          })
      }
    }
  },
  methods: {
    setInitialValues() {
      this.initialName = this.plan.name
      this.initialNumber = this.plan.totalBudget
      this.initialUseBudgets = this.plan.useBudgets
      this.initialStartDate = JSON.stringify(this.plan.startDate)
      this.initialEndDate = JSON.stringify(this.plan.endDate)
      this.initalWeekDay = this.plan.weekStartDay
    },
    compareValues() {
      if (
        this.initialName === this.plan.name &&
        this.initialNumber === this.plan.totalBudget &&
        this.initialUseBudgets === this.plan.useBudgets &&
        this.initialStartDate === JSON.stringify(this.plan.startDate) &&
        this.initialEndDate === JSON.stringify(this.plan.endDate) &&
        this.initalWeekDay === this.plan.weekStartDay
      ) {
        this.saveButtonDisabled = true
      } else {
        this.saveButtonDisabled = false
      }

      //TODO: currently using forceUpdate because some input components were not truggering DOM render, this is likely because their models are properties of currentPlan and not reactive, resolve this issue by ensuring that these models are reactive
      this.$forceUpdate()
    },
    showCancelConfirmationPopUp(event) {
      if (this.saveButtonDisabled) {
        this.$router.back()
      } else {
        this.$confirm.require({
          acceptLabel: 'YES',
          rejectLabel: 'NO',
          target: event.currentTarget,
          message:
            'Are you sure you want to cancel? Your changes will be lost.',
          accept: () => {
            this.$router.back()
          },
          reject: () => {
            // Cancel rejected
          },
        })
      }
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
    handleAddInitiative(id) {
      const targetIntID = id.intID ? id.intID : 0
      this.$router.push({
        path: `${this.$router.currentRoute.fullPath}/initiative/${targetIntID}`,
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
    areFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.plan.name == '') {
        isFormValid = false
        this.invalidFields.push('name')
      }
      return isFormValid
    },
    onPlanCreationComplete(plan: Plan) {
      this.$store.getters.currentAccount.plans.push(plan)
      this.$store.dispatch('updateCurrentPlan', plan).then(() => {
        //Update URL
        this.$router.replace({
          params: {planId: plan.id.intID.toString()},
        })

        // Reset save button status
        this.setInitialValues()
        this.compareValues()

        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.success,
          summary: 'Plan created.',
          life: 3000,
        })
      })
    },
    async handleCreatePlan() {
      // Validate fields
      if (!this.areFieldsValid()) {
        return false
      }

      this.plan.accountId = this.$store.getters.currentAccount.id

      if (this.isCreatePlan) {
        this.plan.creator = this.$store.getters.currentUser
        this.$store.getters.services.plans.create(this.plan, this.plan.type == PlanType.Sub ? false : true).then(
          (plan) => {
            // TODO: BEGIN remove Platform, Channel, TacticType, and TacticField cloning

            // Clone platforms from SuperPlan
            // this.superPlanPlatformMappings = {}
            // this.$store.getters.services.plans.getPlatformsFromSuperPlan().then(
            //   (superPlanPlatforms) => {
            //     if (superPlanPlatforms.length) {
            //       superPlanPlatforms.forEach(async (superPlanPlatform, i) => {
            //         const thisSuperPlanPlatformIntID = superPlanPlatform.id.intID
            //         await this.addDefaultPlatformToPlan(superPlanPlatform).then(
            //           (returnedPlatform) => {
            //             plan.tacticPlatforms.push(returnedPlatform)
            //             this.superPlanPlatformMappings[
            //               thisSuperPlanPlatformIntID
            //             ] = returnedPlatform

            //             if (
            //               plan.tacticPlatforms.length >=
            //               superPlanPlatforms.length
            //             ) {
            //               //Update plan to save platforms
            //               this.$store.getters.services.plans.update(plan)

            //               //When last platform has been created start adding default channels
            //               this.onDefaultPlatformsCreationComplete(plan)
            //             }
            //           },
            //           (error) => {
            //             Vue.prototype.$toast.add({
            //               severity: AlertMessageSeverity.error,
            //               summary:
            //                 'Error adding default platform to new plan. ' +
            //                 error,
            //             })
            //           }
            //         )
            //       })
            //     } else {
            //       this.onDefaultPlatformsCreationComplete(plan)
            //     }
            //   },
            //   (error) => {
            //     Vue.prototype.$toast.add({
            //       severity: AlertMessageSeverity.error,
            //       summary: 'Error copying platforms from Super Plan. ' + error,
            //     })
            //   }
            // )

            // TODO: END remove Platform, Channel, TacticType, and TacticField cloning

            this.onPlanCreationComplete(plan)
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error creating new plan. ' + error,
            })
          }
        )
      } else {
        this.$store.getters.services.plans
          .update(this.plan)
          .then((plan) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Plan updated.',
              life: 3000,
            })
            this.$store.dispatch('updateCurrentPlan', plan)
          })
          .then(() => {
            this.setInitialValues()
            this.saveButtonDisabled = true
          })
        //diasble button when saved changes
      }
    },

    // TODO: BEGIN remove super plan cloning methods
    async addDefaultPlatformToPlan(
      platform: TacticPlatform
    ): Promise<TacticPlatform> {
      platform.id = new ID()

      return this.$store.getters.services.channels
        .createTacticPlatform(platform)
        .then(
          (returnedPlatform) => {
            return Promise.resolve(returnedPlatform)
          },
          (error) => {
            return Promise.reject(error)
          }
        )
    },
    onDefaultPlatformsCreationComplete(plan: Plan) {
      //Get Super Plan and copy channels to newly created plan
      this.$store.getters.services.plans.getChannelsFromSuperPlan().then(
        (superPlanChannels) => {
          if (superPlanChannels.length) {
            superPlanChannels.forEach(async (superPlanChannel, i) => {
              superPlanChannel.planId = plan.id
              await this.addDefaultChannelToPlan(superPlanChannel).then(
                (returnedChannel) => {
                  plan.channels.push(returnedChannel)

                  //When last channel has been created, add new plan to account and update current plan in global store
                  if (plan.channels.length >= superPlanChannels.length) {
                    this.onPlanCreationComplete(plan)
                  }
                },
                (error) => {
                  Vue.prototype.$toast.add({
                    severity: AlertMessageSeverity.error,
                    summary:
                      'Error adding default channel to new plan. ' + error,
                  })
                }
              )
            })
          } else {
            //Finalize plan creation if no channels are available from Super Plan
            this.onPlanCreationComplete(plan)
          }

          //Add new plan as sub-plan of master if needed
          if (this.masterPlan) {
            this.masterPlan.plans.push(plan.id)
            this.$store.getters.services.plans
              .update(this.masterPlan)
              .catch((error) => {
                //TODO: handle error
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error adding new plan to master plan. ' + error,
                })
              })
          }
        },
        (error) => {
          //TODO: handle error
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error copying channels from Super Plan. ' + error,
          })
        }
      )
    },
    async addDefaultChannelToPlan(channel: Channel): Promise<Channel> {
      const newTypes: TacticType[] = []

      for (let i = 0; i < channel.tacticTypes.length; i += 1) {
        const returnedType = await this.addDefaultTypeToChannel(
          channel.tacticTypes[i]
        )
        newTypes.push(returnedType)
      }

      channel.id = new ID()
      channel.tacticTypes = newTypes

      return this.$store.getters.services.channels.create(channel).then(
        (returnedChannel) => {
          return Promise.resolve(returnedChannel)
        },
        (error) => {
          return Promise.reject(error)
        }
      )
    },
    async addDefaultTypeToChannel(type: TacticType): Promise<TacticType> {
      const newFields: TacticField[] = []

      for (let i = 0; i < type.tacticFields.length; i += 1) {
        const returnedField = await this.addDefaultFieldToType(
          type.tacticFields[i]
        )
        newFields.push(returnedField)
      }

      type.id = new ID()
      type.tacticFields = newFields
      if (type.tacticPlatforms.length) {
        type.tacticPlatforms = type.tacticPlatforms.map((superPlanPlatform) => {
          return this.superPlanPlatformMappings[superPlanPlatform.id.intID]
        })
      }

      return this.$store.getters.services.channels.createTacticType(type).then(
        (returnedType) => {
          return Promise.resolve(returnedType)
        },
        (error) => {
          return Promise.reject(error)
        }
      )
    },
    addDefaultFieldToType(field: TacticField): Promise<TacticField> {
      return new Promise((resolve, reject) => {
        field.id = new ID()
        this.$store.getters.services.channels.createTacticField(field).then(
          (returnedField) => {
            resolve(returnedField)
          },
          (error) => {
            reject(error)
          }
        )
      })
    },
    // TODO: END remove super plan cloning methods

    handleCancel() {
      this.$router.back()
    },
    handleDelete(event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: this.isLeadPlan ? 'Are you sure you want to delete this lead plan? All nested plans will also be deleted.' : 'Are you sure you want to delete this plan?',
        accept: () => {
          this.$store.getters.services.plans
            .delete([this.plan.id.intID])
            .then(() => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.success,
                summary: 'Plan deleted.',
                life: 3000,
              })
              //TODO: clear currentPlan in AppStore
              this.$store.dispatch('refreshCurrentAccount').then(() => {
                this.$router.back()
              })
            })
        },
        reject: () => {
          // Delete rejected
        },
      })
    },
    onCalendarDateSelect() {
      if (this.plan.endDate < this.plan.startDate) {
        this.plan.endDate = this.plan.startDate
      }
    },
    handleDeleteTag(id: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.tags.delete([id.intID]).then(() => {
            this.$store.dispatch('refreshCurrentPlan')
          })
        },
        reject: () => {
          // Remove subscription rejected
        },
      })
    },
    handleEditTag(id: ID) {
      this.shouldShowTagList = true
    },
    handleRemoveSubscription(id: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.plan.subscriptions = this.plan.subscriptions.filter(
            (subscription) => subscription.id.intID != id.intID
          )

          //Update current plan with new subscription list
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
        reject: () => {
          // Remove subscription rejected
        },
      })
    },
    getRoleForId(roleId: ID) {
      return this.$store.getters.allRoles.find(
        (role) => role.id.intID == roleId.intID
      )
    },
    getAccountUserForId(userId: ID): User {
      const thisUser = this.$store.getters.currentAccountUsers.find((user)=>user.id.intID == userId.intID)
      return thisUser ? thisUser : new User()
    },
    handleRemoveUserFromPlan(userRole: UserRole, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.users.deleteUserRole(userRole.id).then(
            () => {
              this.$store.dispatch('refreshCurrentPlan')
            },
            (error) => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.error,
                summary: 'Error removing user from plan.',
                detail: error,
                life: 3000,
              })
            }
          )
        },
        reject: () => {
          // Remove user rejected
        },
      })
    },
  },
})
</script>

<style lang="scss">
.initiative-dialog {
  margin: auto;
  width: 50%;
}

.row-wrap {
  width: 80%;
}
.disabled-section {
  opacity: 0.5;
  pointer-events: none;
}
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
.plan-tags-container div.is-lead {
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
</style>
