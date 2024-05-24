import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const API_URL = 'http://127.0.0.1:5000/api/articles';

export interface Article {
  article_id?: number;
  title: string;
  content: string;
}

const mock = new MockAdapter(axios);

// Mocked data
const articles: Article[] = [
  {
    article_id: 1,
    title: 'How to write "Hello World" in Python',
    content: 'print("Hello world!)',
  },
  {
    article_id: 2,
    title: 'How to write "Hello World" in JS',
    content: 'console.log("Hello world!")',
  },
];
let nextArticleId = articles.length + 1;

mock.onGet(API_URL).reply(200, articles);

mock.onPost(`${API_URL}`).reply((config) => {
  const newArticle = JSON.parse(config.data);
  newArticle.article_id = nextArticleId;
  nextArticleId++;
  articles.push(newArticle);
  return [200, newArticle];
});

mock.onPut(new RegExp(`${API_URL}/*`)).reply((config) => {
  const updatedArticle = JSON.parse(config.data);
  const articleIndex = articles.findIndex(
    (article) => article.article_id === updatedArticle.article_id
  );
  if (articleIndex !== -1) {
    articles[articleIndex] = updatedArticle;
    return [200, updatedArticle];
  } else {
    return [404, { message: 'Article not found' }];
  }
});

mock.onDelete(new RegExp(`${API_URL}/*`)).reply((config) => {
  if (config.url) {
    const urlParts = config.url.split('/');
    const articleId = parseInt(urlParts[urlParts.length - 1], 10);
    if (!isNaN(articleId)) {
      const articleIndex = articles.findIndex(
        (article) => article.article_id === articleId
      );
      if (articleIndex !== -1) {
        articles.splice(articleIndex, 1);
        return [200];
      } else {
        return [404, { message: 'Article not found' }];
      }
    }
  }
  return [400, { message: 'Invalid request' }];
});

export const articleService = {
  async getArticles(): Promise<Article[]> {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },
  async addArticle(article: Omit<Article, 'article_id'>): Promise<Article> {
    const response = await axios.post(`${API_URL}`, article);
    return response.data as Article;
  },
  async updateArticle(article: Article): Promise<Article> {
    const response = await axios.put(
      `${API_URL}/${article.article_id}`,
      article
    );
    return response.data as Article;
  },
  async deleteArticle(articleId: number): Promise<void> {
    await axios.delete(`${API_URL}/${articleId}`);
  },
};
