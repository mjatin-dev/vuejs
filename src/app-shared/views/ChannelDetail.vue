<template>
  <div class="channel-detail-container">
    <div class="channel-edit-container" v-if="currentStep == 1">
      <div class="channel-meta-container">
        <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
          <h2 class="p-mb-0">Channel Details</h2>
          <Button @click="saveChannel()">Save Channel</Button>
        </div>
        <div class="p-d-flex p-jc-between p-ai-start">
          <div class="p-d-flex">
            <div class="p-field p-mr-2">
              <label for="name">Name</label>
              <InputText
                id="name"
                type="text"
                v-model="currentChannel.name"
                :disabled="
                  currentChannel.name == socialChannelName ? true : false
                "
                autocomplete="off"
                :class="{
                  'p-invalid': this.invalidFields.includes('channel-name'),
                }"
              />
            </div>
            <div class="p-field p-mr-2">
              <label for="description">Description</label>
              <InputText
                id="description"
                type="text"
                v-model="currentChannel.description"
                autocomplete="off"
              />
            </div>
          </div>
          <Button
            v-if="currentChannel.hasTactics"
            label="Export Tactics"
            icon="pi pi-download"
            class="import-export-tactics-button"
            @click="onClickExportTactics()"
          />
        </div>
        <div class="p-fluid">
          <div
            v-if="$store.getters.currentPlan.type == 'Master'"
            class="p-mb-4"
          >
            <Checkbox
              id="isShared"
              v-model="currentChannel.isShared"
              :binary="true"
              class="p-mr-2"
            />
            <label for="isShared">Share with Nested Plans</label>
          </div>
          <div class="p-mb-4">
            <Checkbox
              id="isPaidMedia"
              v-model="isPaidMedia"
              :binary="true"
              :disabled="!isPaidMediaInputEnabled"
              class="p-mr-2"
            />
            <label for="isPaidMedia"
              >This is a paid media channel with lengthy Tactic durations -
              include all Tactics in the In Market Media module in Overstory on
              Day and Month views</label
            >
          </div>
          <div>
            <Checkbox
              id="enableTacticFlagging"
              v-model="enableTacticFlagging"
              :binary="true"
              :disabled="!isTacticFlaggingInputEnabled"
              class="p-mr-2"
            />
            <label for="enableTacticFlagging"
              >This channel is heavy on daily Tactics: Hide Tactics on Flow view
              unless flagged</label
            >
          </div>
          <div class="p-mt-4">
            <Checkbox
              id="shouldShowCurrentMonthlyFocus"
              v-model="shouldShowCurrentMonthlyFocus"
              :binary="true"
              class="p-mr-2"
            />
            <label for="shouldShowCurrentMonthlyFocus"
              >Include Monthly Focus in Overstory of Day and Month views and in
              Flow view</label
            >
          </div>
        </div>
      </div>

      <template v-if="!isCreateChannel">
        <hr class="p-my-5" />

        <div class="types-container">
          <div class="types-list-container p-mb-4">
            <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
              <h2>{{ this.currentChannel.name }} Tactic Types</h2>
              <Button
                icon="pi pi-plus-circle"
                label="Add Type"
                @click="
                  (event) => {
                    this.$refs.addTypeOverlay.toggle(event)
                  }
                "
              />
              <OverlayPanel
                ref="addTypeOverlay"
                :showCloseIcon="true"
                appendTo="body"
              >
                <div class="p-d-flex p-flex-column">
                  <h3>New Type</h3>
                  <div class="p-field p-mb-2">
                    <label for="add_type_name">Name</label>
                    <InputText
                      id="add_type_name"
                      type="text"
                      v-model="newType.name"
                      autocomplete="off"
                      :class="{
                        'p-invalid': this.invalidFields.includes('type-name'),
                      }"
                    />
                  </div>
                  <span class="p-field p-mb-5">
                    <label for="add_type_description">Description</label>
                    <InputText
                      id="add_type_description"
                      type="text"
                      v-model="newType.description"
                      autocomplete="off"
                    />
                  </span>
                  <Button label="Save" @click="addType(newType)" />
                </div>
              </OverlayPanel>
            </div>

            <DataTable :value="visibleTypesInChannel">
              <Column field="name" header="Tactic Type Name">
                <template #body="slotProps">
                  <div class="p-d-flex p-jc-between">
                    <div class="p-d-flex p-ai-center">
                      {{ slotProps.data.name }}
                    </div>
                    <div>
                      <Button
                        icon="pi pi-trash"
                        label="Delete"
                        class="p-button-text"
                        @click="removeType(slotProps.data, $event)"
                      ></Button>
                      <Button
                        icon="pi pi-pencil"
                        label="Edit"
                        class="p-button-text"
                        @click="clickEditType(slotProps.data)"
                      />
                    </div>
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="empty-table">
                  <h3>No Types</h3>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </template>
    </div>

    <div class="type-edit-container" v-if="currentStep == 2">
      <Button
        label="Back to Channel Details"
        icon="pi pi-angle-left"
        class="back-to-channel-btn p-button-text p-mb-2"
        @click="
          () => {
            this.currentStep = 1
          }
        "
      />

      <div class="type-meta-container p-mb-6">
        <h2 class="p-mb-6">{{ this.currentType.name }} Tactic Type</h2>

        <div class="p-d-flex p-jc-between p-ai-start">
          <h2>Tactic Type Details</h2>
          <Button @click="updateType(currentType)" class="p-mt-3"
            >Save Type</Button
          >
        </div>
        <div class="p-d-flex">
          <div class="p-field p-mr-2">
            <label for="edit_type_name">Name</label>
            <InputText
              id="edit_type_name"
              type="text"
              v-model="currentType.name"
              autocomplete="off"
              :class="{'p-invalid': this.invalidFields.includes('type-name')}"
            />
          </div>
          <div class="p-field p-mr-2">
            <label for="edit_type_description">Description</label>
            <InputText
              id="edit_type_description"
              type="text"
              v-model="currentType.description"
              autocomplete="off"
            />
          </div>
        </div>
        <div class="p-d-flex" v-if="$store.getters.currentPlan.plans.length">
          <div class="p-field p-d-flex p-mr-2 p-mt-4">
            <Checkbox
              id="shouldHideTacticsFromNestedPlans"
              v-model="currentType.shouldHideTacticsFromNestedPlans"
              :binary="true"
              class="p-mr-2"
            />
            <label for="shouldHideTacticsFromNestedPlans">Hide tactics from nested plans</label>
          </div>
        </div>
      </div>

      <hr class="p-my-5" />

      <div class="platforms-container">
        <div class="platforms-list-container">
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>{{ this.currentType.name }} Platforms</h2>
            <div class="p-d-flex p-ai-center">
              <div class="p-field">
                <label>Select Platforms</label>
                <MultiSelect
                  v-model="currentType.tacticPlatforms"
                  :options="allPlatformsForPlan"
                  :filter="true"
                  optionLabel="name"
                  placeholder="Select Platforms"
                  class="p-mr-5"
                  style="max-width: 20rem"
                  @hide="updateTypePlatforms()"
                />
              </div>
              <Button
                icon="pi pi-plus-circle"
                label="Create Platform"
                @click="
                  (event) => {
                    this.$refs.addPlatformOverlay.toggle(event)
                  }
                "
              />
            </div>

            <OverlayPanel
              ref="addPlatformOverlay"
              :showCloseIcon="true"
              appendTo="body"
            >
              <div class="platform-add-container p-d-flex p-flex-column">
                <div class="p-field p-mb-5">
                  <label for="add_platform_name">Name</label>
                  <InputText
                    id="add_platform_name"
                    type="text"
                    v-model="newPlatform.name"
                    autocomplete="off"
                    :class="{
                      'p-invalid': this.invalidFields.includes('platform-name'),
                    }"
                  />
                </div>
                <Button label="Save" @click="addPlatform(newPlatform)" />
              </div>
            </OverlayPanel>
          </div>

          <DataTable
            :value="allPlatformsForType"
            editMode="row"
            :editingRows.sync="platformEditingRows"
            @row-edit-save="onPlatformRowEditSave"
          >
            <Column field="name" header="Platform Name">
              <template #editor="slotProps">
                <InputText
                  v-model="slotProps.data.name"
                  autofocus
                  autocomplete="off"
                />
              </template>
            </Column>
            <Column bodyStyle="text-align: right;">
              <template #body="slotProps">
                <Button
                  class="p-button-text"
                  icon="pi pi-trash"
                  label="Remove"
                  @click="removePlatform(slotProps.data.id, $event)"
                />
              </template>
            </Column>
            <Column :rowEditor="true" bodyStyle="text-align: right;" />
            <template #empty>
              <div class="empty-table">
                <h3>No Platforms</h3>
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <hr class="p-my-5" />

      <div class="fields-container">
        <div class="fields-list-container p-mb-4">
          <div class="p-d-flex p-jc-between p-ai-start p-mb-5">
            <h2>{{ this.currentType.name }} Fields</h2>
            <Button
              icon="pi pi-plus-circle"
              label="Add Field"
              @click="
                (event) => {
                  this.$refs.addFieldOverlay.toggle(event)
                }
              "
            />
          </div>
          <OverlayPanel
            ref="addFieldOverlay"
            :showCloseIcon="true"
            appendTo="body"
          >
            <div class="field-add-container p-d-flex p-flex-column">
              <div class="p-field p-mb-2">
                <label for="add_field_name">Name</label>
                <InputText
                  id="add_field_name"
                  type="text"
                  v-model="newField.name"
                  autocomplete="off"
                  :class="{
                    'p-invalid': this.invalidFields.includes('field-name'),
                  }"
                />
              </div>
              <div class="p-field p-mb-2">
                <label for="add_field_type">Type</label>
                <Dropdown
                  v-model="newField.type"
                  :options="fieldTypeOptions"
                  inputId="add_field_type"
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
              <div class="p-field p-mb-2">
                <label for="add_field_description">Description</label>
                <InputText
                  id="add_field_description"
                  type="text"
                  v-model="newField.description"
                  autocomplete="off"
                />
              </div>
              <div class="p-field p-mb-5">
                <label for="add_field_help_text">Help Text</label>
                <InputText
                  id="add_field_help_text"
                  type="text"
                  v-model="newField.helpText"
                  autocomplete="off"
                />
              </div>
              <Button label="Save" @click="addField(newField)" />
            </div>
          </OverlayPanel>

          <DataTable
            :value="currentFields"
            editMode="row"
            :editingRows.sync="fieldEditingRows"
            @row-edit-save="onFieldRowEditSave"
          >
            <Column field="name" header="Field Name">
              <template #body="slotProps">
                {{ slotProps.data.name }}
              </template>
              <template #editor="slotProps">
                <InputText
                  v-model="slotProps.data.name"
                  autofocus
                  autocomplete="off"
                />
              </template>
            </Column>
            <Column field="type" header="Type">
              <template #body="slotProps">
                {{ getFieldTypeName(slotProps.data.type) }}
              </template>
              <template #editor="slotProps">
                <Dropdown
                  v-model="slotProps.data.type"
                  :options="fieldTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                />
              </template>
            </Column>
            <Column field="description" header="Description">
              <template #editor="slotProps">
                <InputText
                  v-model="slotProps.data.description"
                  autofocus
                  autocomplete="off"
                />
              </template>
            </Column>
            <Column field="helpText" header="Help Text">
              <template #editor="slotProps">
                <InputText
                  v-model="slotProps.data.helpText"
                  autofocus
                  autocomplete="off"
                />
              </template>
            </Column>
            <Column bodyStyle="text-align: right;">
              <template #body="slotProps">
                <div class="p-d-flex">
                  <Button
                    class="p-button-text"
                    icon="pi pi-trash"
                    label="Delete"
                    @click="removeField(slotProps.data.id, $event)"
                  />
                </div>
              </template>
            </Column>
            <Column :rowEditor="true" bodyStyle="text-align: right;" />
            <template #empty>
              <div class="empty-table">
                <h3>No Fields</h3>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Checkbox from 'primevue/checkbox'
