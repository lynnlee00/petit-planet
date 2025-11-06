<template>
    <section class="drafts-container">
        <h2 class="page-title">📝 我的手作草稿</h2>

        <!-- 尚未登入 -->
        <div v-if="!user" class="login-box">
            <p>請先登入管理員帳號以查看草稿 💬</p>
            <button @click="goLogin" class="login-btn">登入</button>
        </div>

        <!-- 草稿清單 -->
        <div v-else>
            <!-- 🌸 新增：快速返回按鈕 -->
            <div class="top-btn-area">
                <button @click="goQuickAdd" class="quick-btn">🪄 返回快速新增</button>
            </div>
            <div v-if="drafts.length" class="draft-list">
                <div v-for="item in drafts" :key="item.id" class="draft-card" @click="editDraft(item)">
                    <h3 class="draft-title">
                        {{ item.title || "未命名手作" }}
                    </h3>
                    <p class="draft-info">
                        <span v-if="item.materials">🪄 材料：{{ item.materials }}</span><br />
                        <span v-if="item.tags?.length">🏷️ 標籤：{{ item.tags.join("、") }}</span><br />
                        <span>📅 建立於：{{ formatDate(item.createdAt) }}</span>
                    </p>
                    <div class="draft-status">未上架</div>
                </div>
            </div>

            <div v-else class="empty-state">
                🌷 目前沒有草稿唷，快去
                <NuxtLink to="/quickAdd" class="link">快速新增</NuxtLink>
                一個新靈感吧！
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initFirebase } from '~/utils/firebase'
import { ref as dbRef, get } from 'firebase/database'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const { db } = initFirebase()
const auth = getAuth()
const router = useRouter()

const user = ref(null)
const drafts = ref([])

onMounted(() => {
    onAuthStateChanged(auth, async (u) => {
        if (u) {
            user.value = u
            await loadDrafts()
        } else {
            user.value = null
        }
    })
})

const goLogin = () => router.push('/login')
const goQuickAdd = () => router.push('/quickAdd')

const loadDrafts = async () => {
    const snapshot = await get(dbRef(db, 'activities'))
    if (snapshot.exists()) {
        const all = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }))
        drafts.value = all.filter(item => !item.isRelease)
    }
}

const editDraft = (item) => {
    router.push(`/activityFormPage?id=${item.id}`)
}

const formatDate = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>

<style scoped>
.drafts-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    text-align: center;
    color: #d0006f;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 20px;
}

.draft-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.draft-card {
    background: #fff8fb;
    border: 2px solid #ffc3e6;
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.draft-card:hover {
    background: #fff0f7;
    transform: scale(1.02);
}

.draft-title {
    font-size: 18px;
    font-weight: bold;
    color: #8b2e8c;
    margin-bottom: 6px;
}

.draft-info {
    color: #444;
    font-size: 14px;
    line-height: 1.5;
}

.draft-status {
    margin-top: 8px;
    display: inline-block;
    background: #ffe8f1;
    color: #d0006f;
    font-weight: bold;
    font-size: 12px;
    border: 1px solid #ffb6d9;
    border-radius: 10px;
    padding: 2px 8px;
}

.empty-state {
    text-align: center;
    margin-top: 30px;
    font-size: 16px;
    color: #8b2e8c;
}

.link {
    color: #d0006f;
    font-weight: bold;
    text-decoration: underline;
}

.login-box {
    background: #fff0f7;
    padding: 20px;
    border-radius: 12px;
    border: 2px dashed #ffb6d9;
    text-align: center;
}

.login-btn {
    margin-top: 10px;
    background: linear-gradient(145deg, #d1f0ff, #a6e3ff);
    border: 2px dashed #79c5e7;
    color: #1a7bb5;
    border-radius: 20px;
    padding: 8px 20px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.login-btn:hover {
    transform: scale(1.05);
    background: linear-gradient(145deg, #a6e3ff, #79c5e7);
}

.top-btn-area {
  text-align: right;
  margin-bottom: 10px;
}

.quick-btn {
  background: linear-gradient(145deg, #ffd6eb, #ffc1e3);
  border: 2px dashed #ffa8d0;
  border-radius: 30px;
  color: #d0006f;
  font-weight: bold;
  font-size: 14px;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(145deg, #ffc1e3, #ffb6d9);
}

</style>
