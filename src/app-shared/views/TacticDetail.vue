
<template>
  <BlockUI :blocked="isUIBlocked" :fullScreen="true">
    <div class="view-wrapper">
      <ViewHeader
        :title="viewTitle"
        :titleLabel="this.isInitiative ? 'Initiative' : 'Tactic'"
        :hideSectionHomeButton="true"
        :isFullViewport="true"
        :hideRoleTutorial="true"
      >
        <template #actions>
          <Button
            @click="handleDeleteTactic($event)"
            class="p-button-text p-mr-auto"
            icon="pi pi-trash"
            v-if="!isCreateTactic && canUserDeleteTactic"
          />
          <Button
            @click="showCancelConfirmation($event)"
            class="p-mr-2 p-button-outlined"
            :label="saveButtonDisabled ? 'Close' : 'Cancel'"
          />
          <Button
            :class="saveButtonDisabled ? 'p-disabled' : null"
            :disabled="saveButtonDisabled"
            @click="handleSaveTactic"
            label="Save"
          />
        </template>
      </ViewHeader>
      <ViewMain :isFullViewport="true">
        <div class="tactic-detail-wrapper">
          <div class="details-container">
            <h2 v-if="this.isInitiative">Initiative Details</h2>
            <div class="p-d-flex">
              <div class="p-field p-mr-2">
                <label for="name">Topic</label>
                <InputText
                  id="name"
                  type="text"
                  v-model="localTactic.title"
                  :placeholder="
                    this.isInitiative ? 'New Initiative' : 'New Tactic'
                  "
                  @input="nonConditionalChange"
                  autocomplete="off"
                  :class="{'p-invalid': this.invalidFields.includes('title')}"
                  :disabled="!canUserEditFields"
                />
              </div>
              <template>
                <div class="p-field p-mr-2">
                  <label for="channel">Channel</label>
                  <Dropdown
                    inputId="channel"
                    v-model="selectedChannel"
                    :options="channelOptions"
                    optionLabel="name"
                    placeholder="Select channel"
                    data-key="key"
                    @change="
                      () => {
                        onChannelInputChange()
                        nonConditionalChange()
                      }
                    "
                    :class="{
                      'p-invalid': this.invalidFields.includes('channel'),
                    }"
                  />
                </div>
              </template>
              <div class="p-field p-mr-2">
                <label for="type">Type</label>
                <Dropdown
                  inputId="type"
                  v-model="selectedType"
                  :options="typeOptions"
                  optionLabel="name"
                  placeholder="Select Type"
                  data-key="key"
                  @change="
                    () => {
                      onTypeInputChange()
                      nonConditionalChange()
                    }
                  "
                  :class="{'p-invalid': this.invalidFields.includes('type')}"
                  :disabled="!canUserEditFields || (selectedChannel && !selectedChannel.name)"
                />
              </div>
              <template
                v-if="
                  !isInitiative && selectedType.id && platformOptions.length
                "
              >
                <div class="p-field p-mr-2">
                  <label for="platform">Platform</label>
                  <MultiSelect
                    v-if="this.selectedType.shouldTacticsAllowMultiplePlatforms"
                    inputId="platform"
                    v-model="selectedPlatforms"
                    :options="platformOptions"
                    optionLabel="name"
                    placeholder="No Platform"
                    data-key="key"
                    :showClear="this.selectedPlatforms.length ? true : false"
                    @change="
                      () => {
                        onPlatformInputChange()
                        nonConditionalChange()
                      }
                    "
                    :disabled="!canUserEditFields"
                  />
                  <Dropdown
                    v-else
                    inputId="platform"
                    v-model="selectedPlatformSingle"
                    :options="platformOptions"
                    optionLabel="name"
                    placeholder="No Platform"
                    data-key="key"
                    :showClear="this.selectedPlatforms.length ? true : false"
                    @change="
                      () => {
                        onPlatformInputChange()
                        nonConditionalChange()
                      }
                    "
                    :disabled="!canUserEditFields"
                  />
                </div>
              </template>
            </div>
            <div
              v-if="
                selectedType &&
                selectedType.tacticFields &&
                selectedType.tacticFields.length
              "
              class="
                custom-properties-container
                p-d-flex p-flex-wrap p-ai-start
              "
            >
              <template v-for="field of selectedType.tacticFields">
                <div :key="field.id.intID" class="p-field p-mr-2">
                  <label :for="'custom_field_' + field.id.intID">{{
                    field.name
                  }}</label>
                  <div v-if="isFieldType(field, 'image')">
                    <div
                      v-if="getFieldValueForFieldId(field.id).value"
                      class="custom-field-image-controls"
                    >
                      <div class="custom-field-image-controls-container">
                        <Button
                          label=""
                          class="p-button-lg p-button-outlined"
                          icon="pi pi-times-circle"
                          @click="removeCustomFieldImage(field.id)"
                        />
                        <Button
                          label=""
                          class="p-button-lg p-button-outlined"
                          icon="pi pi-search-plus"
                          @click="
                            () => {
                              showCustomFieldImageDialog = true
                              customFieldDialogImage = getCustomImageFieldUrl(
                                field.id
                              )
                            }
                          "
                        />
                      </div>
                      <img
                        class="custom-field-image"
                        :src="getCustomImageFieldUrl(field.id)"
                      />
                    </div>
                    <FileUpload
                      :name="'customFieldImage' + field.id.intID"
                      :customUpload="true"
                      :maxFileSize="10000000"
                      :fileLimit="1"
                      mode="basic"
                      chooseLabel="Upload Image"
                      :auto="true"
                      accept="image/*"
                      @uploader="
                        (fileData) => uploadCustomFieldImage(field.id, fileData)
                      "
                      v-else
                    >
                      <template #empty>
                        <p>Drag and drop an image here to upload.</p>
                      </template>
                    </FileUpload>
                  </div>
                  <div v-else>
                    <div
                      class="p-d-flex p-ai-center"
                      v-if="isFieldType(field, 'url')"
                    >
                      <InputText
                        :inputId="'custom_field_' + field.id.intID"
                        type="text"
                        v-model="getFieldValueForFieldId(field.id).value"
                        @input="(val) => conditionalChange(field, val)"
                        autocomplete="off"
                        :disabled="!canUserEditFields"
                        v-if="
                          editModeFieldIds.includes(field.id) ||
                          getFieldValueForFieldId(field.id).value == ''
                        "
                      />
                      <a
                        class="edit-link"
                        v-else
                        :href="
                          editModeFieldIds.includes(field.id) &&
                          getFieldValueForFieldId(field.id).value.indexOf(
                            '://'
                          ) > -1
                            ? getFieldValueForFieldId(field.id).value
                            : `${getFieldValueForFieldId(field.id).value}`
                        "
                        target="_blank"
                        >{{ getFieldValueForFieldId(field.id).value }}</a
                      >
                      <i
                        class="pi pi-check p-ml-2"
                        style="font-size: 1.5rem,font-weight:bold"
                        @click="updateEditModeFieldIds(field.id)"
                        :disabled="!getFieldValueForFieldId(field.id).value"
                        v-if="
                          getFieldValueForFieldId(field.id).value == '' ||
                          editModeFieldIds.includes(field.id)
                        "
                      />

                      <i
                        class="pi pi-pencil p-ml-2"
                        style="font-size: 1.5rem"
                        v-else
                        @click="updateEditModeFieldIds(field.id)"
                      ></i>
                    </div>
                    <div class="p-d-flex p-ai-center" v-else>
                      <InputText
                        :inputId="'custom_field_' + field.id.intID"
                        type="text"
                        v-model="getFieldValueForFieldId(field.id).value"
                        @input="(val) => conditionalChange(field, val)"
                        autocomplete="off"
                        :disabled="!canUserEditFields"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div
              v-if="
                !isInitiative &&
                !isMonthlyFocus &&
                selectedChannel.enableTacticFlagging
              "
            >
              <Checkbox
                id="isFlagged"
                v-model="localTactic.isFlagged"
                :binary="true"
                class="p-mr-2"
                @change="
                  () => {
                    onInputChange()
                    nonConditionalChange()
                  }
                "
                :disabled="!canUserEditFields"
              />
              <label for="isFlagged">Flagged Tactic: Show On Flow View</label>
            </div>
          </div>

          <div class="time-frame-container">
            <div class="p-d-flex p-ai-center" v-if="isMonthlyFocus">
              <div class="p-field p-mr-2">
                <label for="start">Month</label>
                <Calendar
                  id="start"
                  v-model="localTactic.startDate"
                  view="month"
                  dateFormat="mm/yy"
                  :yearNavigator="true"
                  :manualInput="false"
                  :yearRange="$store.getters.datePickerYearRange"
                  :showTime="false"
                  appendTo="body"
                  @date-select="
                    () => {
                      onMonthlyFocusDateSelect()
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                />
              </div>
            </div>
            <div class="p-d-flex p-ai-center" v-else>
              <div class="p-field p-mr-2">
                <label for="start">Start Date</label>
                <Calendar
                  id="start"
                  v-model="localTactic.startDate"
                  :manualInput="false"
                  :monthNavigator="true"
                  :yearNavigator="true"
                  :yearRange="$store.getters.datePickerYearRange"
                  :showTime="shouldShowTimeInput"
                  hourFormat="12"
                  dateFormat="m/d/yy"
                  appendTo="body"
                  @date-select="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                      clearRepeat()
                    }
                  "
                  :disabled="!canUserEditFields"
                >
                  <template #footer v-if="shouldShowTimeInput">
                    <TimePicker
                      :date="currentTactic.startDate"
                      :setDate="updateCurrentTacticStartDate"
                    />
                  </template>
                </Calendar>
              </div>
              <div v-if="shouldShowEndDateInput" class="p-field p-mr-2">
                <label for="end">End Date</label>
                <Calendar
                  id="end"
                  v-model="localTactic.endDate"
                  :manualInput="false"
                  :monthNavigator="true"
                  :yearNavigator="true"
                  :yearRange="$store.getters.datePickerYearRange"
                  :showTime="shouldShowTimeInput"
                  hourFormat="12"
                  dateFormat="m/d/yy"
                  appendTo="body"
                  @date-select="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                >
                  <template #footer v-if="shouldShowTimeInput">
                    <TimePicker
                      :date="currentTactic.endDate"
                      :setDate="updateCurrentTacticEndDate"
                    />
                  </template>
                </Calendar>
              </div>
              <div class="p-ml-4 p-mr-4">
                <Checkbox
                  id="hasEndDate"
                  class="p-mr-2"
                  v-model="shouldShowEndDateInput"
                  :binary="true"
                  @change="
                    () => {
                      onMultiDayChange()
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                />
                <label for="hasEndDate">Show Duration</label>
              </div>
              <div>
                <Checkbox
                  id="isAllDay"
                  class="p-mr-2"
                  v-model="localTactic.isAllDay"
                  :binary="true"
                  @change="
                    () => {
                      shouldShowTimeInput = !localTactic.isAllDay
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                />
                <label for="isAllDay">All-Day</label>
              </div>
            </div>
          </div>
          <div class="p-d-flex p-ai-center">
            <div class="p-mr-4" v-if="(this.selectedType && !this.selectedType.name) || (this.selectedType && this.selectedType.name && this.selectedType.name.toLowerCase() !== this.$store.getters.monthlyFocusTypeName)">
              <Checkbox
                id="tacticRepeats"
                class="p-mr-2"
                v-model="localTactic.repeats"
                :binary="true"
                @change="
                  () => {
                    onInputChange()
                    nonConditionalChange()
                  }
                "
              />
           
              <label for="tacticRepeats" >Repeats</label> 
            </div>
            <div
              v-if="localTactic.repeats && !localTactic.isCustomRecurrence"
              class="p-field p-mr-2"
            >
              <label for="repeat-on">When:</label>
              <Dropdown
                id="repeat-on"
                :options="repeatOptions"
                :class="{'p-invalid': this.invalidFields.includes('rrule')}"
                v-model="localTactic.rrule"
                optionLabel="label"
                optionValue="value"
                placeholder="Repeats on..."
                :showClear="localTactic.rrule != ''"
                @change="
                  (e) => {
                    onRepeatRuleInputChange(e)
                    onInputChange()
                    nonConditionalChange()
                  }
                "
              />
            </div>
            <div
              v-if="localTactic.repeats && localTactic.isCustomRecurrence"
              class="p-mr-3"
              :class="{
                'p-invalid': this.invalidFields.includes('customRepeat'),
              }"
            >
              <strong>Custom:</strong>
              {{ this.customRecurrence.recurrenceText }}
              <a
                href=""
                class="p-ml-2 underline"
                @click="handleEditCustomRuleClick"
                >Edit</a
              >
              |
              <a
                href=""
                class="p-ml-2 underline"
                @click="handleRemoveCustomRuleClick"
                >Remove</a
              >
            </div>
            <div v-if="localTactic.repeats" class="p-field p-mr-2">
              <label for="repeatStop">Stop repeating on:</label>
              <Calendar
                id="repeatStop"
                v-model="localTactic.recurrenceEndDate"
                :manualInput="false"
                :monthNavigator="true"
                :yearNavigator="true"
                :yearRange="$store.getters.datePickerYearRange"
                :showTime="false"
                hourFormat="12"
                dateFormat="m/d/yy"
                placeholder="Never"
                @date-select="
                  () => {
                    onInputChange()
                    nonConditionalChange()
                  }
                "
              />
            </div>
          </div>
        </div>

        <div>
          <div class="plan-elements-container">
            <hr class="p-my-4" />
            <div class="p-d-flex p-jc-between p-ai-start">
              <h2>Strategic Priorities</h2>
              <Button
                label="Add Strategic Priority"
                icon="pi pi-plus-circle"
                @click="shouldShowTagList = true"
                v-if="canUserEditFields"
              />
            </div>
            <div
              class="p-d-flex"
              v-if="
                !currentObjectiveTags.length &&
                !currentTargetSegmentTags.length &&
                !currentJourneyPhaseTags.length &&
                !currentCustomTags.length
              "
            >
              <h4></h4>
            </div>
            <div
              v-else
              class="p-d-flex p-jc-between p-ai-start"
              style="width: 80%; min-width: 60rem"
            >
              <div class="tag-list-column p-mr-4">
                <h3>Objective</h3>
                <div class="p-d-flex p-flex-column p-ai-start">
                  <template v-for="tag of currentObjectiveTags">
                    <div
                      :key="tag.id.intID"
                      class="p-d-flex p-ai-center p-mr-2 p-mb-2 tag-chip"
                    >
                      <div
                        class="p-mr-2"
                        :class="{
                          'is-nested': tag.isNested,
                          'is-lead': tag.isLead,
                        }"
                      >
                        <template v-if="isLeadPlan && tag.isNested">
                          {{ tag.abbreviatedPlanName }} > {{ tag.title }}
                        </template>
                        <template v-else>
                          {{ tag.title }}
                        </template>
                      </div>
                      <Button
                        icon="pi pi-times-circle"
                        class="p-button-text"
                        @click="handleRemoveTag(tag.id)"
                        :disabled="!canUserEditFields"
                      />
                    </div>
                  </template>
                </div>
              </div>
              <div class="tag-list-column p-mr-4">
                <h3>Target Segment</h3>
                <div class="p-d-flex p-flex-column p-ai-start">
                  <template v-for="tag of currentTargetSegmentTags">
                    <div
                      :key="tag.id.intID"
                      class="p-d-flex p-ai-center p-mr-2 p-mb-2 tag-chip"
                    >
                      <div
                        class="p-mr-2"
                        :class="{
                          'is-nested': tag.isNested,
                          'is-lead': tag.isLead,
                        }"
                      >
                        <template v-if="isLeadPlan && tag.isNested">
                          {{ tag.abbreviatedPlanName }} > {{ tag.title }}
                        </template>
                        <template v-else>
                          {{ tag.title }}
                        </template>
                      </div>
                      <Button
                        icon="pi pi-times-circle"
                        class="p-button-text"
                        @click="handleRemoveTag(tag.id)"
                        :disabled="!canUserEditFields"
                      />
                    </div>
                  </template>
                </div>
              </div>
              <div class="tag-list-column p-mr-4">
                <h3>Journey Phase</h3>
                <div class="p-d-flex p-flex-column p-ai-start">
                  <template v-for="tag of currentJourneyPhaseTags">
                    <div
                      :key="tag.id.intID"
                      class="p-d-flex p-ai-center p-mr-2 p-mb-2 tag-chip"
                    >
                      <div
                        class="p-mr-2"
                        :class="{
                          'is-nested': tag.isNested,
                          'is-lead': tag.isLead,
                        }"
                      >
                        <template v-if="isLeadPlan && tag.isNested">
                          {{ tag.abbreviatedPlanName }} > {{ tag.title }}
                        </template>
                        <template v-else>
                          {{ tag.title }}
                        </template>
                      </div>
                      <Button
                        icon="pi pi-times-circle"
                        class="p-button-text"
                        @click="handleRemoveTag(tag.id)"
                        :disabled="!canUserEditFields"
                      />
                    </div>
                  </template>
                </div>
              </div>
              <div class="tag-list-column p-mr-4">
                <h3>Custom Tag</h3>
                <div class="p-d-flex p-flex-column p-ai-start">
                  <template v-for="tag of currentCustomTags">
                    <div
                      :key="tag.id.intID"
                      class="p-d-flex p-ai-center p-mr-2 p-mb-2 tag-chip"
                    >
                      <div
                        class="p-mr-2"
                        :class="{
                          'is-nested': tag.isNested,
                          'is-lead': tag.isLead,
                        }"
                      >
                        <template v-if="isLeadPlan && tag.isNested">
                          {{ tag.abbreviatedPlanName }} > {{ tag.title }}
                        </template>
                        <template v-else>
                          {{ tag.title }}
                        </template>
                      </div>
                      <Button
                        icon="pi pi-times-circle"
                        class="p-button-text"
                        @click="handleRemoveTag(tag.id)"
                        :disabled="!canUserEditFields"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <template
            v-if="
              !isInitiative &&
              (initiativeCampaignOptions.length ||
                initiativePromotionOptions.length ||
                initiativeKeyDateOptions.length)
            "
          >
            <div class="related-initiatives-container">
              <hr class="p-my-4" />
              <h2>Initiatives</h2>
              <div class="p-d-flex">
                <div class="p-mr-2" v-if="initiativeCampaignOptions.length">
                  <Dropdown
                    v-model="localTactic.campaignId"
                    :options="initiativeCampaignOptions"
                    optionLabel="title"
                    optionValue="id"
                    placeholder="Select Campaign"
                    :showClear="localTactic.campaignId.intID != 0"
                    @change="
                      () => {
                        onInputChange()
                        nonConditionalChange()
                      }
                    "
                    :disabled="!canUserEditFields"
                  >
                    <template #value="slotProps">
                      <div
                        class="initiative-item"
                        v-if="localTactic.campaignId.intID !== 0"
                        :class="{
                          'is-nested': getInitiativeForId(slotProps.value)
                            .isNested,
                          'is-lead': getInitiativeForId(slotProps.value).isLead,
                        }"
                      >
                        <template
                          v-if="
                            isLeadPlan &&
                            getInitiativeForId(slotProps.value).isNested
                          "
                        >
                          {{
                            getInitiativeForId(slotProps.value)
                              .abbreviatedPlanName
                          }}
                          > {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                        <template v-else>
                          {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                      </div>
                      <div v-else>
                        {{ slotProps.placeholder }}
                      </div>
                    </template>
                    <template #option="slotProps">
                      <div
                        class="initiative-item"
                        :class="{
                          'is-nested': slotProps.option.isNested,
                          'is-lead': slotProps.option.isLead,
                        }"
                      >
                        <div v-if="isLeadPlan && slotProps.option.isNested">
                          {{ slotProps.option.abbreviatedPlanName }} >
                          {{ slotProps.option.title }}
                        </div>
                        <div v-else>
                          {{ slotProps.option.title }}
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
                <div class="p-mr-2" v-if="initiativePromotionOptions.length">
                  <Dropdown
                    v-model="localTactic.promotionId"
                    :options="initiativePromotionOptions"
                    optionLabel="title"
                    optionValue="id"
                    placeholder="Select Promotion"
                    :showClear="localTactic.promotionId.intID != 0"
                    @change="
                      () => {
                        onInputChange()
                        nonConditionalChange()
                      }
                    "
                    :disabled="!canUserEditFields"
                  >
                    <template #value="slotProps">
                      <div
                        class="initiative-item"
                        v-if="localTactic.promotionId.intID !== 0"
                        :class="{
                          'is-nested': getInitiativeForId(slotProps.value)
                            .isNested,
                          'is-lead': getInitiativeForId(slotProps.value).isLead,
                        }"
                      >
                        <template
                          v-if="
                            isLeadPlan &&
                            getInitiativeForId(slotProps.value).isNested
                          "
                        >
                          {{
                            getInitiativeForId(slotProps.value)
                              .abbreviatedPlanName
                          }}
                          > {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                        <template v-else>
                          {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                      </div>
                      <div v-else>
                        {{ slotProps.placeholder }}
                      </div>
                    </template>
                    <template #option="slotProps">
                      <div
                        class="initiative-item"
                        :class="{
                          'is-nested': slotProps.option.isNested,
                          'is-lead': slotProps.option.isLead,
                        }"
                      >
                        <div v-if="isLeadPlan && slotProps.option.isNested">
                          {{ slotProps.option.abbreviatedPlanName }} >
                          {{ slotProps.option.title }}
                        </div>
                        <div v-else>
                          {{ slotProps.option.title }}
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
                <div class="p-mr-2" v-if="initiativeKeyDateOptions.length">
                  <Dropdown
                    v-model="localTactic.keyDateId"
                    :options="initiativeKeyDateOptions"
                    optionLabel="title"
                    optionValue="id"
                    placeholder="Select Key Date"
                    :showClear="localTactic.keyDateId.intID != 0"
                    @change="
                      () => {
                        onInputChange()
                        nonConditionalChange()
                      }
                    "
                    :disabled="!canUserEditFields"
                  >
                    <template #value="slotProps">
                      <div
                        class="initiative-item"
                        v-if="localTactic.keyDateId.intID !== 0"
                        :class="{
                          'is-nested': getInitiativeForId(slotProps.value)
                            .isNested,
                          'is-lead': getInitiativeForId(slotProps.value).isLead,
                        }"
                      >
                        <template
                          v-if="
                            isLeadPlan &&
                            getInitiativeForId(slotProps.value).isNested
                          "
                        >
                          {{
                            getInitiativeForId(slotProps.value)
                              .abbreviatedPlanName
                          }}
                          > {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                        <template v-else>
                          {{ getInitiativeForId(slotProps.value).title }}
                        </template>
                      </div>
                      <div v-else>
                        {{ slotProps.placeholder }}
                      </div>
                    </template>
                    <template #option="slotProps">
                      <div
                        class="initiative-item"
                        :class="{
                          'is-nested': slotProps.option.isNested,
                          'is-lead': slotProps.option.isLead,
                        }"
                      >
                        <div v-if="isLeadPlan && slotProps.option.isNested">
                          {{ slotProps.option.abbreviatedPlanName }} >
                          {{ slotProps.option.title }}
                        </div>
                        <div v-else>
                          {{ slotProps.option.title }}
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
              </div>
            </div>
          </template>

          <div
            class="budget-fields-container"
            v-if="
              !isInitiative && !isMonthlyFocus && currentPlan.isBudgetEnabled
            "
          >
            <hr class="p-my-4" />
            <h2>Budget</h2>
            <div class="p-d-flex">
              <div class="p-field p-mr-2">
                <label for="estimatedCost">Estimated Cost</label>
                <InputCurrency
                  id="estimatedCost"
                  :value.sync="localTactic.estimatedCost"
                  @focus="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  @blur="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                />
              </div>

              <div class="p-field p-mr-2">
                <label for="actualCost">Actual Cost</label>
                <InputCurrency
                  id="actualCost"
                  :value.sync="localTactic.actualCost"
                  @focus="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  @blur="
                    () => {
                      onInputChange()
                      nonConditionalChange()
                    }
                  "
                  :disabled="!canUserEditFields"
                />
              </div>
            </div>
          </div>

          <!-- Media section hidden for MVP -->
          <!-- <div class="media-fields-container" v-if="!isInitiative">
          <hr class="p-my-4" />
          <h2>MEDIA</h2>
          <div class="p-d-flex">
            <div class="p-field p-mr-2">
              <label for="impressions">Impressions</label>
              <InputNumber
                id="impressions"
                v-model="localTactic.impressions"
                @input="onInputChange"
                autocomplete="off"
              />
            </div>

            <div class="p-field p-mr-2">
              <label for="ratingPoints">Rating Points</label>
              <InputNumber
                id="ratingPoints"
                v-model="localTactic.ratingPoints"
                @input="onInputChange"
                autocomplete="off"
              />
            </div>
          </div>
        </div> -->
        </div>

        <Dialog
          header="Strategic Priorities"
          :visible.sync="shouldShowTagList"
          :modal="true"
        >
          <TagList
            :selectedTags="localTactic.tags"
            :allowSelect="true"
            :allowEdit="false"
            :allowCreate="false"
            :allowList="true"
            @updateSelection="onTagListUpdate"
          />
        </Dialog>
        <Dialog
          :dismissableMask="true"
          header=""
          :visible.sync="showCustomFieldImageDialog"
          :modal="true"
          @hide="() => (customFieldDialogImage = '')"
        >
          <div class="custom-image-dialog">
            <Button
              label="Download"
              class="p-button-lg p-button-outlined"
              icon="pi pi-download"
              @click="openInNewWindow(customFieldDialogImage)"
            />
            <img :src="customFieldDialogImage" />
          </div>
        </Dialog>
        <Dialog
          :dismissableMask="true"
          header="Custom Recurrence"
          :visible.sync="showCustomRecurrenceDialog"
          :modal="true"
          @hide="handleCustomRecurrenceModalClose"
        >
          <div class="custom-recurrence-dialog-body">
            <div class="p-d-flex p-ai-center p-mt-5 p-mb-5">
              <div class="p-field p-mr-2">Repeat every</div>
              <div class="p-field p-mr-2">
                <InputNumber
                  v-model="customRecurrence.interval"
                  class="custom-recurrence-number-input"
                />
              </div>
              <div class="p-field p-mr-2">
                <Dropdown
                  v-model="customRecurrence.freq"
                  :options="customRecurrenceFields.freq"
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
            </div>
            <div v-if="customRecurrence.freq === 'WEEKLY'">
              <h3>Repeat on</h3>
              <div
                v-for="day in customRecurrenceFields.byweekday"
                :key="day.value"
                class="p-field-radiobutton"
              >
                <RadioButton
                  :id="day.value"
                  name="customRecurrence.byweekday"
                  :value="day.value"
                  v-model="customRecurrence.byweekday"
                />
                <label :for="day.value">{{ day.label }}</label>
              </div>
            </div>
            <div v-if="customRecurrence.freq === 'MONTHLY'" class="p-field">
              <label for="custom-monthly-value">On:</label>
              <Dropdown
                id="custom-monthly-value"
                :options="customRecurrenceMonthlyOptions"
                v-model="customRecurrence.monthlyRule"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            <div class="p-mt-5 p-mb-auto">
              <Button
                @click="
                  () => {
                    onCustomRecurrenceSubmit()
                    nonConditionalChange()
                  }
                "
                label="Save Custom Rule"
                :disabled="!isCustomRecurrenceValid"
              />
            </div>
          </div>
        </Dialog>
      </ViewMain>
    </div>
  </BlockUI>
