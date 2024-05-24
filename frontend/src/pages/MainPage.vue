<template>
  <q-page>
    <q-btn
      label="Add Article"
      color="primary"
      @click="showAddArticleDialog = true"
    />
    <q-table
      :rows="articles"
      :columns="columns"
      row-key="article_id"
      class="q-mt-md"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editArticle(props.row)" />
          <q-btn
            flat
            icon="delete"
            @click="deleteArticle(props.row.article_id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showAddArticleDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Article</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newArticle!.title" label="Title" />
          <q-input
            v-model="newArticle!.content"
            label="Content"
            type="textarea"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Add"
            color="primary"
            :disabled="isAddButtonDisabled"
            @click="addArticle"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for editing article -->
    <q-dialog v-model="editDialogVisible" >
      <q-card>
        <q-card-section>
          <q-form @submit="submitEdit">
            <q-input v-model="editedArticle!.title" label="Title" />
            <q-input v-model="editedArticle!.content" label="Content" />
            <q-btn
              type="submit"
              label="Save"
              color="primary"
              :disabled="isEditButtonDisabled"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { articleService, Article } from '../api/articleService';
import { QTableProps, useQuasar } from 'quasar';

export default defineComponent({
  name: 'ArticleList',
  setup() {
    const $q = useQuasar();
    const articles = ref<Article[]>([]);
    const showAddArticleDialog = ref(false);
    const newArticle = ref<Article | null>(null);
    const editedArticle = ref<Article | null>(null);
    const editDialogVisible = ref(false);

    const columns: QTableProps['columns'] = [
      {
        name: 'article_id',
        label: 'ID',
        field: 'article_id',
        align: 'left',
        sortable: true,
        required: true,
      },
      {
        name: 'title',
        label: 'Title',
        field: 'title',
        align: 'left',
        sortable: true,
      },
      {
        name: 'content',
        label: 'Content',
        field: 'content',
        align: 'left',
      },
      {
        name: 'actions',
        label: 'Actions',
        field: 'actions',
        align: 'center',
      },
    ];

    const fetchArticles = async () => {
      try {
        articles.value = await articleService.getArticles();
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to fetch articles' });
        console.log(error);
      }
    };

    watch(showAddArticleDialog, (newValue) => {
      if (newValue) {
        newArticle.value = { title: '', content: '' };
      } else {
        newArticle.value = null;
      }
    });

    const addArticle = async () => {
      if (!newArticle.value) {
        $q.notify({ type: 'negative', message: 'Failed to add article' });
        return;
      }
      try {
        const newArticleResponse = await articleService.addArticle(
          newArticle.value as Omit<Article, 'article_id'>
        );
        articles.value.push(newArticleResponse);
        showAddArticleDialog.value = false;
        $q.notify({ type: 'positive', message: 'Article added successfully' });
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to add article' });
        console.log(error);
      }
    };

    const isAddButtonDisabled = computed(() => {
      return (
        !newArticle.value ||
        !newArticle.value.title ||
        !newArticle.value.content
      );
    });

    const editArticle = (article: Article) => {
      editedArticle.value = { ...article };
      editDialogVisible.value = true;
    };

    const submitEdit = async () => {
      if (!editedArticle.value) {
        $q.notify({ type: 'negative', message: 'Failed to add article' });
        return;
      }
      try {
        await articleService.updateArticle(editedArticle.value);
        const index = articles.value.findIndex(
          (article) => article.article_id === editedArticle.value?.article_id
        );
        if (index !== -1) {
          articles.value[index] = editedArticle.value;
          editDialogVisible.value = false;
          $q.notify({
            type: 'positive',
            message: `Article ${editedArticle.value.title} updated successfully`,
          });
        } else {
          $q.notify({ type: 'negative', message: 'Article not found' });
        }
      } catch (error) {
        editDialogVisible.value = false;
        $q.notify({ type: 'negative', message: 'Failed to update article' });
        console.log(error);
      }
    };

    const isEditButtonDisabled = computed(() => {
      return (
        !editedArticle.value ||
        !editedArticle.value.title ||
        !editedArticle.value.content
      );
    });

    const deleteArticle = async (articleId: number) => {
      try {
        await articleService.deleteArticle(articleId);
        const index = articles.value.findIndex(
          (article) => article.article_id === articleId
        );

        if (index !== -1) {
          articles.value.splice(index, 1);
          $q.notify({
            type: 'positive',
            message: 'Article deleted successfully',
          });
        } else {
          $q.notify({ type: 'negative', message: 'Article not found' });
        }
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to delete article' });
        console.log(error);
      }
    };

    onMounted(() => {
      fetchArticles();
    });

    return {
      articles,
      columns,
      showAddArticleDialog,
      newArticle,
      addArticle,
      deleteArticle,
      submitEdit,
      editArticle,
      editDialogVisible,
      editedArticle,
      isAddButtonDisabled,
      isEditButtonDisabled,
    };
  },
});
</script>
