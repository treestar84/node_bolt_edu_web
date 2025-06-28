<template>
  <div class="api-guide">
    <div class="guide-header">
      <div class="container">
        <div class="header-content">
          <router-link to="/" class="back-link">
            ← 홈으로 돌아가기
          </router-link>
          <h1 class="guide-title">API 사용 가이드</h1>
          <p class="guide-subtitle">N8n과 연동하여 콘텐츠를 자동으로 관리하는 방법</p>
        </div>
      </div>
    </div>

    <div class="guide-content">
      <div class="container">
        <div class="guide-nav">
          <h3>목차</h3>
          <ul>
            <li><a href="#overview">개요</a></li>
            <li><a href="#authentication">인증</a></li>
            <li><a href="#auth-api">인증 API</a></li>
            <li><a href="#words-api">단어 API</a></li>
            <li><a href="#books-api">책 API</a></li>
            <li><a href="#upload-api">파일 업로드 API</a></li>
            <li><a href="#keys-api">API 키</a></li>
            <li><a href="#n8n-examples">N8n 예제</a></li>
            <li><a href="#error-handling">오류 처리</a></li>
          </ul>
        </div>

        <div class="guide-sections">
          <section id="overview">
            <h2>개요</h2>
            <div v-if="error" class="error">{{ error }}</div>
            <div v-else-if="!apiDoc">API 문서를 불러오는 중...</div>
            <div v-else>
              <h3>{{ apiDoc.title }}</h3>
              <p>{{ apiDoc.description }}</p>
              <p><strong>Base URL:</strong> {{ apiDoc.baseUrl }}</p>
              <p><strong>버전:</strong> {{ apiDoc.version }}</p>
            </div>
          </section>

          <section id="authentication" v-if="apiDoc">
            <h2>인증</h2>
            <div v-if="apiDoc.authentication">
              <p><strong>관리자 인증:</strong> Authorization 헤더에 Bearer 토큰 사용</p>
              <code>Authorization: Bearer &lt;admin_token&gt;</code>
              <p><strong>API 인증:</strong> X-API-Key 헤더 사용</p>
              <code>X-API-Key: &lt;api_key&gt;</code>
            </div>
          </section>

          <section id="auth-api" v-if="apiDoc">
            <h2>인증 API</h2>
            <ApiTable :endpoints="apiDoc.endpoints.auth" />
          </section>

          <section id="words-api" v-if="apiDoc">
            <h2>단어 API</h2>
            <ApiTable :endpoints="apiDoc.endpoints.words" />
          </section>

          <section id="books-api" v-if="apiDoc">
            <h2>책 API</h2>
            <ApiTable :endpoints="apiDoc.endpoints.books" />
          </section>

          <section id="upload-api" v-if="apiDoc">
            <h2>파일 업로드 API</h2>
            <ApiTable :endpoints="apiDoc.endpoints.upload" />
          </section>

          <section id="keys-api" v-if="apiDoc">
            <h2>API 키</h2>
            <ApiTable :endpoints="apiDoc.endpoints.keys" />
          </section>

          <section id="n8n-examples">
            <h2>N8n 예제</h2>
            <p>여기에 N8n 워크플로우 예시를 추가할 수 있습니다.</p>
          </section>

          <section id="error-handling">
            <h2>오류 처리</h2>
            <p>API 호출 시 발생할 수 있는 오류와 예시를 여기에 추가할 수 있습니다.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ApiTable from '@/components/ApiTable.vue';

const apiDoc = ref<any>(null);
const error = ref('');

onMounted(async () => {
  try {
    const res = await fetch('/api/docs');
    if (!res.ok) throw new Error('API 문서 불러오기 실패');
    apiDoc.value = await res.json();
  } catch (e: any) {
    error.value = e.message || '알 수 없는 오류';
  }
});
</script>

<style scoped>
.api-guide {
  font-family: 'Pretendard', sans-serif;
}
.api-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
.api-table th, .api-table td {
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
}
.api-table th {
  background: #f5f5f5;
}
.error {
  color: #e74c3c;
  font-weight: bold;
}
</style>