</template>

<script lang="ts">
import {format, isSameDay} from 'date-fns'
import axios from 'axios'
import Vue from 'vue'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import TagList from '@/app-shared/views/TagList.vue'
import Tactic from '@/app-shared/models/Tactic'
import Plan from '@/app-shared/models/Plan'
import Channel from '@/app-shared/models/Channel'
import CustomRecurrence, {
  RecurrenceFrequency,
  RecurrenceByweekday,
} from '@/app-shared/models/CustomRecurrence'
import TacticPlatform from '@/app-shared/models/TacticPlatform'
import TacticType from '@/app-shared/models/TacticType'
import {TacticFieldType} from '@/app-shared/models/TacticField'
import TacticFieldValue from '@/app-shared/models/TacticFieldValue'
import ID from '@/app-shared/models/ID'
import Tag, {TagType} from '@/app-shared/models/Tag'
import AlertMessage, {
  AlertMessageSeverity,
} from '@/app-shared/models/AlertMessage'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import InputCurrency from '@/app-shared/components/InputCurrency.vue'
import TimePicker from '@/app-shared/components/TimePicker.vue'
import RRule, {rrulestr} from 'rrule'
import BlockUI from 'primevue/blockui'
import FileUpload from 'primevue/fileupload'
import Role from '../models/Role'

