<template>
  <div>
    <SetupTopView
      title="Plan Documents"
      subtitle="Upload the documentation of your strategy and plan to keep it handy for
        your team."
      class="top-view-container-documents"
    />
    <div class="setup-content documents">
      <div class="categories-container">
        <ul
          v-for="category in planDocumentCategories"
          :key="category.id.intID"
          class="category"
        >
          <li class="category__header">
            <div v-if="!category.editing">
              {{ category.name }}
            </div>
            <div v-else>
              <InputText v-model="category.newName" />
              <i
                class="pi pi-check save-icon"
                @click="saveEditedCategory(category)"
              ></i>
            </div>

            <i
              v-if="category.name !== 'Uncategorized'"
              :class="`pi pi-${
                category.editing ? 'times' : 'pencil'
              } edit-icon`"
              @click="() => (category.editing = !category.editing)"
            ></i>
          </li>
          <li
            v-for="document in category.planDocuments"
            :key="document.id.intID"
            class="document"
          >
            <span class="document__title">
              {{ document.asset.name }}
            </span>

            <div class="document__icons">
              <a
                class="pi pi-download"
                target="_blank"
                :href="document.asset.fileLocation"
                download
              />
              <i
                class="pi pi-trash"
                @click="deleteDocument(category, document.id.intID)"
              />
            </div>
          </li>
        </ul>
      </div>
      <div class="add-document">
        <div class="field">
          <label for="document-category-add">Category</label>
          <Dropdown
            id="document-category-add"
            optionLab
            el="name"
            v-model="newDocument.category"
            optionLabel="name"
            :options="categoriesOptions"
            @change="() => (isSelectedCategory = true)"
          />
        </div>

        <div
          class="field"
          v-if="newDocument.category.id.intID === 0 && isSelectedCategory"
        >
          <label for="new-category-name">New Category Name</label>
          <InputText
            id="new-category-name"
            class="new-category-name"
            v-model="newDocument.newCategoryName"
          />
        </div>

        <label class="document-select-file" for="new-document">
          Select File
          <input type="file" id="new-document" @change="onFileUpload" hidden />
        </label>
        <div class="field">
          <label for="document-name-add">File Name</label>
          <InputText id="document-name-add" v-model="newDocument.name" />
        </div>
        <div class="upload-button" @click="uploadFile">
          <div>Upload</div>
          <i class="pi pi-upload"></i>
        </div>
      </div>
    </div>
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
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

import SetupTopView from '@/app-shared/components/SetupTopView.vue'
import PlanDocument from '@/app-shared/models/PlanDocument'
import PlanDocumentCategory from '@/app-shared/models/PlanDocumentCategory'
import ID from '@/app-shared/models/ID'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('Dropdown', Dropdown)

export default Vue.extend({
  name: 'SetupDocuments',
  components: {
    SetupTopView,
  },
  data() {
    return {
      newDocument: {
        name: '',
        category: {
          name: '',
          id: {intID: 0, apiID: ''} as ID,
          orderIndex: 0,
          planDocuments: [] as PlanDocument[],
        } as PlanDocumentCategory,
        newCategoryName: '',
        file: null,
      },
      isSelectedCategory: false,
      privatePlanDocumentCategories: [] as PlanDocumentCategory[],
    }
  },
  created() {
    this.setupCategories()
  },
  computed: {
    planDocumentCategories: {
      get(): PlanDocumentCategory[] {
   
        return this.privatePlanDocumentCategories.filter(
          (cat) => cat.planDocuments.length > 0
        )
      },
      set(value: PlanDocumentCategory[]) {
        this.privatePlanDocumentCategories = value
      },
    },
    categoriesOptions() {
      return JSON.parse(
        JSON.stringify((this as any).privatePlanDocumentCategories)
      ).map((el) =>
        el.name === 'Uncategorized'
          ? {...el, name: '[ New Category ]'}
          : {...el}
      )
    },
  },
  methods: {
    async setupCategories() {
      await this.$store.dispatch('refreshCurrentSetupPlan')

      this.$store.dispatch('setupDocumentToCategories')
      this.planDocumentCategories =
        this.$store.getters.currentSetupPlan.planDocumentCategories
    },
    onFileUpload(e) {
      this.newDocument.file = e.target.files[0]
      this.newDocument.name = e.target.files[0].name
      e.target.value = ''
    },
    uploadFile() {
      this.isSelectedCategory = false

      // TODO: fix file upload size error - example from UserDetail for profil image upload:
      // const file = new FormData()
      // file.append('file', data.files[0])
      // this.$store.getters.services.users.mediaAsset(file).then(
      //   (mediaAsset) => {
      //     this.user.profileImage = mediaAsset
      //     this.updateUser()
      //   },
      //   (error) => {
      //     Vue.prototype.$toast.add({
      //       severity: AlertMessageSeverity.error,
      //       summary: 'Error uploading file. Please try again.',
      //       life: 3000,
      //     })
      //   }
      // )

      const file: any = this.newDocument
      const newFile = new FormData()
      newFile.append(
        'file',
        new File([file.file], file.name, {
          type: file?.file?.type,
          lastModified: file?.file?.lastModified,
        })
      )

      this.$store.getters.services.users
        .mediaAsset(newFile)
        .then((newAsset) => {
          const newPlanDocument = PlanDocument.fromResponseObject({
            asset: newAsset,
            plan: this.$store.getters.currentSetupPlan.id.intID,
            tactics: [],
            categories: [this.newDocument.category],
          })
          this.$store.getters.services.documents
            .create(newPlanDocument)
            .then((newDbDocument) => {
              newPlanDocument.id = ID.fromResponseObject(
                newDbDocument.id,
                'plan_documents'
              )
              const shouldCreateNewCategory =
                !this.newDocument.category?.id?.intID
              if (shouldCreateNewCategory) {
                const newDocCategory = PlanDocumentCategory.fromResponseObject({
                  name: this.newDocument.newCategoryName,
                })
                newDocCategory.planDocuments.push(newPlanDocument)
                this.$store.getters.services.documents
                  .createCategory(newDocCategory, newPlanDocument)
                  .then((newDbCat) => {
                    const newCat = new PlanDocumentCategory(
                      newDbCat.name,
                      ID.fromResponseObject(
                        newDbCat.id,
                        'plan_document_categories'
                      ),
                      [newPlanDocument],
                      0
                    )

                    let lastItem: any = []
                    lastItem = this.privatePlanDocumentCategories.pop()
                    this.privatePlanDocumentCategories.push(newCat)
                    this.privatePlanDocumentCategories.push(lastItem)
                  })
              } else {
                const newSetupPlan = this.$store.getters.currentSetupPlan
                const categoryIndex =
                  newSetupPlan.planDocumentCategories.findIndex(
                    (cat) => cat.id.intID === this.newDocument.category.id.intID
                  )
                if (categoryIndex === -1) {
                  const newCat = new PlanDocumentCategory('Uncategorized')
                  newCat.planDocuments.push()
                  newSetupPlan.planDocumentCategories.push(newCat)
                  this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
                } else {
                  newSetupPlan.planDocumentCategories[
                    categoryIndex
                  ].planDocuments.push(newPlanDocument)
                  this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
                }
              }

              this.newDocument = {
                name: '',
                category: {
                  name: '',
                  id: {intID: 0, apiID: ''} as ID,
                  orderIndex: 0,
                  planDocuments: [] as PlanDocument[],
                } as PlanDocumentCategory,
                newCategoryName: '',
                file: null,
              }
            })
        })
        .catch((response) => {
          let errorMessage =
            'There was an error uploading the file. Please try again.'
          if (String(response).indexOf('413') > -1) {
            errorMessage =
              'Your document was not uploaded. Files must be smaller than 20MB.'
          }
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.warn,
            summary: errorMessage,
          })
        })
    },
    saveEditedCategory(category) {
      category.name = category.newName
      category.editing = false
      this.$store.getters.services.documents.updateCategory(category)
    },
    deleteDocument(category, documentId) {
      this.$store.getters.services.documents.delete(documentId).then(() => {
        category.planDocuments = category.planDocuments.filter(
          (doc) => doc.id.intID !== documentId
        )
        if (category.planDocuments.length === 0) {
          // this.planDocumentCategories = this.planDocumentCategories.filter(
          //   (cat) => cat.id.intID !== category.id.intID && cat.name !== 'Uncategorized'
          // )
        }
      })
    },
    handleClickContinue() {
      // TODO: call API to update this.$store.getters.currentSetupPlan object
      this.$emit('setup-step-complete')
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.category {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  padding-bottom: 10px;
  margin-bottom: 40px;
  border-bottom: 1px solid #979797;

  &__header {
    @include font-mulish-light;
    display: flex;
    flex-direction: row;
    font-size: 18px;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 5px 10px;
    .save-icon,
    .edit-icon {
      margin-left: 10px;
      font-size: 14px;
      padding: 5px;
      cursor: pointer;
    }
  }
}

.document {
  padding-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-right: 15px;
  align-items &__title {
    font-size: 16px;
  }
  &__title {
    @include font-mulish-light;
    font-size: 16px;
  }

  &__icons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 12px;
    * {
      font-size: 14px;
      color: #000;
      cursor: pointer;
    }
  }
}

.add-document {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;

  .field {
    width: 25%;

    label {
      @include font-mulish-light;
      padding-left: 0px;
      font-size: 11px;
    }
    .p-inputtext {
      border-color: black;
      border-radius: 0;
    }
  }

  .document-select-file {
    @include font-mulish-light;
    width: fit-content;
    text-align: center;
    padding: 5px;
    max-height: 22px;
    line-height: 11px;
    border: 1px solid #979797;
    margin-bottom: 5px;
    cursor: pointer;
    transform: translateY(10px);
  }

  .upload-button {
    @include font-mulish-light;
    width: 10%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transform: translateY(10px);
    font-size: 11px;

    .pi-upload {
      font-size: 12px;
      background-color: transparent;
    }
  }
}
.top-view-container-documents {
  max-width: 450px !important;
  .title {
    @include font-mulish-light;
  }
}
.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.documents{
  padding: 5px 20px !important;
}
</style>
