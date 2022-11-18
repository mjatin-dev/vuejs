<template>
  <div>
    <div
      class="setup-channel__trigger"
      @click="() => (channel.opened = !channel.opened)"
      v-if="channel.name !== 'Initiatives'"
    >
      <div class="simple-row">
        <span
          :class="`drag-icon drag-icon--channel ${channel.opened && 'hasFlag'}`"
        >
          &#x2630;
        </span>

        <ColorPicker
          @colorSelected="
            (color, e) => {
              channel.uiColor = color
              handleChannelChangedField(e, channel)
            }
          "
          :selectedColor="channel.uiColor"
        />

        <div class="setup-channel__title-container">
          <div class="row">
            <h3
              class="setup-channel__title"
              v-if="!channel.editing && !canUserEdit"
            >
              {{ channel.name }}
            </h3>
            <InputText
              type="text"
              v-model="channel.editedChannelName"
              v-else
              @click="stopPropagation"
            />
            <div class="icons" v-show="channel.opened">
              <i
                v-if="channel.editing && canUserEdit"
                class="pi pi-check"
                @click="(e) => editChannel(e, channel, channelIndex)"
              />
              <i
                v-if="channel.editing && canUserEdit"
                class="pi pi-times"
                @click="
                  (e) => {
                    e.stopPropagation()
                    channel.editing = false
                  }
                "
              />
              <i
                v-else
                class="pi pi-pencil"
                @click="
                  (e) => {
                    e.stopPropagation()
                    channel.editing = true
                  }
                "
              />
              <i
                class="pi pi-trash"
                @click="(e) => deleteChannel(e, channel.id.intID)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="setup-channel__additional-fields">
        <Checkbox
          :id="`media-${channel.id.intID}`"
          v-model="channel.isPaidMedia"
          :binary="true"
          class="p-mr-2"
          @change="(e) => handleChannelChangedField(e, channel)"
        />
        <label :for="`media-${channel.id.intID}`" @click="stopPropagation"
          >Paid Media
          <span
            v-tooltip.bottom="paidMediaHelpText"
            class="pi pi-question-circle"
          >
          </span
        ></label>
        <Checkbox
          :id="`hide-tactics-${channel.id.intID}`"
          v-model="channel.enableTacticFlagging"
          :binary="true"
          class="p-mr-2"
          @change="(e) => handleChannelChangedField(e, channel)"
        />
        <label
          :for="`hide-tactics-${channel.id.intID}`"
          @click="stopPropagation"
          >Hide Tactics in Flow View
          <span
            v-tooltip.bottom="hideInFlowViewHelpText"
            class="pi pi-question-circle"
          ></span
        ></label>
        <Checkbox
          :id="`focus-${channel.id.intID}`"
          v-model="channel.useMonthlyFocusType"
          :binary="true"
          class="p-mr-2"
          @change="(e) => handleChannelChangedMonthlyFocus(e, channel)"
        />
        <label :for="`focus-${channel.id.intID}`" @click="stopPropagation"
          >Monthly Focus
          <span
            v-tooltip.bottom="monthlyFocusHelpText"
            class="pi pi-question-circle tooltip-color"
          ></span
        ></label>
      </div>

      <span
        :class="`setup-channel__arrow pi pi-chevron-${
          channel.opened ? 'down' : 'right'
        }`"
      ></span>
    </div>
    <div v-if="channel.opened" class="dropdown-content-channel">
      <div class="channel-export-btn">
        <!-- BEGIN: CSV buttons hidden for beta - JV 04.29.22 -->
        <!-- <Button
          class="onboarding-button-style"
          @click="(e) => handleChannelExport(e, channel)"
          label="Export Channel to CSV"
          disabled
        /> -->
        <!-- END: CSV buttons hidden for beta - JV 04.29.22 -->
      </div>
      <div>
        <Container
          class="tactics-container"
          @drop="(dropResults) => onTacticTypeDrop(dropResults, channelIndex)"
          drag-handle-selector=".drag-icon--tactic"
        >
          <Draggable
            class="setup-tactic custom-tactic-type"
            v-for="(tacticType, tacticTypeIndex) in channel.tacticTypes"
            :key="tacticType.id.intID"
          >
            <span class="drag-icon drag-icon--tactic">&#x2630;</span>

            <div
              class="setup-tactic__trigger"
              @click="() => (tacticType.opened = !tacticType.opened)"
            >
              <span class="setup-tactic__trigger__uptitle" v-if="tacticType.opened">
                Tactic Type
                <span
                  v-tooltip.bottom="tacticTypeHelpText"
                  class="pi pi-question-circle"
                ></span
              ></span>
              <div class="setup-tactic__trigger__title" v-if="!tacticType.editing">
                {{ tacticType.name }}
              </div>
              <InputText
                type="text"
                v-model="tacticType.editedTacticTypeName"
                v-else
                @click="stopPropagation"
              />
              <div class="setup-tactic__trigger__action-buttons">
                <div class="icons" v-if="tacticType.opened">
                  <i
                    v-if="tacticType.editing"
                    class="pi pi-check"
                    @click="(e) => editTacticType(e, tacticType, tacticTypeIndex)"
                  />
                  <i
                    v-if="tacticType.editing"
                    class="pi pi-times"
                    @click="
                      (e) => {
                        e.stopPropagation()
                        tacticType.editing = false
                      }
                    "
                  />
                  <i
                    v-else
                    class="pi pi-pencil"
                    @click="
                      (e) => {
                        e.stopPropagation()
                        tacticType.editing = true
                      }
                    "
                  />
                  <i
                    class="pi pi-trash"
                    @click="(e) => deleteTacticType(e, tacticTypeIndex, channelIndex)"
                  />
                </div>

                <div class="buttons" v-if="tacticType.opened">
                  <!-- BEGIN: CSV buttons hidden for beta - JV 04.29.22 -->
                  <!-- <Button
                    @click="(e) => handleImportFromCSV(e)"
                    label="Import from CSV"
                  /> -->
                  <!-- <Button
                    class="onboarding-button-style"
                    @click="(e) => handleExportToCSV(e, channel, tactic)"
                    label="Export to CSV"
                    disabled
                  /> -->
                  <!-- END: CSV buttons hidden for beta - JV 04.29.22 -->
                </div>
              </div>

              <span
                :class="`setup-tactic__arrow pi pi-chevron-${
                  tacticType.opened ? 'down' : 'right'
                }`"
              ></span>
            </div>

            <div :class="`dropdown-content ${tacticType.opened && 'isOpen'}`">
              <ul class="platforms">
                <li class="platforms__title">
                  Platforms
                  <span
                    v-tooltip.bottom="platformsHelpText"
                    class="pi pi-question-circle"
                  ></span>
                </li>
                <li
                  v-for="platform in tacticType.tacticPlatforms"
                  :key="platform.label"
                >
                  <div class="platform">
                    <span>
                      {{ platform.name }}
                    </span>
                    <i
                      class="pi pi-trash"
                      @click="
                        (e) =>
                          removePlatformFromTacticType(
                            channelIndex,
                            tacticTypeIndex,
                            platform.id.intID
                          )
                      "
                    />
                  </div>
                </li>
              </ul>
              <div class="add-field add-field--platform">
                <div class="p-d-flex">
                  <Checkbox
                    id="tacticTypeMultiplePlatforms"
                    v-model="tacticType.shouldTacticsAllowMultiplePlatforms"
                    :binary="true"
                    class="p-mr-3"
                    @change="()=>updateTacticTypeAllowMultiplePlatforms(tacticType.shouldTacticsAllowMultiplePlatforms, channelIndex, tacticTypeIndex)"
                  />
                  <label for="tacticTypeMultiplePlatforms">Allow tactics to have multiple platforms</label>
                </div>
                <div class="p-d-flex">
                  <MultiSelect
                    v-model="tacticType.newPlatforms"
                    :options="filteredPlatformsForType(tacticType)"
                    placeholder="Select Platforms"
                    optionLabel="name"
                    dataKey="key"
                    class="p-mr-3"
                  />
                  <div
                    class="add-field__btn"
                    @click="() =>updateTacticTypePlatforms(tacticType)"
                  >
                    <span class="pi pi-plus-circle"></span>
                    <span>Platform</span>
                  </div>
                </div>
              </div>
              <div class="customFields">
                <div class="customFields__header">
                  <div class="customFields__header__title">
                    Custom Fields
                    <span
                      v-tooltip.bottom="customFieldsHelpText"
                      class="pi pi-question-circle"
                    ></span>
                  </div>
                  <div class="header-fields">
                    <div class="name">Name</div>
                    <div class="type">Type</div>
                  </div>
                </div>
                <Container
                  @drop="
                    (dropResult) =>
                      onCustomFieldsDrop(dropResult, channelIndex, tacticTypeIndex)
                  "
                  drag-handle-selector=".drag-icon--custom-field"
                >
                  <Draggable
                    v-for="(field, fieldIndex) in tacticType.tacticFields"
                    :key="field.label"
                  >
                    <div class="tactic-field">
                      <span class="drag-icon drag-icon--custom-field"
                        >&#x2630;</span
                      >
                      <div class="name">
                        <span v-if="!field.editing">
                          {{ field.name }}
                        </span>
                        <InputText
                          type="text"
                          v-model="field.editedTacticFieldFields.name"
                          v-else
                        />
                      </div>
                      <div class="type">
                        <span v-if="!field.editing">
                          {{ fieldOptions[field.type] }}
                        </span>
                        <Dropdown
                          v-else
                          v-model="field.editedTacticFieldFields.type"
                          :options="types"
                          placeholder="Type"
                          optionLabel="label"
                        />
                      </div>
                      <div class="icons">
                        <i
                          v-if="field.editing"
                          class="pi pi-check"
                          @click="() => editCustomField(field, fieldIndex)"
                        />
                        <i
                          v-if="field.editing"
                          class="pi pi-times"
                          @click="
                            () => {
                              field.editing = false
                            }
                          "
                        />
                        <i
                          v-else
                          class="pi pi-pencil"
                          @click="
                            () => {
                              field.editing = true
                            }
                          "
                        />
                        <i
                          class="pi pi-trash"
                          @click="
                            () =>
                              deleteCustomField(
                                tacticTypeIndex,
                                channelIndex,
                                field.id.intID
                              )
                          "
                        />
                      </div>
                    </div>
                  </Draggable>
                </Container>

                <div>
                  <div class="add-field add-field--type">
                    <div class="name">
                      <InputText
                        v-model="tacticType.newTacticField.name"
                        placeholder="New Custom Field"
                      />
                    </div>
                    <div class="type">
                      <Dropdown
                        v-model="tacticType.newTacticField.type"
                        :options="types"
                        placeholder="Type"
                        optionLabel="label"
                      />
                    </div>

                    <div
                      class="add-field__btn"
                      @click="
                        () =>
                          addTacticField(
                            tacticType.newTacticField,
                            channelIndex,
                            tacticTypeIndex
                          )
                      "
                    >
                      <span class="pi pi-plus-circle"></span>
                      <span>Custom Field</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Draggable>
          <div class="add-field add-field--tactic">
            <InputText
              v-model="channel.newTacticName"
              placeholder="New Tactic Type"
            />

            <div
              class="add-field__btn"
              @click="() => addTacticType(channel, channelIndex)"
            >
              <span class="pi pi-plus-circle"></span>
              <span>Tactic Type</span>
            </div>
          </div>
        </Container>
      </div>
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
import TacticType from '@/app-shared/models/TacticType'
import TacticPlatform from '@/app-shared/models/TacticPlatform'
import TacticField, {TacticFieldType} from '@/app-shared/models/TacticField'
import Plan from '@/app-shared/models/Plan'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Channel from '@/app-shared/models/Channel'
import ID from '@/app-shared/models/ID'
import {applyDrag} from '@/app-shared/utils/applyDrag'

import {Container, Draggable} from 'vue-smooth-dnd'
import ColorPicker from '@/app-shared/components/ColorPicker.vue'

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
  name: 'PlanSettingsChannelDetail',
  props: {
    channel: {
      type: Object,
      required: true,
    },
    channelIndex: {
      type: Number,
      required: true,
    },
    canUserEdit: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  components: {
    ColorPicker,
    Container,
    Draggable,
  },
  directives: {
    tooltip: Tooltip,
  },
  data: () => ({
    channels: [] as Channel[],
    updatingChannel: false,
    paidMediaHelpText:
      "Paid Media Channels show the timing of in market advertising. When you designate a Channel as Paid Media, it's multi week/month tactics are included in the In Market Media module in the Overstory on Day and Month views so as not to clutter up the individual day fields in these calendars.",
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
  }),
  computed: {
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
    currentPlan(): Plan {
      if (this.$route.path.indexOf('setup') > 0) {
        return this.$store.getters.currentSetupPlan
      } else {
        const currentPlan = this.$store.getters.currentPlan
        return currentPlan
      }
    },
    platforms(): string[] {
      return this.$store.getters.socialTacticPlatformNamesDict
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
            .filter((t) => t.name.toLowerCase() !== this.$store.getters.monthlyFocusTypeName)
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
    updateTacticTypeAllowMultiplePlatforms(newValue: boolean, channelIndex: number, tacticIndex: number) {
      const thisTacticType = this.currentPlan.channels[channelIndex].tacticTypes[tacticIndex]
      thisTacticType.shouldTacticsAllowMultiplePlatforms = newValue
      this.$store.getters.services.channels.updateTacticType(thisTacticType)
    },
    updateTacticTypePlatforms(tacticType) {
      if (!tacticType.newPlatforms) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must select platforms first',
        })
        return
      }

      tacticType.tacticPlatforms = tacticType.tacticPlatforms.concat(tacticType.newPlatforms)
      this.$store.getters.services.channels.updateTacticType(tacticType).then(()=>{
        tacticType.newPlatforms = []
      })
    },
    filteredPlatformsForType(tacticType) {
      return this.currentPlan.tacticPlatforms.filter((platform) => {
        if(tacticType.tacticPlatforms.find((currentPlatform)=>currentPlatform.id.intID === platform.id.intID)){
          return false
        }
        return true
      })
    },
    removePlatformFromTacticType(
      channelIndex: number,
      tacticIndex: number,
      platformId: number
    ){
      const thisTacticType = this.currentPlan.channels[channelIndex].tacticTypes[tacticIndex]
      thisTacticType.tacticPlatforms = thisTacticType.tacticPlatforms.filter((platform) => platform.id.intID !== platformId)
      this.$store.getters.services.channels.updateTacticType(thisTacticType)
    },
    deleteChannel(e, channelId: number) {
      e.stopPropagation()
      this.$store.getters.services.channels.delete([channelId]).then(() => {
        const newSetupPlan = (this as any).currentPlan
        newSetupPlan.channels = newSetupPlan.channels.filter(
          (channel) => channel.id.intID !== channelId
        )

        this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
        this.updateLocalChanels(newSetupPlan.channels)
      })
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
    handleChannelChangedField(e, channel: Channel) {
      e.stopPropagation()

      if (!this.updatingChannel) {
        this.updatingChannel = true
        setTimeout(() => {
          this.$store.getters.services.channels.update(channel).then(() => {
            this.updatingChannel = false
            this.$store.dispatch('refreshCurrentPlan')
          })
        }, 400)
      }
    },
    handleChannelChangedMonthlyFocus(e, channel: Channel) {
      e.stopPropagation()
      if(channel.useMonthlyFocusType){
        this.addMonthlyFocusType(channel)
      }else{
        this.removeMonthlyFocusType(channel)
      }
    },
    handleExportToCSV(e, channel: Channel, type: TacticType) {
      e.stopPropagation()
      this.$store.getters.services.channels
        .exportChannel(channel.id, [type.id], 'csv')
        .then(
          (response) => {
            const link = document.createElement('a')
            link.download = `AnnumExport-${type.name
              .toLowerCase()
              .replaceAll(' ', '-')}.zip`
            link.href = response.url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.warn,
              summary: 'Error exporting tactics.',
              detail: error,
            })
          }
        )
    },
    onCustomFieldsDrop(dropResult, channelIndex: number, tacticIndex: number) {
      const items =
        this.channels[channelIndex].tacticTypes[tacticIndex].tacticFields
      const newItems = applyDrag(items, dropResult)
      this.channels[channelIndex].tacticTypes[tacticIndex].tacticFields =
        newItems

      this.channels[channelIndex].tacticTypes[tacticIndex].tacticFields =
        this.channels[channelIndex].tacticTypes[tacticIndex].tacticFields.map(
          (el, i) => {
            el.orderIndex = i
            this.editCustomField(el, i)
            return el
          }
        )

      const newSetupPlan = this.$store.getters.currentSetupPlan
      newSetupPlan.channels[channelIndex].tacticTypes[
        tacticIndex
      ].tacticFields = newItems
      this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
    },
    editCustomField(field: TacticField, fieldIndex: number) {
      field.name = field.editedTacticFieldFields.name
      field.type = field.editedTacticFieldFields.type.code
      field.description = field.editedTacticFieldFields.description
      field.helpText = field.editedTacticFieldFields.helpText
      field.orderIndex = fieldIndex

      this.$store.getters.services.channels
        .updateTacticField(field)
        .then(() => {
          field.editing = false
        })
    },
    deleteCustomField(tacticIndex, channelIndex, fieldId) {
      const newTacticType = (this as any).currentPlan.channels[channelIndex]
        .tacticTypes[tacticIndex]
      this.$store.getters.services.channels
        .deleteTacticType(fieldId)
        .then((response) => {
          newTacticType.tacticFields = newTacticType.tacticFields.filter(
            (field) => field.id.intID !== fieldId
          )

          this.$store.getters.services.channels
            .updateTacticType(newTacticType)
            .then((updatedTacticType) => {
              const newSetupPlan = this.$store.getters.currentSetupPlan
              newSetupPlan.channels[channelIndex].tacticTypes[tacticIndex] =
                updatedTacticType
              this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
              this.updateLocalChanels(newSetupPlan.channels)
            })
            .catch((error) =>
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.warn,
                summary: 'Error in deleting tactics.',
                detail: error,
              })
            )
        })
        .catch((error) =>
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.warn,
            summary: 'Error in deleting tactics.',
            detail: error,
          })
        )
    },
    addTacticField(newField: any, channelIndex: number, tacticIndex: number) {
      if (!newField.name) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must give a name to the field first',
        })
        return
      }
      if (!newField.type) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must select a type',
        })
        return
      }

      const newTacticField = new TacticField(
        new ID(),
        (this as any).$store.getters.currentUser?.id,
        newField.name,
        newField.type.code,
        newField.description,
        newField.helpText
      )

      const localCurrentChannels = [...(this as any).currentPlan.channels]
        .sort((a, b) => {
          if (a.isLead && !b.isLead) {
            return -1
          }
          if (!a.isLead && b.isLead) {
            return 1
          }
          return 0
        })
        .filter((item) => item.name !== 'Initiatives')

      newTacticField.orderIndex =
        localCurrentChannels[channelIndex].tacticTypes[
          tacticIndex
        ].tacticFields.length

      this.$store.getters.services.channels
        .createTacticField(newTacticField)
        .then((createTacticField) => {
          const newTacticType =
            localCurrentChannels[channelIndex].tacticTypes[tacticIndex]
          newTacticType.tacticFields.push(createTacticField)

          this.$store.getters.services.channels
            .updateTacticType(newTacticType)
            .then(() => {
              this.currentPlan.channels = localCurrentChannels
              const newSetupPlan = this.currentPlan
              newSetupPlan.channels[channelIndex].tacticTypes[tacticIndex] =
                newTacticType
              localCurrentChannels[channelIndex].tacticTypes[
                tacticIndex
              ].newTacticField = {
                name: '',
                type: '',
                description: '',
                helpText: '',
              }

              if (this.$route.path.indexOf('setup') > 0) {
                this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
              } else {
                this.$store.commit('updateCurrentPlan', newSetupPlan)
              }
              // this.updateLocalChanels(newSetupPlan.channels)
            })
        })
    },
    deleteTacticType(e, tacticTypeIndex: number, channelIndex: number) {
      e.stopPropagation()
      this.$store.getters.services.channels
        .deleteTacticType(
          this.channels[channelIndex].tacticTypes[tacticTypeIndex].id.intID
        )
        .then(() => {
          const newSetupPlan = this.$store.getters.currentSetupPlan
          newSetupPlan.channels[channelIndex].tacticTypes =
            newSetupPlan.channels[channelIndex].tacticTypes.filter(
              (tacticType, index) => index !== tacticTypeIndex
            )
          this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
          this.updateLocalChanels(this.currentPlan.channels)
        })
        .catch((error) =>
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.warn,
            summary: 'Error in deleting tactics.',
            detail: error,
          })
        )
    },
    onTacticTypeDrop(dropResult, channelIndex: number) {
      const items = this.channels[channelIndex].tacticTypes
      const newItems = applyDrag(items, dropResult)
      this.channels[channelIndex].tacticTypes = newItems
      this.channels[channelIndex].tacticTypes = this.channels[
        channelIndex
      ].tacticTypes.map((el, i) => {
        el.orderIndex = i
        this.editTacticType('', el, i)
        return el
      })

      const newSetupPlan = this.$store.getters.currentSetupPlan
      newSetupPlan.channels[channelIndex].tacticTypes = newItems
      this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
    },
    editTacticType(e, tactic: TacticType, tacticIndex: number) {
      if (e) {
        e.stopPropagation()
      }
      tactic.name = tactic.editedTacticTypeName
      tactic.orderIndex = tacticIndex
      this.$store.getters.services.channels
        .updateTacticType(tactic)
        .then(() => {
          tactic.editing = false
        })
    },
    handleChannelExport(e, channel: Channel) {
      e.stopPropagation()
      this.$store.getters.services.channels
        .exportChannel(
          channel.id,
          channel.tacticTypes.map((t) => t.id),
          'csv'
        )
        .then(
          (response) => {
            const link = document.createElement('a')
            link.download = `AnnumExport-${channel.name}.zip`
            link.href = response.url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.warn,
              summary: 'Error exporting tactics.',
              detail: error,
            })
          }
        )
    },
    addTacticType(channel: Channel, channelIndex: number) {
      if (!channel.newTacticName) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must enter a tactic name first',
        })
        return
      }

      const tacticName = channel.newTacticName
      if (tacticName.toLowerCase() === this.$store.getters.monthlyFocusTypeName) {
        this.addMonthlyFocusType(channel)
      } else {
        const tacticType = new TacticType(
          new ID(),
          (this as any).$store.getters.currentUser?.id,
          tacticName,
          '',
          [],
          [],
          [],
          this.channels[channelIndex].id
        )
        tacticType.isVisibleCustomTacticType = true
        tacticType.orderIndex = this.channels[channelIndex].tacticTypes.length

        this.$store.getters.services.channels
          .createTacticType(tacticType)
          .then((newTacticType) => {
            channel.newTacticName = ''
            const newSetupPlan = this.currentPlan
            newSetupPlan.channels[channelIndex].tacticTypes.push(newTacticType)
            if (this.$route.path.indexOf('setup') > 0) {
              this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
            } else {
              this.$store.commit('updateCurrentPlan', newSetupPlan)
            }
            //this.updateLocalChanels(newSetupPlan.channels)
          })
      }
    },
    addMonthlyFocusType(channel) {
      // Create monthly focus type for channel if it does not exist
      const newMonthlyFocusType = new TacticType()
      newMonthlyFocusType.name = 'Monthly Focus'
      newMonthlyFocusType.creatorId = this.$store.getters.currentUser.id

      this.$store.getters.services.channels
        .createTacticType(newMonthlyFocusType)
        .then(
          (returnedType) => {
            // Add new type to current channel and make API call to update channel
            channel.tacticTypes.push(returnedType)
            this.updateLocalChanels(this.currentPlan.channels)
            this.$store.getters.services.channels.update(channel).then(
              () => {
                this.updateLocalChanels(this.currentPlan.channels)
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: `Error enabling Monthly Focus for ${channel.name}.`,
                  life: 3000,
                })
              }
            )
          },
          () => {
            channel.useMonthlyFocusType = false
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: `Error enabling Monthly Focus for ${channel.name}.`,
              life: 3000,
            })
          }
        )
    },
    removeMonthlyFocusType(channel: Channel) {
      const thisMonthlyFocusTacticTypeIntID = channel.tacticTypes.find((type)=>type.name.toLowerCase() === this.$store.getters.monthlyFocusTypeName)?.id.intID
      if(thisMonthlyFocusTacticTypeIntID){
        this.$store.getters.services.channels
        .deleteTacticType(thisMonthlyFocusTacticTypeIntID)
        .then(
          () => {
            // Update list of types on current channel and make API call to update channel
            channel.tacticTypes = channel.tacticTypes.filter((type)=>type.name.toLowerCase() !== this.$store.getters.monthlyFocusTypeName)
            this.$store.getters.services.channels.update(channel).then(
              () => {
                this.updateLocalChanels(this.currentPlan.channels)
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: `Error disabling Monthly Focus for ${channel.name}.`,
                  life: 3000,
                })
              }
            )
          },
          () => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: `Error disabling Monthly Focus for ${channel.name}.`,
              life: 3000,
            })
          }
        )
      }
    },
    stopPropagation(e) {
      e.stopPropagation()
    },
  },
})
</script>


<style lang="scss" scoped>
@import '@/app-shared/styles/_imports.scss';
.smooth-dnd-container.vertical > .smooth-dnd-draggable-wrapper {
  overflow: visible;
}
.channel-export-btn {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  padding-top: 15px;
}
.simple-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.custom-tactic-type {
  .field {
    position: relative;
    max-height: 35px;
  }
}
.drag-icon--tactic {
  position: absolute;
  left: -30px;
  top: 25px;
}

.add-field--platform {
  margin-bottom: 10px;
}

.add-field--tactic {
  padding-left: 0px;
}

.add-field--type {
  position: relative;
  justify-content: flex-start;
  gap: 20px;

  .add-field__btn {
    align-items: center;
    position: absolute;
    right: 0;
    @include font-mulish-light;
  }

  .type {
    margin: 0;
  }
}

.tactic-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  border-bottom: gray solid 1px;
  padding: 5px 0;

  .type {
    margin: 0;
  }
  .icons {
    position: absolute;
    right: 0;
  }
}

.dropdown-content-channel {
  * {
    border-color: rgba(0, 0, 0, 0.08) !important;
  }
}

.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.tooltip-color {
  color: gray;
}
</style>
