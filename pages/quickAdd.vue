<template>
    <section class="quick-container">
        <h2 class="title">🌸 快速新增小手作靈感</h2>

        <!-- 登入狀態 -->
        <div v-if="!user" class="login-box">
            <p>請先登入管理員帳號以使用此功能 💬</p>
            <button @click="goLogin" class="login-btn">登入</button>
        </div>

        <!-- 新增表單 -->
        <div v-else class="form-box">
            <input v-model="title" placeholder="✏️ 手作名稱（必填）" class="input" @keyup.enter="saveDraft" />
            <textarea v-model="materials" placeholder="🪄 材料（例如：紙、膠水、筆）" class="textarea"></textarea>
            <input v-model="tags" placeholder="🏷️ 標籤（用逗號分隔）" class="input" />
            <textarea v-model="note" placeholder="💡 靈感筆記（可留空）" class="textarea"></textarea>

            <button @click="saveDraft" class="save-btn" :disabled="isSaving">
                {{ isSaving ? "儲存中..." : "💾 儲存草稿" }}
            </button>

            <!-- 🌷 新增：快速連結到草稿列表 -->
            <button @click="goDrafts" class="drafts-btn">📝 前往草稿列表</button>

            <p v-if="message" class="message">{{ message }}</p>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { initFirebase } from "~/utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, push, set } from "firebase/database";

const { db } = initFirebase();
const auth = getAuth();
const router = useRouter();

const user = ref(null);
const title = ref("");
const materials = ref("");
const tags = ref("");
const note = ref("");
const isSaving = ref(false);
const message = ref("");

onMounted(() => {
    onAuthStateChanged(auth, (u) => {
        user.value = u || null;
    });
});

const goLogin = () => router.push("/login");
const goDrafts = () => router.push("/drafts"); // 🌟 新增這一行

const resetForm = () => {
    title.value = "";
    materials.value = "";
    tags.value = "";
    note.value = "";
};

const saveDraft = async () => {
    if (isSaving.value) return;
    if (!title.value.trim()) {
        message.value = "⚠️ 請輸入手作名稱!!";
        return;
    }

    isSaving.value = true;
    message.value = "";

    try {
        const newRef = push(dbRef(db, "activities"));
        await set(newRef, {
            title: title.value.trim(),
            materials: materials.value.trim(),
            tags: tags.value ? tags.value.split(",").map((t) => t.trim()) : [],
            note: note.value.trim(),
            isRelease: false,
            createdAt: new Date().toISOString(),
            image: "https://raw.githubusercontent.com/lynnlee00/my-images/refs/heads/main/commingSoon.png",
        });

        message.value = "✅ 已儲存草稿！可繼續新增下一筆!! ✨";
        resetForm();

        setTimeout(() => {
            message.value = "";
        }, 3000);
    } catch (err) {
        message.value = "❌ 儲存失敗：" + err.message;
    } finally {
        isSaving.value = false;
    }
};
</script>

<style scoped>
.quick-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.title {
    color: #d0006f;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 20px;
}

.input,
.textarea {
    width: 100%;
    padding: 10px 14px;
    margin-bottom: 12px;
    border: 2px solid #ffc3e6;
    border-radius: 12px;
    font-size: 16px;
    box-sizing: border-box;
    transition: 0.2s;
}

.input:focus,
.textarea:focus {
    outline: none;
    border-color: #e44fad;
    box-shadow: 0 0 8px rgba(228, 79, 173, 0.3);
}

.textarea {
    min-height: 80px;
}

.save-btn {
    background: linear-gradient(145deg, #ffd6eb, #ffc1e3);
    border: 2px dashed #ffa8d0;
    border-radius: 30px;
    color: #d0006f;
    font-weight: bold;
    font-size: 18px;
    padding: 10px 24px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
}

.save-btn:hover {
    transform: scale(1.05);
    background: linear-gradient(145deg, #ffc1e3, #ffb6d9);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* 🌷 新增的「前往草稿」按鈕樣式 */
.drafts-btn {
    background: linear-gradient(145deg, #d1f0ff, #a6e3ff);
    border: 2px dashed #79c5e7;
    border-radius: 30px;
    color: #1a7bb5;
    font-weight: bold;
    font-size: 16px;
    padding: 8px 20px;
    margin-top: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.drafts-btn:hover {
    transform: scale(1.05);
    background: linear-gradient(145deg, #a6e3ff, #79c5e7);
}

.message {
    margin-top: 10px;
    font-weight: bold;
    color: #8b2e8c;
}

.login-box {
    background: #fff0f7;
    padding: 20px;
    border-radius: 12px;
    border: 2px dashed #ffb6d9;
}

.login-btn {
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
</style>
