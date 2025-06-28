<template>
  <table class="api-table">
    <thead>
      <tr>
        <th>HTTP 메서드</th>
        <th>경로</th>
        <th>설명</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(desc, route) in endpoints" :key="route">
        <td><code>{{ parseMethod(route) }}</code></td>
        <td><code>{{ parsePath(route) }}</code></td>
        <td>{{ desc }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
defineProps<{ endpoints: Record<string, string> }>();

function parseMethod(route: string) {
  return route.split(' ')[0];
}
function parsePath(route: string) {
  return route.split(' ').slice(1).join(' ');
}
</script>

<style scoped>
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
</style> 