<script setup>
const event = useRequestEvent()
const router = useRouter()
const route = useRoute()
const page = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug

if (event) {
  setResponseStatus(event, 404)
}
</script>

<template>
  <div class="not-found">
    <h2 class="text-danger">404 - 找不到頁面</h2>
    <p>您所尋找的頁面不存在</p>
    <button type="button" class="btn btn-primary" @click="router.push('/')">
      返回首頁
    </button>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.not-found h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>