import Breadcrumb from 'primevue/breadcrumb'
import Channel from '@/app-shared/models/Channel'
import TacticType from '@/app-shared/models/TacticType'
import TacticField, {TacticFieldType} from '@/app-shared/models/TacticField'
import ID from '@/app-shared/models/ID'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import AlertMessage, {
  AlertMessageSeverity,
} from '@/app-shared/models/AlertMessage'
import OverlayPanel from 'primevue/overlaypanel'
import TacticPlatform from '../models/TacticPlatform'
import {flushToDom} from '@fullcalendar/common'
import MultiSelect from 'primevue/multiselect'

Vue.component('Checkbox', Checkbox)
Vue.component('Breadcrumb', Breadcrumb)
Vue.component('Dropdown', Dropdown)
Vue.component('DataTable', DataTable)
Vue.component('OverlayPanel', OverlayPanel)
Vue.component('MultiSelect', MultiSelect)

export default Vue.extend({
  name: 'ChannelDetail',
  props: {
    selectedChannel: Object as () => Channel,
    selectedType: Object as () => TacticType,
    step: Number,
  },
  data: () => {
    return {
      currentStep: 1,
      currentChannelIntId: 0 as number,
      currentTypeIntId: 0 as number,
      newChannel: {} as Channel,
      newPlatform: {} as TacticPlatform,
      newType: {} as TacticType,
      newField: {} as TacticField,
      currentEditingTypeName: '' as string,
      currentDisallowedTypeNames: [] as string[],
      isPaidMediaInputEnabled: true as boolean,
      isTacticFlaggingInputEnabled: true as boolean,
      fieldEditingRows: [],
      platformEditingRows: [],
      invalidFields: [] as string[],
    }
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

      return returnChannel || this.selectedChannel || this.newChannel
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
      return this.$store.getters.currentPlan.tacticPlatforms.filter((platform)=>!platform.isNested)
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
  },
  watch: {
    shouldShowCurrentMonthlyFocus() {
      if (
        this.currentChannel.id.intID !== 0 &&
        this.currentChannel.useMonthlyFocusType == true &&
        !this.allTypesInChannel.find(
          (type) =>
            type.name.toLowerCase() == this.$store.getters.monthlyFocusTypeName
        )
      ) {
        this.addMonthlyFocusType()
      }
    },
  },
  mounted: function () {
    this.currentStep = this.$props.step || 1
    if (this.$props.selectedChannel) {
      this.currentChannelIntId = this.$props.selectedChannel.id.intID
    }
    if (this.$props.selectedType) {
      this.currentTypeIntId = this.$props.selectedType.id.intID
    }
    this.newChannel = new Channel()
    this.newPlatform = new TacticPlatform()
    this.newType = new TacticType()
    this.newField = new TacticField()
  },
  methods: {
    areChannelFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.currentChannel.name == '') {
        isFormValid = false
        this.invalidFields.push('channel-name')
      }
      return isFormValid
    },
    saveChannel() {
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
                  this.addMonthlyFocusType()
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
        this.$emit('ChannelChanged');
              
              })
    },

    arePlatformFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.newPlatform.name == '') {
        isFormValid = false
        this.invalidFields.push('platform-name')
      }
      if (
        this.$store.getters.currentPlan.tacticPlatforms.find(
          (platform) => platform.name == this.newPlatform.name
        )
      ) {
        isFormValid = false
        this.invalidFields.push('platform-name')
      }
      return isFormValid
    },
    addPlatform(platform: TacticPlatform) {
      // Validate fields
      if (!this.arePlatformFieldsValid()) {
        return false
      }

      // Dismiss overlay - TypeScript comment to suppress error for calling method on $ref
      //@ts-expect-error
      this.$refs.addPlatformOverlay.hide()

      //Create new platform
      platform.creatorId = this.$store.getters.currentUser.id
      platform.plans.push(this.$store.getters.currentPlan.id)

      this.$store.getters.services.channels.createTacticPlatform(platform).then(
        (returnedPlatform) => {
          this.newPlatform = new TacticPlatform()

          //Add new platform to plan and type
          this.$store.getters.currentPlan.tacticPlatforms.push(returnedPlatform)
          this.currentType.tacticPlatforms.push(returnedPlatform)

          // Save association between new platform and current type
          this.$store.getters.services.channels
            .updateTacticType(this.currentType)
            .then(
              () => {
                //Success
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error adding new platform to type.',
                  detail: error,
                })
              }
            )
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error creating platform.',
            detail: error,
          })
        }
      )
    },
    onPlatformRowEditSave(event) {
      this.$store.getters.services.channels
        .updateTacticPlatform(event.data)
        .then(
          (returnedPlatform) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Platform updated.',
              life: 3000,
            })

            // Update platform on type and plan
            const platformsWithoutTarget =
              this.currentType.tacticPlatforms.filter(
                (platform) => platform.id.intID != returnedPlatform.id.intID
              ) as TacticPlatform[]
            platformsWithoutTarget.push(returnedPlatform)
            this.currentType.tacticPlatforms = platformsWithoutTarget
            this.$store.dispatch('refreshCurrentPlan')
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error updating platform.',
              detail: error,
            })
          }
        )
    },
    removePlatform(id: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.currentType.tacticPlatforms =
            this.currentType.tacticPlatforms.filter(
              (platform) => platform.id.intID != id.intID
            ) as TacticPlatform[]

          this.$store.getters.services.channels
            .updateTacticType(this.currentType)
            .then(
              () => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Platform removed from type.',
                  life: 3000,
                })
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error removing platform from type.',
                  detail: error,
                })
              }
            )
        },
        reject: () => {
          // Remove platform rejected
        },
      })
    },
    updateTypePlatforms() {
      this.$store.getters.services.channels
        .updateTacticType(this.currentType)
        .then(
          () => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Platforms updated.',
              life: 3000,
            })
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error updating platforms.',
              detail: error,
            })
          }
        )
    },

    areTypeFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.newType.name == '') {
        isFormValid = false
        this.invalidFields.push('type-name')
      }
      return isFormValid
    },
    addType(type: TacticType) {
      // Validate fields
      if (!this.areTypeFieldsValid()) {
        return false
      }

      //Prevent new type from using an existing type name
      if (
        this.allTypesInChannel.filter(
          (checkType) => checkType.name == type.name
        ).length
      ) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please choose a different type name.',
        })
      } else {
        // Dismiss overlay - TypeScript comment to suppress error for calling method on $ref
        //@ts-expect-error
        this.$refs.addTypeOverlay.hide()

        //Create new type
        type.creatorId = this.$store.getters.currentUser.id
        type.channelId = this.currentChannel.id
        this.$store.getters.services.channels.createTacticType(type).then(
          (returnedType) => {
            // Add new type to current channel and make API call to update channel
            this.currentChannel.planId = this.$store.getters.currentPlan.id
            this.currentChannel.tacticTypes.push(returnedType)
            this.$store.getters.services.channels
              .update(this.currentChannel)
              .then(
                () => {
                  this.newType = new TacticType()
                  this.currentTypeIntId = returnedType.id.intID
                  this.currentStep = 2

                  Vue.prototype.$toast.add({
                    severity: AlertMessageSeverity.success,
                    summary: 'Type created.',
                  })
                },
                (error) => {
                  Vue.prototype.$toast.add({
                    severity: AlertMessageSeverity.error,
                    summary: 'Error creating type.',
                    detail: error,
                  })
                }
              )
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error creating type.',
              detail: error,
            })
          }
        )
      }
    },
    addMonthlyFocusType() {
      // Create monthly focus type for channel if it does not exist
      const newMonthlyFocusType = new TacticType()
      newMonthlyFocusType.name = 'Monthly Focus'
      newMonthlyFocusType.creatorId = this.$store.getters.currentUser.id

      this.$store.getters.services.channels
        .createTacticType(newMonthlyFocusType)
        .then(
          (returnedType) => {
            // Add new type to current channel and make API call to update channel
            this.currentChannel.tacticTypes.push(returnedType)
            this.$store.getters.services.channels
              .update(this.currentChannel)
              .then(
                () => {
                  // Successful update
                },
                (error) => {
                  Vue.prototype.$toast.add({
                    severity: AlertMessageSeverity.error,
                    summary: `Error enabling Monthly Focus for ${this.currentChannel.name}.`,
                    life: 3000,
                  })
                }
              )
          },
          () => {
            this.currentChannel.useMonthlyFocusType = false
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: `Error enabling Monthly Focus for ${this.currentChannel.name}.`,
              life: 3000,
            })
          }
        )
    },
    updateType(type: TacticType) {
      //Prevent type from using an existing type name
      if (this.currentDisallowedTypeNames.indexOf(type.name) > -1) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please choose a different type name.',
        })
      } else {
        this.$store.getters.services.channels.updateTacticType(type).then(
          () => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Type updated.',
              life: 3000,
            })
            this.$store.dispatch('refreshCurrentPlan')
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error updating type.',
              detail: error,
            })
          }
        )
      }
    },
    removeType(type: TacticType, event) {
      let confirmationMessage = 'Are you sure?'
      if (type.tactics.length) {
        confirmationMessage =
          'Are you sure? Tactics of this Type exist in the Plan. Deleting this Type will delete them from the Plan. You can review a list of them in the Channels view.'
      }
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: confirmationMessage,
        accept: () => {
          this.$store.getters.services.channels
            .deleteTacticType(type.id.intID)
            .then(
              () => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Type deleted.',
                  life: 3000,
                })
                this.$store.dispatch('refreshCurrentPlan')
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error deleting type.',
                  detail: error,
                })
              }
            )
        },
        reject: () => {
          // Remove type rejected
        },
      })
    },
    clickEditType(type: TacticType) {
      this.currentEditingTypeName = type.name
      this.currentDisallowedTypeNames = this.allTypesInChannel
        .filter((filterType) => filterType.name != type.name)
        .map((mapType) => mapType.name)
      this.currentTypeIntId = type.id.intID
      this.currentStep = 2
    },

    areFieldFieldsValid(field: TacticField) {
      let isFormValid = true
      this.invalidFields = []
      if (field.name == '') {
        isFormValid = false
        this.invalidFields.push('field-name')
      }
      return isFormValid
    },
    addField(field: TacticField) {
      // Validate fields
      if (!this.areFieldFieldsValid(field)) {
        return false
      }

      field.creatorId = this.$store.getters.currentUser.id.clone()

      this.$store.getters.services.channels.createTacticField(field).then(
        (returnedField) => {
          this.currentType.tacticFields.push(returnedField)
          this.$store.getters.services.channels
            .updateTacticType(this.currentType)
            .then(
              () => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Field created.',
                  life: 3000,
                })
                this.$store.dispatch('refreshCurrentPlan').then(() => {
                  this.newField = new TacticField()

                  // Dismiss overlay - TypeScript comment to suppress error for calling method on $ref
                  //@ts-expect-error
                  this.$refs.addFieldOverlay.hide()
                })
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error creating type.',
                  detail: error,
                })
              }
            )
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error creating type.',
            detail: error,
          })
        }
      )
    },
    onFieldRowEditSave(event) {
      this.$store.getters.services.channels.updateTacticField(event.data).then(
        () => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Field updated.',
            life: 3000,
          })
          this.$store.dispatch('refreshCurrentPlan')
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error updating field.',
            detail: error,
          })
        }
      )
    },
    removeField(id: ID, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.channels
            .deleteTacticField(id.intID)
            .then(
              () => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Field deleted.',
                  life: 3000,
                })
                this.$store.dispatch('refreshCurrentPlan')
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error deleting field.',
                  detail: error,
                })
              }
            )
        },
        reject: () => {
          // Remove field rejected
        },
      })
    },
    onClickExportTactics() {
      this.$store.getters.services.channels
        .exportChannel(this.currentChannel.id, [], 'csv')
        .then(
          (response) => {
            const link = document.createElement('a')
            link.download = `AnnumExport-${this.currentChannel.name
              .toLowerCase()
              .replaceAll(' ', '-')}.zip`
            link.href = response.url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error exporting tactics.',
              detail: error,
            })
          }
        )
    },
    getFieldTypeName(type) {
      const fieldTypeOptionObj = this.fieldTypeOptions.find(
        (optionObj) => optionObj['value'] == type
      )
      if (fieldTypeOptionObj) {
        return fieldTypeOptionObj['label']
      }
      return type.charAt(0).toUpperCase() + type.substring(1)
    },
  },
})
</script>

<style lang="scss">
.channel-detail-container {
  .back-to-channel-btn {
    margin-left: -1rem;
  }
  .fields-list-container {
    .p-dropdown {
      // Field type dropdown options lists should be above input because it is nead bottom of modal
      .p-dropdown-panel {
        transform-origin: center bottom !important;
        top: auto !important;
        bottom: 3.4rem !important;
        left: -0.1rem !important;
      }
    }
  }
}
</style>
