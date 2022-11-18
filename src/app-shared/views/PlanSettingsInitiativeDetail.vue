<template>
  <div>
    <div
      v-if="!tactic.opened"
      class="tactic__close"
      @click="
        () => {
          tactic.opened = true
        }
      "
    >
      <div class="tactic__open__view" v-if="!tactic.editing">
        <p class="tactic__name">{{ tactic.title }}</p>
        <p class="tactic__startDate">{{ tactic.startDateString }}</p>
        <p class="tactic__endDate">{{ tactic.endDateString }}</p>
      </div>
      <i class="pi pi-chevron-right"></i>
    </div>
    <div class="tactic__open" v-else>
      <div class="tactic__info">
        <div class="tactic__open__view" v-if="!tactic.editing">
          <p class="tactic__name">{{ tactic.title }}</p>
          <p class="tactic__startDate">{{ tactic.startDateString }}</p>
          <p class="tactic__endDate" v-if="tactic.repeats">
            {{ tactic.endDateString }}
          </p>
        </div>
        <div class="tactic__open__edit" v-else>
          <div class="field name">
            <label>Name</label>
            <InputText
              type="text"
              class="edit-inputs"
              v-model="tactic.newTitle"
            />
          </div>
          <div class="field start-date">
            <label>Start Date</label>
            <Calendar
              class="edit-inputs"
              :showTime="!tactic.allDay"
              dateFormat="m/d/yy"
              v-model="tactic.newStartDate"
            >
              <template #footer>
                <TimePicker
                  :date="tactic.newStartDate"
                  :setDate="(newDate) => (tactic.newStartDate = newDate)"
                />
              </template>
            </Calendar>
          </div>
          <div class="tactic__endDate" v-if="tactic.repeats">
            <div class="field">
              <label>End Date</label>
              <Calendar
                class="edit-inputs"
                :showTime="!tactic.allDay"
                dateFormat="m/d/yy"
                v-model="tactic.newEndDate"
              >
                <template #footer>
                  <TimePicker
                    :date="tactic.newEndDate"
                    :setDate="(newDate) => (tactic.newEndDate = newDate)"
                  />
                </template>
              </Calendar>
            </div>
          </div>
          <div class="tactic__checkbox">
            <Checkbox
              :binary="true"
              v-model="tactic.repeats"
              @change="() => handleChangeMultiDay(tactic)"
            />
            <label for=""> Show Duration</label>
          </div>
          <div class="tactic__checkbox">
            <Checkbox
              :binary="true"
              v-model="tactic.isAllDay"
              @change="() => handleAllDayChange(tactic.isAllDay, tactic)"
            />
            <label for=""> All-Day</label>
          </div>
        </div>
        <div
          class="tactic__icons"
          @click="
            (e) => {
              e.stopPropagation()
            }
          "
        >
          <div v-if="!tactic.editing">
            <i
              class="pi pi-pencil"
              @click="
                () => {
                  tactic.editing = true
                }
              "
            />
            <i
              class="pi pi-trash"
              @click="() => deleteTactic(type, tactic.id.intID)"
            />
            <i
              class="pi pi-chevron-down"
              @click="
                () => {
                  tactic.opened = false
                }
              "
            ></i>
          </div>
          <div v-else>
            <i class="pi pi-check" @click="() => editTactic(tactic)" />
            <i
              class="pi pi-times"
              @click="
                () => {
                  tactic.editing = false
                }
              "
            />
            <i
              class="pi pi-trash"
              @click="() => deleteTactic(type, tactic.id.intID)"
            />
            <i class="pi pi-chevron-down"></i>
          </div>
        </div>
      </div>
      <div class="tactic__tags">
        <div class="tactic__tags__header">
          <p class="tags-header">Strategic Priorities</p>
          <div class="tactic__tag__add">
            <Button
              class="onboarding-button-style"
              @click="
                () => {
                  shouldShowTagList = true
                }
              "
              label="+ Add Strategic Priority"
            />
            <Dialog
              header="Strategic Priority"
              :visible.sync="shouldShowTagList"
              :modal="true"
            >
              <TagList
                :selectedTags="tactic.tags"
                :allowSelect="true"
                :allowEdit="false"
                :allowCreate="false"
                :allowList="true"
                :skipRefetch="true"
                :isSetup="false"
                @updateSelection="(tags) => addTag(tags, tactic)"
              />
            </Dialog>
          </div>
        </div>
        <div class="tactic__tags-container" v-if="isSetup === true">
          <ul
            class="tag-tactic"
            v-for="(tagCategory, index) in tagCategories"
            :key="index"
          >
            <li v-if="tagCategory.tags.length > 0">
              {{ tagCategory.label }}
            </li>
            <li
              class="tag"
              v-for="(tag, subIndex) in tagCategory.tags"
              :key="subIndex"
            >
              <p>{{ tag.label }}</p>
              <i
                class="pi pi-times-circle"
                @click="() => deleteTag(tag.id, tactic)"
              />
            </li>
          </ul>
        </div>

        <div class="tactic__tags-container" v-else>
          <ul
            class="tag-tactic"
            v-for="tagCategory in currentTag(tactic)"
            :key="tagCategory.id"
          >
            <li v-if="tagCategory.tags.length > 0">
              {{ tagCategory.label }}
            </li>
            <li class="tag" v-for="tag in tagCategory.tags" :key="tag.id">
              <p>{{ tag.label }}</p>
              <i
                class="pi pi-times-circle"
                @click="() => deleteTag(tag.id, tactic)"
              />
            </li>
          </ul>
        </div>
      </div>

      <div class="tactic__documents">
        <p class="documents-header">Documents</p>
        <div
          class="tactic__document"
          v-for="document in tactic.documents"
          :key="document.id.intID"
        >
          <div class="document__title">{{ document.asset.name }}</div>
          <div class="document__icons">
            <a target="_blank" :href="document.asset.fileLocation" download>
              <i class="pi pi-download"></i>
            </a>
            <i
              class="pi pi-trash"
              @click="deleteDocument(document.id.intID, tactic)"
            ></i>
          </div>
        </div>
        <div class="document__upload">
          <label
            class="document__upload__button"
            :for="`document-upload-${tacticIndex}`"
          >
            Select File
            <input
              :id="`document-upload-${tacticIndex}`"
              type="file"
              @change="(e) => onFileUpload(e, tactic)"
              hidden
            />
          </label>

          <InputText
            v-if="tactic.newFile"
            type="text"
            v-model="tactic.newFileName"
          />

          <div class="upload-button" @click="() => uploadFile(tactic)">
            <div>Upload</div>
            <i class="pi pi-upload"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Button from 'primevue/button'