Vue.component('Checkbox', Checkbox)
Vue.component('Dropdown', Dropdown)
Vue.component('MultiSelect', MultiSelect)
Vue.component('Dialog', Dialog)
Vue.component('InputNumber', InputNumber)
Vue.component('Button', Button)
Vue.component('BlockUI', BlockUI)
Vue.component('FileUpload', FileUpload)
Vue.component('TimePicker', TimePicker)
Vue.component('RadioButton', RadioButton)

export default Vue.extend({
  name: 'TacticDetail',
  components: {
    ViewHeader,
    ViewMain,
    TagList,
    InputCurrency,
  },

  data: () => {
    return {
      selectedChannel: {} as Channel,
      selectedType: {} as TacticType,
      selectedPlatforms: [] as TacticPlatform[],
      nonReactive: {} as any,
      shouldShowTagList: false as boolean,
      currentSelectInitiativeTypeName: '' as string,
      currentSelectInitiativeId: {} as ID,
      currentSelectInitiativeTitle: '' as string,
      shouldShowTimeInput: true as boolean,
      shouldShowEndDateInput: false as boolean,
      tagUpdateItterator: 0 as number,
      initialStartDate: '' as string,
      initialEndDate: '' as string,
      initialTacticName: '' as string,
      initialChannel: '' as string,
      initialEstimatedCost: 0 as number,
      initialActualCost: 0 as number,
      initialType: '' as string,
      initialPlatform: '' as string,
      initialCampaignId: '' as string,
      initialPromotionId: '' as string,
      initialKeyDateId: '' as string,
      initialFieldValues: {} as {},
      updatedFieldValues: {} as {},
      initialTags: {} as {},
      saveButtonDisabled: true as boolean,
      invalidFields: [] as string[],
      customRecurrence: {
        freq: RecurrenceFrequency['WEEKLY'],
        interval: 1,
        byweekday: RecurrenceByweekday['MO'],
        monthlyRule: '',
        recurrenceText: '',
      } as CustomRecurrence,
      customRecurrenceFields: {
        byweekday: [
          {
            value: RecurrenceByweekday['SU'],
            label: 'Sunday',
          },
          {
            value: RecurrenceByweekday['MO'],
            label: 'Monday',
          },
          {
            value: RecurrenceByweekday['TU'],
            label: 'Tuesday',
          },
          {
            value: RecurrenceByweekday['WE'],
            label: 'Wednesday',
          },
          {
            value: RecurrenceByweekday['TH'],
            label: 'Thursday',
          },
          {
            value: RecurrenceByweekday['FR'],
            label: 'Friday',
          },
          {
            value: RecurrenceByweekday['SA'],
            label: 'Saturday',
          },
        ],
        freq: [
          {
            value: RecurrenceFrequency['DAILY'],
            label: 'Days',
          },
          {
            value: RecurrenceFrequency['WEEKLY'],
            label: 'Weeks',
          },
          {
            value: RecurrenceFrequency['MONTHLY'],
            label: 'Months',
          },
          {
            value: RecurrenceFrequency['YEARLY'],
            label: 'Years',
          },
        ],
      },
      showCustomRecurrenceDialog: false as boolean,
      isCustomRecurrence: false as boolean,
      isUIBlocked: false as boolean,
      showCustomFieldImageDialog: false as boolean,
      customFieldDialogImage: '' as string,
      localTactic: {} as Tactic,
      editModeFieldIds: [] as number[],
      customImageFieldUrlsMap: [] as {
        fieldId: number | string;
        url: string;
      }[],
    }
  },
  computed: {
    viewTitle(): string {
      const tacticType = this.isInitiative ? 'Initiative' : 'Tactic'
      const tacticTitle = this.localTactic ? this.localTactic.title : ''
      return this.isCreateTactic ? 'New ' + tacticType : tacticTitle
    },

    isCreateTactic(): boolean {
      return this.$store.getters.currentTacticIntID == 0 ? true : false
    },
    isInitiative(): boolean {
      return this.$route.name == 'InitiativeDetail' ||
        this.$route.name == 'PlanInitiativeDetail' ||
        this.$route.name == 'AccountInitiativeDetail'
        ? true
        : false
    },
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    currentTactic(): Tactic {
      return this.localTactic
    },
    currentObjectiveTags(): Tag[] {
      this.tagUpdateItterator
      return this.$store.getters.currentTags.filter((tag) => {
        if (
          this.localTactic.tags.find(
            (localTag) => localTag.id.intID === tag.id.intID
          ) &&
          tag.type == TagType.Objective
        ) {
          return true
        }
        return false
      })
    },
    currentTargetSegmentTags(): Tag[] {
      this.tagUpdateItterator
      return this.$store.getters.currentTags.filter((tag) => {
        if (
          this.localTactic.tags.find(
            (localTag) => localTag.id.intID === tag.id.intID
          ) &&
          tag.type == TagType.TargetSegment
        ) {
          return true
        }
        return false
      })
    },
    currentJourneyPhaseTags(): Tag[] {
      this.tagUpdateItterator
      return this.$store.getters.currentTags.filter((tag) => {
        if (
          this.localTactic.tags.find(
            (localTag) => localTag.id.intID === tag.id.intID
          ) &&
          tag.type == TagType.JourneyPhase
        ) {
          return true
        }
        return false
      })
    },
    currentCustomTags(): Tag[] {
      this.tagUpdateItterator
      return this.$store.getters.currentTags.filter((tag) => {
        if (
          this.localTactic.tags.find(
            (localTag) => localTag.id.intID === tag.id.intID
          ) &&
          tag.type == TagType.Custom
        ) {
          return true
        }
        return false
      })
    },
    currentStartDate: {
      get: function () {
        return this.localTactic.startDate
      },
      set: function (newValue: Date) {
        this.localTactic.startDate = newValue
      },
    },
    channelOptions(): Channel[] {
      return this.$store.getters.currentChannels
        .filter(
          (channel) => (this.isLeadPlan && channel.isLead) || !this.isLeadPlan
        )
        .sort((a, b) => {
          if (a.isLead && !b.isLead) {
            return -1
          }
          if (!a.isLead && b.isLead) {
            return 1
          }
          return 0
        })
    },
    platformOptions(): TacticPlatform[] {
      if (!this.selectedType.id) {
        return []
      }
      return this.selectedType.tacticPlatforms.filter(
        (platform) => !platform.isNested
      )
    },
    typeOptions(): TacticType[] {
      if (!this.selectedChannel.id) {
        return []
      }
      return this.selectedChannel.tacticTypes
    },
    initiativeCampaignOptions(): Tactic[] {
      return this.$store.getters.currentInitiatives.filter(
        (initiative) =>
          initiative.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.campaign
      )
    },
    initiativePromotionOptions(): Tactic[] {
      return this.$store.getters.currentInitiatives.filter(
        (initiative) =>
          initiative.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.promotion
      )
    },
    initiativeKeyDateOptions(): Tactic[] {
      return this.$store.getters.currentInitiatives.filter(
        (initiative) =>
          initiative.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.keyDate
      )
    },
    customRecurrenceMonthlyOptions(): object[] {
      const startDate = new Date(this.localTactic.startDate)
      const year = startDate.getFullYear()
      const month =
        startDate.getMonth() > 8
          ? startDate.getMonth() + 1
          : '0' + (startDate.getMonth() + 1)
      const date =
        startDate.getDate() > 9
          ? startDate.getDate()
          : '0' + startDate.getDate()
      const hours =
        startDate.getHours() > 9
          ? startDate.getHours()
          : '0' + startDate.getHours()
      const minutes =
        startDate.getMinutes() > 9
          ? startDate.getMinutes()
          : '0' + startDate.getMinutes()
      const seconds =
        startDate.getSeconds() > 9
          ? startDate.getSeconds()
          : '0' + startDate.getSeconds()

      const dtStart = this.localTactic.startDate
        ? `DTSTART=${year}${month}${date}T${hours}${minutes}${seconds}\n`
        : ''
      return [
        {
          value: `BYMONTHDAY=${format(startDate, 'd')}`,
          label: `The ${format(startDate, 'do')}`,
        },
        {
          ...this.getMonthlyByDay(startDate, dtStart, true),
        },
      ]
    },
    repeatOptions(): object[] {
      const startDate = new Date(this.localTactic.startDate)
      const year = startDate.getFullYear()
      const month =
        startDate.getMonth() > 8
          ? startDate.getMonth() + 1
          : '0' + (startDate.getMonth() + 1)
      const date =
        startDate.getDate() > 9
          ? startDate.getDate()
          : '0' + startDate.getDate()
      const hours =
        startDate.getHours() > 9
          ? startDate.getHours()
          : '0' + startDate.getHours()
      const minutes =
        startDate.getMinutes() > 9
          ? startDate.getMinutes()
          : '0' + startDate.getMinutes()
      const seconds =
        startDate.getSeconds() > 9
          ? startDate.getSeconds()
          : '0' + startDate.getSeconds()

      const dtStart = this.localTactic.startDate
        ? `DTSTART=${year}${month}${date}T${hours}${minutes}${seconds}\n`
        : ''
      return [
        {
          value: `${dtStart}RRULE:FREQ=DAILY`,
          label: 'Daily',
        },
        {
          value: `${dtStart}RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=${format(
            startDate,
            'EEEEEE'
          ).toUpperCase()}`,
          label: `Weekly on ${format(startDate, 'EEEE')}`,
        },
        {
          value: `${dtStart}RRULE:FREQ=MONTHLY;BYMONTHDAY=${format(
            startDate,
            'd'
          )}`,
          label: `Monthly on the ${format(startDate, 'do')}`,
        },
        {
          ...this.getMonthlyByDay(startDate, dtStart),
        },
        {
          value: `${dtStart}RRULE:FREQ=YEARLY`,
          label: `Annually on ${format(startDate, 'MMM')} ${format(
            startDate,
            'd'
          )}`,
        },
        {
          value: 'custom',
          label: 'Custom',
        },
      ]
    },
    isCustomRecurrenceValid() {
      const {freq, monthlyRule, byweekday} = this.customRecurrence

      return (
        freq === RecurrenceFrequency['DAILY'] ||
        freq === RecurrenceFrequency['YEARLY'] ||
        (freq === RecurrenceFrequency['MONTHLY'] && !!monthlyRule) ||
        (freq === RecurrenceFrequency['WEEKLY'] && !!byweekday)
      )
    },
    isMonthlyFocus(): boolean {
      if (this.selectedType.name) {
        return (
          this.selectedType.name.toLowerCase() ==
          this.$store.getters.monthlyFocusTypeName
        )
      }
      return false
    },

    canUserEditChannel(): boolean {
      let hasChannelEditRights = true

      if (!this.selectedChannel.id) {
        // No channel selected
        return hasChannelEditRights
      }

      const currentUserRole = this.currentPlan.users.find(
        (userRole) =>
          userRole.user.id.intID === this.$store.getters.currentUser.id.intID
      )

      if (currentUserRole) {
        hasChannelEditRights = currentUserRole.channels.find(
          (channelId) => channelId.intID === this.selectedChannel.id.intID
        )
          ? true
          : false
      }
      // TODO: override channel edit rights to add tactics to any channel?
      if(this.currentTactic.id.intID === 0){
        hasChannelEditRights = true
      }
      if (this.isInitiative) {
        hasChannelEditRights = true
      }
      return hasChannelEditRights
    },
    canUserDeleteTactic(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
    canUserEditFields(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
    selectedPlatformSingle: {
      get(): TacticPlatform | null {
        return this.selectedPlatforms.length ? this.selectedPlatforms[0] : null
      },
      set(newValue: TacticPlatform){
        this.selectedPlatforms = [newValue]
      }
    }
  },
  watch: {
    selectedType() {
      if (this.isMonthlyFocus) {
        this.onMonthlyFocusDateSelect()
      }
    },
    localTactic: function () {
      if (this.localTactic.rrule && this.localTactic.isCustomRecurrence) {
        const rule = rrulestr(this.localTactic.rrule)
        this.customRecurrence = {
          ...this.customRecurrence,
          recurrenceText: rule.toText(),
        }
      }
    },
  },
  created() {
    //Display loading blocker until API calls return values
    this.isUIBlocked = true

    this.nonReactive.localFieldValues = [] as TacticFieldValue[]
    this.$store.commit(
      'setCurrentTacticIntID',
      Number(this.$route.params.tacticId)
    )

    this.localTactic = this.$store.getters.currentTactic

    this.setInitialConditionalValues()
    //Does plan from route need to be loaded?
    if (this.currentPlan.id.intID != Number(this.$route.params.planId)) {
      this.$store
        .dispatch(
          'updateCurrentPlanById',
          new ID(Number(this.$route.params.planId))
        )
        .then(() => {
          //Is this a new tactic?
          if (this.$store.getters.currentTacticIntID != 0) {
            this.$store
              .dispatch('refreshCurrentTactic')
              .then((tactic: Tactic) => {
                this.localTactic = tactic
                this.updateSelectedChannelTypePlatform()
                this.updateEndDateInputVisibility()
                this.updateCustomRecurrenceValues()
                this.updateLocalFieldValues()
              })
              .finally(() => {
                this.isUIBlocked = false
              })
          } else {
            if (
              this.$route.query.copyof &&
              this.$route.params.tacticId == '0'
            ) {
              this.copyTactic()
            }
          }
        })
    } else {
      //Is this a new tactic?
      if (this.$store.getters.currentTacticIntID !== 0) {
        this.$store
          .dispatch('refreshCurrentTactic')
          .then(
            (returnedTactic: Tactic) => {
              this.localTactic =
                this.updateTacticWithStashedLocalPropertyValues(
                  this.localTactic,
                  returnedTactic
                )
              this.updateSelectedChannelTypePlatform()
              this.updateEndDateInputVisibility()
              this.setInitialValues()
              this.nonConditionalChange()
              this.updateCustomRecurrenceValues()
              this.updateLocalFieldValues()
            },
            (error) => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.error,
                summary: 'Error refreshing tactic.',
                detail: error,
                life: 3000,
              })
            }
          )
          .finally(() => {
            this.isUIBlocked = false
          })
      } else {
        //Ensure new tactic properties are reset if creating new tactic after cancelling previously
        this.localTactic.title = ''
        this.localTactic.startDate = new Date()
        this.localTactic.endDate = new Date()
        this.isUIBlocked = false
        this.updateSelectedChannelTypePlatform()

        if (this.$route.query.copyof && this.$route.params.tacticId == '0') {
          this.copyTactic()
          this.saveButtonDisabled = false
        }
      }
    }
  },
  beforeRouteLeave: function (to, from, next) {
    this.$destroy()
    next()
  },
  beforeDestroy: function () {
    this.localTactic.tags = []
    this.selectedChannel = new Channel()
    this.selectedType = new TacticType()
    this.selectedPlatforms = []
    this.currentSelectInitiativeId = new ID()
    this.nonReactive = {}
  },
  methods: {
    setInitialValues() {
      this.initialTacticName = this.localTactic.title
      this.initialEstimatedCost = this.localTactic.estimatedCost
      this.initialActualCost = this.localTactic.actualCost
      this.initialStartDate = JSON.stringify(this.localTactic.startDate)
      this.initialEndDate = JSON.stringify(this.localTactic.endDate)
      this.initialChannel = JSON.stringify(this.selectedChannel)
      this.initialType = JSON.stringify(this.selectedType)
      this.initialPlatform = JSON.stringify(this.selectedPlatforms)
      this.initialCampaignId = JSON.stringify(this.localTactic.campaignId)
      this.initialPromotionId = JSON.stringify(this.localTactic.promotionId)
      this.initialKeyDateId = JSON.stringify(this.localTactic.keyDateId)
    },
    setInitialConditionalValues() {
      //storing the initial values to compare them later
      this.localTactic.typeValues.forEach((v) => {
        this.initialFieldValues[v.tacticFieldId.intID] = v.value
      })
      //storing the updated values === initial values to compare them at the first render
      this.localTactic.typeValues.forEach((v) => {
        this.updatedFieldValues[v.tacticFieldId.intID] = v.value
      })
      this.initialTags = [...this.localTactic.tags]
    },
    compareObjects(object1, object2) {
      const keys1 = Object.keys(object1)
      const keys2 = Object.keys(object2)

      if (keys1.length !== keys2.length) {
        this.saveButtonDisabled = false
        return false
      }

      for (const key of keys1) {
        if (object1[key] !== object2[key]) {
          this.saveButtonDisabled = false
          return false
        }
      }
      this.saveButtonDisabled = true
      return true
    },
    nonConditionalChange() {
      if (
        !this.selectedType ||
        !this.selectedType.id ||
        this.selectedType.id.intID === 0
      ) {
        this.saveButtonDisabled = true
      } else if (
        this.initialTacticName === this.localTactic.title &&
        this.initialEstimatedCost === this.localTactic.estimatedCost &&
        this.initialActualCost === this.localTactic.actualCost &&
        this.initialStartDate === JSON.stringify(this.localTactic.startDate) &&
        this.initialEndDate === JSON.stringify(this.localTactic.endDate) &&
        this.initialChannel === JSON.stringify(this.selectedChannel) &&
        this.initialType === JSON.stringify(this.selectedType) &&
        this.initialPlatform === JSON.stringify(this.selectedPlatforms) &&
        this.initialCampaignId ===
          JSON.stringify(this.localTactic.campaignId) &&
        this.initialPromotionId ===
          JSON.stringify(this.localTactic.promotionId) &&
        this.initialKeyDateId === JSON.stringify(this.localTactic.keyDateId) &&
        JSON.stringify(this.updatedFieldValues) ===
          JSON.stringify(this.initialFieldValues)
      ) {
        this.saveButtonDisabled = true
      } else {
        this.saveButtonDisabled = false
      }
    },
    conditionalChange(field, val) {
      this.selectedType.tacticFields.forEach(() => {
        this.updatedFieldValues[field.id.intID] = val
      })
      if (
        JSON.stringify(this.updatedFieldValues) ===
        JSON.stringify(this.initialFieldValues)
      ) {
        this.saveButtonDisabled = true
      } else {
        this.saveButtonDisabled = false
      }
    },

    showCancelConfirmation(event) {
      if (this.saveButtonDisabled) {
        this.handleCancel()
      } else {
        this.$confirm.require({
          acceptLabel: 'YES',
          rejectLabel: 'NO',
          target: event.currentTarget,
          message:
            'Are you sure you want to cancel? Your changes will be lost.',
          accept: () => {
            if (this.isCreateTactic) {
              this.currentTactic.tags = []
            }
            this.resetRecurrence()
            this.$router.back()
          },
          reject: () => {
            // Cancel rejected
          },
        })
      }
    },

    updateSelectedChannelTypePlatform() {
      if (this.isInitiative) {
        this.selectedChannel =
          this.currentPlan.channels.find(
            (channel) => channel.name == Channel.CHANNEL_NAME_INITIATIVES
          ) || new Channel()
        if (this.localTactic.tacticTypeId.intID != 0) {
          this.selectedType =
            this.selectedChannel.tacticTypes.find(
              (type) => type.id.intID == this.localTactic.tacticTypeId.intID
            ) || new TacticType()
        }
      } else {
        this.currentPlan.channels.forEach((channel) => {
          channel.tacticTypes.forEach((type) => {
            if (type.id.intID === this.localTactic.tacticTypeId.intID) {
              this.selectedChannel = channel
              this.selectedType = type
              if (
                this.localTactic.tacticPlatforms?.length
              ) {
                this.selectedPlatforms =
                  this.selectedType.tacticPlatforms.filter(
                    (platform) =>
                      this.localTactic.tacticPlatforms?.filter((platformOnTactic)=>platformOnTactic.id.intID === platform.id.intID).length
                  )
              }
            }
          })
        })
      }
    },
    updateEndDateInputVisibility() {
      this.shouldShowEndDateInput =
        this.localTactic.endDate.toString() !==
        this.localTactic.startDate.toString()
      this.shouldShowTimeInput = !this.localTactic.isAllDay
    },
    onChannelInputChange() {
      this.selectedType = new TacticType()
      this.selectedPlatforms = []
    },
    onTypeInputChange() {
      if (!this.isInitiative) {
        this.selectedPlatforms = []
        this.updateLocalFieldValues()
      }
    },
    onPlatformInputChange() {
      if (!this.selectedPlatforms) {
        this.selectedPlatforms = []
      }
    },
    onRepeatRuleInputChange(e) {
      if (this.localTactic.rrule === 'custom') {
        this.showCustomRecurrenceDialog = true
        this.localTactic.isCustomRecurrence = true
      }
    },
    handleCustomRecurrenceModalClose() {
      if (this.localTactic.rrule === 'custom') {
        this.resetRecurrence()
      }
    },
    onCustomRecurrenceSubmit() {
      this.nonConditionalChange()
      const {freq, interval, monthlyRule, byweekday} = this.customRecurrence
      let rule = `FREQ=${freq};INTERVAL=${interval}`
      if (freq === 'WEEKLY') {
        rule += `;BYWEEKDAY=${byweekday}`
      }

      if (freq === 'MONTHLY') {
        rule += `;${monthlyRule}`
      }

      const rrule = rrulestr(rule)
      this.localTactic.rrule = rrule.toString()
      this.customRecurrence.recurrenceText = rrule.toText()
      this.localTactic.isCustomRecurrence = true
      this.showCustomRecurrenceDialog = false
    },
    updateLocalFieldValues() {
      if (this.selectedType.tacticFields) {
        this.selectedType.tacticFields.forEach((field) => {
          let thisValue: TacticFieldValue = new TacticFieldValue(
            new ID(),
            new ID(field.id.intID, field.id.apiID)
          )

          this.localTactic.typeValues.find((value) => {
            if (value.tacticFieldId.intID == field.id.intID) {
              thisValue = value
            }
          })
          this.nonReactive.localFieldValues.push(thisValue)

          if (field.type == 'image' && !!thisValue.value) {
            this.$store.getters.services.tactics
              .getMediaAsset(thisValue.value)
              .then((response) => {
                this.customImageFieldUrlsMap =
                  this.customImageFieldUrlsMap.concat({
                    fieldId: field.id.intID,
                    url: response.fileLocation,
                  })
              })
          }
        })
      }
    },
    getFieldValueForFieldId(fieldId: ID): TacticFieldValue {
      let thisFieldValue = this.nonReactive.localFieldValues.find(
        (value) => value.tacticFieldId.intID == fieldId.intID
      )
      if (!thisFieldValue) {
        thisFieldValue = new TacticFieldValue()
        thisFieldValue.tacticFieldId = fieldId.clone()
        this.nonReactive.localFieldValues.push(thisFieldValue)
      }

      return thisFieldValue
    },
    persistFieldValue(fieldValue: TacticFieldValue): Promise<TacticFieldValue> {
      return new Promise((resolve, reject) => {
        if (fieldValue.id.intID == 0) {
          this.$store.getters.services.tactics
            .createTacticFieldValue(fieldValue)
            .then(
              (returnedFieldValue) => {
                resolve(returnedFieldValue)
              },
              (error) => {
                reject(error)
              }
            )
        } else {
          this.$store.getters.services.tactics
            .updateTacticFieldValue(fieldValue)
            .then(
              (returnedFieldValue) => {
                resolve(returnedFieldValue)
              },
              (error) => {
                reject(error)
              }
            )
        }
      })
    },
    areFieldsValid() {
      let isFormValid = true
      this.invalidFields = []
      if (this.localTactic.title == '') {
        isFormValid = false
        this.invalidFields.push('title')
      }
      if (!this.selectedChannel.id?.apiID) {
        isFormValid = false
        this.invalidFields.push('channel')
      }
      if (!this.selectedType.id?.apiID) {
        isFormValid = false
        this.invalidFields.push('type')
      }
      if (this.localTactic.repeats && !this.localTactic.rrule) {
        isFormValid = false
        this.invalidFields.push('rrule')
      }
      // rrule is temporarily set to 'custom' while the user sets the rrule in
      // the modal. this prevents them from opening the modal, closing it and
      // the rrule is left as 'custom' instead of an actual RRULE
      if (this.localTactic.repeats && this.localTactic.rrule === 'custom') {
        isFormValid = false
        this.invalidFields.push('customRepeat')
      }

      return isFormValid
    },
    updateTacticWithStashedLocalPropertyValues(
      tacticToStash: Tactic,
      tacticToUpdate
    ): Tactic {
      // Stash and re-applylead/nested values because the API only populates them when requesting plan
      const returnTactic = tacticToUpdate
      returnTactic.isLead = tacticToStash.isLead
      returnTactic.isNested = tacticToStash.isNested
      returnTactic.abbreviatedPlanName = tacticToStash.abbreviatedPlanName
      return returnTactic
    },
    async handleSaveTactic() {
      // Validate fields
      // if (!this.areFieldsValid()) {
      //   return false;
      // }

      //Create/update all field values
      let shouldAbortTacticSave = false
      const newFieldValues: TacticFieldValue[] = []
      for (let i = 0; i < this.nonReactive.localFieldValues.length; i += 1) {
        await this.persistFieldValue(this.nonReactive.localFieldValues[i]).then(
          (returnedFieldValue) => {
            newFieldValues.push(returnedFieldValue)
          },
          (error) => {
            //TODO: delete value objects in newFieldValues?
            shouldAbortTacticSave = true
          }
        )
      }
      this.localTactic.typeValues = newFieldValues
      if (shouldAbortTacticSave) {
        return
      }

      // only include rrule if repeats box is checked
      if (!this.localTactic.repeats) {
        this.localTactic.rrule = ''
      }

      //Create/update tactic
      this.localTactic.tacticTypeId = this.selectedType.id
      this.localTactic.tacticPlatforms = this.selectedPlatforms
      this.localTactic.planId = this.$store.getters.currentPlan.id
      if (this.isCreateTactic) {
        this.localTactic.creatorId = this.$store.getters.currentUser.id

        this.$store.getters.services.tactics
          .create(this.localTactic)
          .then((returnedTactic) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: this.isInitiative
                ? 'Initiative created.'
                : 'Tactic created.',
              life: 3000,
            })

            if (this.$store.getters.currentPlan.plans.length) {
              // If adding to a lead plan, sed isLEad to true on new tactic
              returnedTactic.isLead = true
            }
            this.$store.dispatch('addTacticToCurrentPlan', returnedTactic)
            if (this.isInitiative) {
              // TODO: refreshCurrentPlan is a temporary fix for initiatives not appearing in masthead after creation
              this.$store.dispatch('refreshCurrentPlan')
            }
            //Update date range to month of new tactic so it is visible when returning to core view
            this.$store.dispatch('updateCurrentDateRange', [
              new Date(
                returnedTactic.startDate.getFullYear(),
                returnedTactic.startDate.getMonth(),
                1
              ),
              new Date(
                returnedTactic.startDate.getFullYear(),
                returnedTactic.startDate.getMonth() + 1,
                0
              ),
            ])
            this.$router.back()
          })
      } else {
        this.$store.getters.services.tactics
          .update(this.localTactic)
          .then((returnedTactic) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: this.isInitiative
                ? 'Initiative updated.'
                : 'Tactic updated.',
              life: 3000,
            })
            returnedTactic = this.updateTacticWithStashedLocalPropertyValues(
              this.localTactic,
              returnedTactic
            )
            this.$store
              .dispatch('refreshCurrentTactic', returnedTactic)
              .then(this.updateCustomRecurrenceValues)
          })
      }
      this.setInitialConditionalValues()
      this.setInitialValues()
      this.saveButtonDisabled = true
    },
    handleDeleteTactic(event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure you want to delete this tactic?',
        accept: () => {
          this.$store.getters.services.tactics
            .delete([this.localTactic.id.intID])
            .then(
              () => {
                this.isUIBlocked = true
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Tactic deleted.',
                  life: 3000,
                })
                this.$store
                  .dispatch(
                    'removeTacticFromCurrentPlanById',
                    this.localTactic.id
                  )
                  .finally(() => {
                    this.$store.dispatch('refreshCurrentPlan').finally(() => {
                      this.isUIBlocked = false
                      this.$router.back()
                    })
                  })
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary:
                    'There was an error deleting this tactic. Please try again.',
                })
              }
            )
        },
        reject: () => {
          //Delete rejected
        },
      })
    },
    handleCancel() {
      this.resetRecurrence()
      this.$router.back()
    },
    resetRecurrence() {
      // if you cancel a new tactic that has repeat values, then try
      // to create a new one again it will still have these values
      // so delete them
      if (this.localTactic.id.intID === 0) {
        this.localTactic.repeats = false
        this.localTactic.isCustomRecurrence = false
        this.localTactic.rrule = null
      }
    },
    onTagListUpdate(updatedList: Tag[]) {
      this.localTactic.tags.splice(
        0,
        this.localTactic.tags.length,
        ...updatedList
      )
      this.tagUpdateItterator += 1
      this.compareObjects(this.localTactic.tags, this.initialTags)
    },
    handleRemoveTag(id: ID) {
      this.localTactic.tags = this.localTactic.tags.filter(
        (tag) => tag.id.intID != id.intID
      )
      this.compareObjects(this.localTactic.tags, this.initialTags)
    },
    onInitiativeListSelect(selectedInitiative: Tactic) {
      switch (selectedInitiative.tacticTypeName.toLowerCase()) {
        case this.$store.getters.initiativeTypeNamesDict.campaign:
          this.localTactic.campaignId = new ID(selectedInitiative.id.intID)
          break
        case this.$store.getters.initiativeTypeNamesDict.promotion:
          this.localTactic.promotionId = new ID(selectedInitiative.id.intID)
          break
        case this.$store.getters.initiativeTypeNamesDict.keyDate:
          this.localTactic.keyDateId = new ID(selectedInitiative.id.intID)
          break
        default:
          break
      }
    },
    onMultiDayChange() {
      if (!this.shouldShowEndDateInput) {
        this.localTactic.endDate = new Date(
          this.localTactic.startDate.toString()
        )
      }
    },
    onInputChange() {
      if (!this.isMonthlyFocus) {
        if (this.shouldShowEndDateInput == false) {
          this.localTactic.endDate = new Date(
            this.localTactic.startDate.toString()
          )
        } else if (this.localTactic.endDate < this.localTactic.startDate) {
          this.localTactic.endDate = this.localTactic.startDate
        }
      }
      if (!this.localTactic.campaignId) {
        this.localTactic.campaignId = new ID()
        this.compareObjects(this.localTactic.campaignId, this.initialCampaignId)
      }
      if (!this.localTactic.promotionId) {
        this.localTactic.promotionId = new ID()
        this.compareObjects(
          this.localTactic.promotionId,
          this.initialPromotionId
        )
      }
      if (!this.localTactic.keyDateId) {
        this.localTactic.keyDateId = new ID()
        this.compareObjects(this.localTactic.keyDateId, this.initialKeyDateId)
      }

      //TODO: currently using forceUpdate because some input components were not truggering DOM render, this is likely because their models are properties of currentTactic and not reactive, resolve this issue by ensuring that these models are reactive
      this.$forceUpdate()
    },
    clearRepeat() {
      this.localTactic.repeats = false
      this.localTactic.recurrenceText = ''
      this.localTactic.rrule = ''
    },
    getMonthlyByDay(
      startDate: Date,
      dtStart: string,
      onlyReturnMonthlyRule = false
    ) {
      const d = new Date(startDate.getTime())
      const dayOfWeek = d.getDay()
      const month = d.getMonth()
      const datesWithSameDayOfWeek = [] as Date[]

      // Get the first instance of the day of week in the month
      d.setDate(1)
      while (d.getDay() !== dayOfWeek) {
        d.setDate(d.getDate() + 1)
      }

      // get all instances of day of week
      while (d.getMonth() === month) {
        datesWithSameDayOfWeek.push(new Date(d))
        d.setDate(d.getDate() + 7)
      }

      // find our start date's index of those
      let indexOfStartDate = 0
      datesWithSameDayOfWeek.forEach((date, index) => {
        if (isSameDay(startDate, date)) {
          indexOfStartDate = index
        }
      })

      const isFifthInstanceOfWeekDay = indexOfStartDate > 4

      if (onlyReturnMonthlyRule) {
        return {
          value: isFifthInstanceOfWeekDay
            ? `BYSETPOS=-1;BYDAY=${format(startDate, 'EEEEEE').toUpperCase()}`
            : `BYSETPOS=${indexOfStartDate + 1};BYDAY=${format(
                startDate,
                'EEEEEE'
              ).toUpperCase()}`,
          label: isFifthInstanceOfWeekDay
            ? `Monthly on last ${format(startDate, 'eeee')} of the month`
            : `The ${indexOfStartDate + 1}${
                ['st', 'nd', 'rd'][
                  ((((indexOfStartDate + 1 + 90) % 100) - 10) % 10) - 1
                ] || 'th'
              } ${format(startDate, 'eeee')} of the month`,
        }
      }
      return {
        value: isFifthInstanceOfWeekDay
          ? `${dtStart}RRULE:FREQ=MONTHLY;BYSETPOS=-1;BYDAY=${format(
              startDate,
              'EEEEEE'
            ).toUpperCase()}`
          : `${dtStart}RRULE:FREQ=MONTHLY;BYSETPOS=${
              indexOfStartDate + 1
            };BYDAY=${format(startDate, 'EEEEEE').toUpperCase()}`,
        label: isFifthInstanceOfWeekDay
          ? `Monthly on last ${format(startDate, 'eeee')} of the month`
          : `Monthly on the ${indexOfStartDate + 1}${
              ['st', 'nd', 'rd'][
                ((((indexOfStartDate + 1 + 90) % 100) - 10) % 10) - 1
              ] || 'th'
            } ${format(startDate, 'eeee')} of the month`,
      }
    },
    handleEditCustomRuleClick(e) {
      e.preventDefault()
      this.showCustomRecurrenceDialog = true
    },
    handleRemoveCustomRuleClick(e) {
      e.preventDefault()
      this.localTactic.isCustomRecurrence = false
      this.localTactic.rrule = ''
      this.localTactic.recurrenceText = ''
    },
    onMonthlyFocusDateSelect() {
      // Ensure start/end dates for tactic span first and last day of the selected month
      this.localTactic.startDate.setDate(1)
      this.localTactic.endDate = new Date(this.localTactic.startDate)
      this.localTactic.endDate.setMonth(
        this.localTactic.startDate.getMonth() + 1
      )
      this.localTactic.endDate.setDate(0)
    },
    updateCustomRecurrenceValues() {
      const {rrule, isCustomRecurrence} = this.localTactic
      if (rrule && isCustomRecurrence) {
        const {startDate} = this.localTactic
        const rule = rrulestr(rrule)
        // TODO: extract this out to util/service function
        const year = startDate.getFullYear()
        const month =
          startDate.getMonth() > 8
            ? startDate.getMonth() + 1
            : '0' + (startDate.getMonth() + 1)
        const date =
          startDate.getDate() > 9
            ? startDate.getDate()
            : '0' + startDate.getDate()
        const hours =
          startDate.getHours() > 9
            ? startDate.getHours()
            : '0' + startDate.getHours()
        const minutes =
          startDate.getMinutes() > 9
            ? startDate.getMinutes()
            : '0' + startDate.getMinutes()
        const seconds =
          startDate.getSeconds() > 9
            ? startDate.getSeconds()
            : '0' + startDate.getSeconds()
        const dtStart = this.localTactic.startDate
          ? `DTSTART=${year}${month}${date}T${hours}${minutes}${seconds}\n`
          : ''

        let freq = RRule.optionsToString({
          freq: rule.options.freq,
        })
        freq = freq.substr(freq.indexOf('FREQ=') + 5)

        let monthlyRule = ''
        let byweekday = RecurrenceByweekday['MO']
        if (freq === RecurrenceFrequency['MONTHLY']) {
          const monthlyOptions = [
            {
              value: `BYMONTHDAY=${format(startDate, 'd')}`,
              label: `The ${format(startDate, 'do')}`,
            },
            {
              ...this.getMonthlyByDay(startDate, dtStart, true),
            },
          ]
          monthlyRule =
            rrule.indexOf('BYMONTHDAY') >= 0
              ? monthlyOptions[0].value
              : monthlyOptions[1].value
        } else if (freq === RecurrenceFrequency['WEEKLY']) {
          const weekRule = RRule.optionsToString({
            byweekday: rule.options.freq,
          })
          byweekday =
            RecurrenceByweekday[weekRule.substr(weekRule.indexOf('BYDAY=') + 6)]
        }

        this.customRecurrence = {
          recurrenceText: rule.toText(),
          freq: RecurrenceFrequency[freq],
          interval: rule.options.interval,
          monthlyRule,
          byweekday,
        }
        this.localTactic.isCustomRecurrence = true
      }
    },
    openInNewWindow(url) {
      if (url.substr(0, 10).indexOf('://') == -1) {
        url = `http://${url}`
      }
      window.open(url, '_blank')
    },
    isFieldType(field, type) {
      return field.type === TacticFieldType[type]
    },
    uploadCustomFieldImage(fieldId: ID, fileData) {
      const file = new FormData()
      file.append('file', fileData.files[0])

      this.$store.getters.services.tactics
        .importCustomFieldImage(this.currentTactic.id.intID, fieldId, file)
        .then((response) => {
          const thisImageField = this.getFieldValueForFieldId(fieldId)
          thisImageField.value = response.id.intID.toString()
          this.customImageFieldUrlsMap = this.customImageFieldUrlsMap.concat({
            fieldId: fieldId.intID,
            url: response.fileLocation,
          })
          this.$forceUpdate()
          this.conditionalChange(thisImageField, thisImageField.value)
        })
    },
    removeCustomFieldImage(fieldId: ID) {
      const thisImageField = this.getFieldValueForFieldId(fieldId)
      thisImageField.value = ''
      this.customImageFieldUrlsMap = this.customImageFieldUrlsMap.filter(
        (imageField) => imageField.fieldId != fieldId.intID
      )
      this.conditionalChange(thisImageField, thisImageField.value)
    },
    getCustomImageFieldUrl(fieldId) {
      const val = this.customImageFieldUrlsMap.find(
        (imageField) => imageField.fieldId == fieldId.intID
      )
      return val ? val.url : ''
    },
    copyTactic() {
      this.$store.getters.services.tactics
        .get([this.$route.query.copyof])
        .then((response: Tactic) => {
          response.title = `Copy of ${response.title}`
          this.localTactic = response
          this.updateSelectedChannelTypePlatform()
          this.updateEndDateInputVisibility()
          this.updateLocalFieldValues()
        })
    },
    updateCurrentTacticStartDate(newStartDate) {
      this.localTactic.startDate = newStartDate
      this.nonConditionalChange()
      this.$forceUpdate()
    },
    updateCurrentTacticEndDate(newEndDate) {
      this.localTactic.endDate = newEndDate
      this.nonConditionalChange()
    },
    isFieldUrlType(field) {
      return field.type === TacticFieldType.url
    },
    updateEditModeFieldIds(id: number) {
      if (this.editModeFieldIds.includes(id)) {
        this.editModeFieldIds = this.editModeFieldIds.filter(
          (fieldId) => fieldId != id
        )
      } else {
        this.editModeFieldIds = this.editModeFieldIds.concat([id])
      }
    },
    getInitiativeForId(id: ID) {
      const thisInitiative = this.$store.getters.currentInitiatives.find(
        (tactic) => tactic.id.intID == id.intID
      )
      return thisInitiative ? thisInitiative : new Tactic()
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.edit-link {
  @include font-light;
  font-size: 1.1rem;
  background: #ffffff;
  padding: 0.8rem 1.2rem;
  border: 0.1rem solid #707070;
}
.underline {
  text-decoration: underline;
}

.tactic-detail-wrapper {
  h2 {
    margin-bottom: 1.6rem;
  }
  .tag-list-column {
    flex-grow: 1;
  }
  .tag-chip {
    padding: 0.7rem 0.7rem 0.7rem 1.6rem;
    border-radius: 1.6rem;
    background-color: $white-smoke;
    color: $night-rider;
    font-size: 1.1rem;
    line-height: 1.6rem;

    .p-button {
      padding: 0;

      .pi {
        font-size: 1.2rem;
      }
    }
  }
  input:disabled,
  .p-component.p-disabled,
  .p-checkbox-box.p-disabled {
    opacity: 1;
    border-color: $nobel;
    border-style: dashed;
  }

  .custom-field-image {
    width: 200px;
  }
}

.custom-recurrence-dialog-body {
  min-height: 20rem;
  display: flex;
  flex-direction: column;
}

.custom-recurrence-number-input {
  .p-inputnumber-input {
    width: 4rem;
    margin: 0 0.5rem;
    text-align: center;
  }
}

.custom-properties-container {
  .custom-field-url-link {
    color: #333333;
    text-decoration: underline;
  }
}

.custom-field-image-controls {
  position: relative;

  .custom-field-image-controls-container {
    position: absolute;
    top: 5px;
    right: 5px;

    button {
      height: 25px;
      width: 25px;
      background: white;
      margin-left: 5px;

      &:hover {
        background: white !important;
      }
    }
  }
}

.custom-image-dialog {
  img {
    max-width: 100%;
  }

  button {
    position: absolute;
    top: 20px;
    right: 25px;
  }
}

.tag-list-column {
  div.is-lead {
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
.initiative-item {
  &.is-lead {
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
</style>