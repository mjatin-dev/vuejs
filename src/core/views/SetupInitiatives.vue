<template>
  <div class="setup-content">
    <div class="title-container">
      <SetupTopView
        class="main_title onboarding-step-initiatives"
        :title="topViewContent.title"
        :subtitle="topViewContent.infoText"
      />
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
          <PlanSettingsInitiativeDetail :tactic="tactic" :tacticIndex="tacticInd" :isSetup="true"/>
        </li>
      </div>
    </ul>
    <div class="type__add-tactic">
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

    <div class="actions-container">
      <Button
        @click="clickContinue"
        class="continue-button onboarding-button-style"
        label="Continue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SetupTopView from '@/app-shared/components/SetupTopView.vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Plan from '@/app-shared/models/Plan'
import Tactic from '@/app-shared/models/Tactic'
///import TagList from '@/app-shared/views/TagList.vue'
import InputText from 'primevue/inputtext'
import FileUpload from 'primevue/fileupload'
import PlanDocument from '@/app-shared/models/PlanDocument'
import TacticType from '@/app-shared/models/TacticType'
import Channel from '@/app-shared/models/Channel'
import Tag from '@/app-shared/models/Tag'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import TimePicker from '@/app-shared/components/TimePicker.vue'
import PlanSettingsInitiativeDetail from '@/app-shared/views/PlanSettingsInitiativeDetail.vue'


Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('Checkbox', Checkbox)
Vue.component('FileUpload', FileUpload)
Vue.component('TimePicker', TimePicker)

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
  name: 'SetupInitiatives',
  components: {
    SetupTopView,
    //TagList,
    PlanSettingsInitiativeDetail
},
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
      return this.$store.getters.currentSetupPlan
    },
    initiativeChannel(): Channel {
      return this.$store.getters.currentSetupPlan.initiativeChannel
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
    categoryOptions(): string[] {
      return [...this.initiativeChannel.tacticTypes].map((el) => el.name)
    },
  },
  async created() {
    await this.$store.dispatch('refreshCurrentSetupPlan')
  },
  methods: {
    onTagListUpdate() {
      this.plan = this.$store.getters.currentSetupPlan
    },
    // Tactic
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
        })
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
    handleChangeMultiDay(tactic: Tactic) {
      tactic.newEndDate = tactic.newStartDate
    },
    handleAllDayChange(isAllDay, tactic) {
      if (isAllDay) {
        tactic.newStartDate = beginingOfDay(tactic.newStartDate)
        tactic.newEndDate = endOfDay(tactic.newStartDate)
      }
    },
    deleteTactic(type: TacticType, tacticId: number) {
      this.$store.getters.services.tactics.delete(tacticId).then(() => {
        type.tactics = type.tactics.filter(
          (tactic) => tactic.id.intID !== tacticId
        )
      })
    },

    // Tag
    addTag(newTags: Tag[], tactic: Tactic) {
      tactic.tags = newTags
      this.$store.getters.services.tactics.update(tactic)
    },
    deleteTag(tagId, tactic) {
      this.$store.getters.services.tags.delete(tagId).then(() => {
        tactic.tags = tactic.tags.filter((tag) => tag.id.intID !== tagId)
      })
    },

    // Documents
    onFileUpload(e, tactic: Tactic) {
      tactic.newFile = e.target.files[0]
      tactic.newFileName = e.target.files[0].name
    },
    deleteDocument(documentId, tactic: Tactic) {
      this.$store.getters.services.documents.delete(documentId).then(() => {
        tactic.documents = tactic.documents.filter(
          (doc) => doc.id.intID !== documentId
        )
      })
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
            plan: this.$store.getters.currentSetupPlan.id.intID,
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

    clickContinue() {
      this.$emit('setup-step-complete')
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
      border-top: 1px solid #9d9d9d;
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
      border-top: 1px solid #9d9d9d;
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