import TagList from '@/app-shared/views/TagList.vue'

import Tag from '@/app-shared/models/Tag'
import Tactic from '@/app-shared/models/Tactic'
import TacticType from '@/app-shared/models/TacticType'
import PlanDocument from '@/app-shared/models/PlanDocument'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Plan from '../models/Plan'
import {ta} from 'date-fns/locale'

Vue.component('Button', Button)

const beginingOfDay = (options = {}) => {
  const {date = new Date(), timeZone} = options as any
  const parts: any = Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)
  const hour = parseInt(parts.find((i) => i.type === 'hour').value)
  const minute = parseInt(parts.find((i) => i.type === 'minute').value)
  const second = parseInt(parts.find((i) => i.type === 'second').value)
  return new Date(
    1000 *
      Math.floor(
        (date - hour * 3600000 - minute * 60000 - second * 1000) / 1000
      )
  )
}

const endOfDay = (...args) =>
  new Date(beginingOfDay(...args).getTime() + 86399999)

export default Vue.extend({
  name: 'PlanSettingsInitiativeDetail',
  props: {
    tactic: {
      type: Object,
      required: true,
    },
    tacticIndex: {
      type: Number,
      required: true,
    },
    isSetup: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    TagList,
  },
  data: () => ({
    shouldShowTagList: false,
  }),
  computed: {
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    currentPlan(): Plan {
      if (this.$route.path.indexOf('setup') > 0) {
        return this.$store.getters.currentSetupPlan
      }
      return this.$store.getters.currentPlan
    },

    tags(): Tag[] {
      return this.$store.getters.currentPlan.tags
    },
    tagCategories() {
      const categories: any = []
      // array push unique  objects in categories
      this.tags.forEach((tag) => {
        const [category, name] = tag.text.split(':')
        const categoryIndex = categories.findIndex(
          (cat) => cat.label === category
        )
        if (categoryIndex === -1) {
          categories.push({
            id: categories.length + 1,
            label: category,
            name: category,
            tags: [],
          })
        }
      })
      // add tags to categories
      this.tags.forEach((tag) => {
        const [category, name] = tag.text.split(':')
        const categoryIndex = categories.findIndex(
          (cat) => cat.label === category
        )
        const newTag = {
          id: tag.id,
          label: name ? name : category,
          editing: false,
          newName: name ? name : category,
          planId: tag.planId,
          isLead: tag.isLead,
          isNested: tag.isLead,
          type:
            tag.isObjective &&
            (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested)),
        }
        categories[categoryIndex === -1 ? 3 : categoryIndex].tags.push(newTag)
      })

      return categories
    },
  },
  methods: {
    currentTag(tactic) {
      const categories: any = []

      if (tactic.tags && tactic.tags.length > 0) {
        // array push unique  objects in categories
        tactic.tags.forEach((tag) => {
          const [category, name] = tag.text.split(':')
          const categoryIndex = categories.findIndex(
            (cat) => cat.label === category
          )
          if (categoryIndex === -1) {
            categories.push({
              id: categories.length + 1,
              label: category,
              name: category,
              tags: [],
            })
          }
        })
        // add tags to categories
        tactic.tags.forEach((tag) => {
          const [category, name] = tag.text.split(':')
          const categoryIndex = categories.findIndex(
            (cat) => cat.label === category
          )
          const newTag = {
            id: tag.id,
            label: name ? name : category,
            editing: false,
            newName: name ? name : category,
            planId: tag.planId,
            isLead: tag.isLead,
            isNested: tag.isLead,
            type:
              tag.isObjective &&
              (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested)),
          }
          categories[categoryIndex === -1 ? 3 : categoryIndex].tags.push(newTag)
        })
      }

      return categories
    },
    editTactic(tactic: Tactic) {
      tactic.title = tactic.newTitle
      tactic.startDate = tactic.newStartDate
      tactic.endDate = tactic.newEndDate
      tactic.isInitiative = true
      this.$store.getters.services.tactics.update(tactic).then(() => {
        tactic.editing = false
      })
    },
    deleteTactic(type: TacticType, tacticId: number) {
      this.$store.getters.services.tactics.delete(tacticId).then(() => {
        // type.tactics = type.tactics.filter(
        //   (tactic) => tactic.id.intID !== tacticId
        // )

        this.$emit('refreshPlan')
      })
    },
    handleChangeMultiDay(tactic: Tactic) {
      tactic.newEndDate = tactic.newStartDate
    },
    handleAllDayChange(isAllDay, tactic) {
      if (isAllDay) {
        tactic.newStartDate = beginingOfDay(tactic.newStartDate)
        tactic.newEndDate = endOfDay(tactic.newStartDate)
      }
    },
    addTag(newTags: Tag[], tactic: Tactic) {
      tactic.tags = newTags
      this.$store.getters.services.tactics.update(tactic)
    },
    deleteTag(tagId, tactic) {
      tactic.tags = tactic.tags.filter((item) => item.id.intID !== tagId.intID)
      this.$store.getters.services.tactics.update(tactic)

      // this.$store.getters.services.tags.delete(tagId.intID).then(() => {

      // })
    },
    deleteDocument(documentId, tactic: Tactic) {
      this.$store.getters.services.documents.delete(documentId).then(() => {
        tactic.documents = tactic.documents.filter(
          (doc) => doc.id.intID !== documentId
        )
      })
    },
    onFileUpload(e, tactic: Tactic) {
      tactic.newFile = e.target.files[0]
      tactic.newFileName = e.target.files[0].name
    },
    uploadFile(tactic) {
      const newFile = new FormData()

      if (!tactic.newFile) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must upload file first',
        })
        return
      }

      const file = new File([tactic.newFile], tactic.newFileName, {
        type: tactic.newFile.type,
        lastModified: tactic.newFile.lastModified,
      })
      newFile.append('file', file)

      this.$store.getters.services.users
        .mediaAsset(newFile)
        .then((newAsset) => {
          const newPlanDocument = PlanDocument.fromResponseObject({
            asset: newAsset,
            plan: this.currentPlan.id.intID,
            tactics: [tactic.id.intID],
          })
          this.$store.getters.services.documents
            .create(newPlanDocument)
            .then((newDBPlanDocument) => {
              tactic.documents.push(
                PlanDocument.fromResponseObject(newDBPlanDocument)
              )
              this.$store.getters.services.tactics
                .update(tactic)
                .then((newDBTactic) => {
                  tactic.documents = newDBTactic.documents
                  tactic.newFile = ''
                  tactic.newFileName = ''
                })
            })
        })
        .catch(() => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.warn,
            summary:
              'There was an error uploading the file, try with a smaller file',
          })
        })
    },
  },
})
</script>


<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.onboarding-step-initiatives {
  max-width: 450px !important;
  .title {
    @include font-mulish-light;
    margin-bottom: 5px !important;
  }
}
.pi {
  cursor: pointer;
}
.type {
  @include font-mulish-light;
  .custom-style-tactic {
    padding-bottom: 0px !important;
    padding-left: 10px;
  }
  .tactic {
    cursor: default;
    display: block;
    border-bottom: 1px solid black;
    padding-top: 0;

    &__info {
      position: relative;
    }
    &__name {
      width: 23%;
      margin: 0;
    }
    &__startDate {
      width: 23%;
      margin: 0;
    }
    &__endDate {
      width: 23%;
      margin: 0;
    }
    &__checkbox {
      width: 10%;
      display: flex;
      align-items: flex-end;
      gap: 3px;
    }
    &__icons {
      position: absolute;
      top: 50%;
      right: -10px;
      transform: translateY(-50%);
      i {
        padding-left: 10px;
        font-size: 12px;
      }
    }

    &__close {
      position: relative;
      .pi {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    &__open {
      position: relative;
      padding-right: 10px;
      &__view {
        display: flex;
        padding: 15px 0px 15px 5px;
        cursor: pointer;
        font-size: 14px;
      }
      &__edit {
        display: flex;
        gap: 10px;
        padding: 11px 0;

        .name,
        .start-date {
          width: 21.8%;
        }
      }
    }
    &__tags {
      border-top: 1px solid #dedede;
      padding-bottom: 20px;
    }
    &__tags__header {
      position: relative;
      .tags-header {
        display: inline-block;
        @include font-mulish-light;
        margin-top: 10px;
        margin-bottom: 30px;
      }
    }
    &__tag__add {
      display: inline-block;
      position: absolute;
      top: 10px;
      right: 10px;
      button {
        @include font-mulish-light;
        font-size: 12px !important;
        font-weight: 600;
      }
    }
    &__tags-container {
      display: flex;
      .tag-tactic {
        width: 20%;
        padding: 0;
        @include font-mulish-light;
        font-size: 14px;
        .tag {
          cursor: pointer;
          margin: 10px 0 0 0;
          background-color: #dedede;
          width: 60%;
          padding: 1px 15px;
          border-radius: 20px;
          position: relative;
          p {
            margin: 0;
            padding: 8px 0;
          }
          i {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
    }
    &__documents {
      border-top: 1px solid #dedede;
      .documents-header {
        @include font-mulish-light;
        margin: 10px 0px !important;
      }
    }
    &__document {
      @include font-mulish-light;
      border-top: 1px solid #dedede;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 5px 0px 5px 5px;

      .document__icons {
        padding-right: 5px;
        align-items: center;
      }
    }
    .document__title {
      font-size: 14px;
    }
    .document__upload {
      display: flex;
      flex-direction: row;
      padding: 10px 0px;
      gap: 20px;
      border-top: 1px solid #dedede !important;

      #select-button-hidden {
        display: none;
      }

      &__button {
        border: solid 1px black;
        padding: 4px 10px;
        text-align: center;
      }

      .p-fileupload-choose {
        opacity: 0;
        height: 0;
        width: 0;
      }

      .upload-button {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        align-items: center;
        .pi-upload {
          margin-left: 7px;
          border-style: none;
          border-radius: 3px;
          color: #000000;
        }
      }
    }
  }
}

.type {
  margin-bottom: 40px;
  padding-left: 0;

  &__headers {
    @include font-mulish-light;
    display: flex;
    padding: 5px 5px 5px 15px;
    border-bottom: 1px solid black;
    cursor: pointer;
  }

  &__title {
    @include font-mulish-light;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 5px 10px;
    font-size: 20px;
    margin: 0;
  }

  &__add-tactic {
    padding-top: 5px;
    display: flex;
    justify-content: flex-start;
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
}

.actions-container {
  margin-top: 5rem !important;
  .continue-button {
    color: #ffffff !important;
  }
}
</style>
