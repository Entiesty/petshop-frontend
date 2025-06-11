<template>
  <div class="ai-assistant-container">
    <header class="chat-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>AI宠物助手</h1>
    </header>

    <div class="chat-container" ref="chatContainer">
      <div class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          :class="['message', message.isUser ? 'user-message' : 'ai-message']"
        >
          <div class="message-avatar">
            <el-icon v-if="message.isUser"><User /></el-icon>
            <el-icon v-else><ChatRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.text)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <div v-if="loading" class="message ai-message">
          <div class="message-avatar">
            <el-icon><ChatRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="loading-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <el-input
        v-model="userInput"
        placeholder="请输入您的问题..."
        :disabled="loading"
        @keyup.enter="sendMessage"
        class="message-input"
        :autosize="{ minRows: 1, maxRows: 4 }"
        type="textarea"
      />
      <el-button 
        type="primary" 
        :disabled="loading || !userInput.trim()" 
        @click="sendMessage" 
        class="send-button"
      >
        <el-icon><Position /></el-icon>
      </el-button>
    </div>

    <!-- 超时提示弹窗 -->
    <el-dialog
      v-model="timeoutDialogVisible"
      title="请求超时"
      width="80%"
      center
    >
      <span>与AI助手的连接超时，大模型可能正在处理较复杂的问题。您可以：</span>
      <div class="timeout-options">
        <p>1. 点击重试，等待AI继续处理</p>
        <p>2. 简化您的问题，使其更容易回答</p>
        <p>3. 稍后再试，服务器可能正在忙碌中</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timeoutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="retryLastQuestion">
            重试
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { ArrowLeft, User, ChatRound, Position } from '@element-plus/icons-vue'

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

const router = useRouter()
const chatContainer = ref<HTMLElement | null>(null)
const userInput = ref('')
const loading = ref(false)
const timeoutDialogVisible = ref(false)
const lastQuestion = ref('')
const messages = ref<Message[]>([
  {
    text: '您好！我是萌宠情报局的AI助手，有关于宠物的任何问题都可以问我哦！',
    isUser: false,
    timestamp: new Date()
  }
])

// 创建自定义axios实例，增加超时时间
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 设置为60秒，因为大模型处理可能需要较长时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加响应拦截器处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求错误:', error)
    
    // 特别处理超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      timeoutDialogVisible.value = true
      return Promise.reject({ isTimeout: true, message: '请求超时，大模型可能需要更多时间处理您的问题' })
    }
    
    return Promise.reject(error)
  }
)

// 发送消息到后端
const sendMessage = async () => {
  const question = userInput.value.trim()
  if (!question || loading.value) return

  // 保存当前问题以便重试
  lastQuestion.value = question

  // 添加用户消息到聊天记录
  messages.value.push({
    text: question,
    isUser: true,
    timestamp: new Date()
  })
  
  // 清空输入框并滚动到底部
  userInput.value = ''
  await scrollToBottom()
  
  // 显示加载状态
  loading.value = true
  
  try {
    // 调用后端API，使用自定义客户端
    const response = await apiClient.post('/user/ai/chat', {
      question: question
    })
    
    // 添加AI回复到聊天记录
    if (response.data && response.data.reply) {
      messages.value.push({
        text: response.data.reply,
        isUser: false,
        timestamp: new Date()
      })
    } else {
      throw new Error('回复内容为空')
    }
  } catch (error: any) {
    console.error('AI助手请求失败:', error)
    
    // 超时错误已经显示弹窗，不需要额外添加错误消息
    if (!error.isTimeout) {
      // 显示错误消息
      const errorMsg = error.response?.data?.reply || error.message || '无法连接到服务器'
      
      messages.value.push({
        text: `抱歉，我遇到了一些问题：${errorMsg}`,
        isUser: false,
        timestamp: new Date()
      })
      
      ElMessage.error('AI助手暂时不可用，请稍后再试')
    }
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

// 重试上一次的问题
const retryLastQuestion = async () => {
  if (!lastQuestion.value) return
  
  timeoutDialogVisible.value = false
  loading.value = true
  
  try {
    // 使用更长的超时时间重试
    const response = await apiClient.post('/user/ai/chat', {
      question: lastQuestion.value
    }, { timeout: 120000 }) // 重试时使用2分钟超时
    
    if (response.data && response.data.reply) {
      messages.value.push({
        text: response.data.reply,
        isUser: false,
        timestamp: new Date()
      })
      ElMessage.success('获取回复成功！')
    } else {
      throw new Error('回复内容为空')
    }
  } catch (error: any) {
    console.error('重试失败:', error)
    
    const errorMsg = error.response?.data?.reply || error.message || '无法连接到服务器'
    
    messages.value.push({
      text: `抱歉，重试失败：${errorMsg}`,
      isUser: false,
      timestamp: new Date()
    })
    
    ElMessage.error('重试失败，请稍后再尝试')
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

// 格式化消息内容，支持简单的换行
const formatMessage = (text: string): string => {
  return text.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 滚动到底部
const scrollToBottom = async (): Promise<void> => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 返回上一页
const goBack = (): void => {
  router.back()
}

// 在组件挂载后滚动到底部
onMounted(async () => {
  await scrollToBottom()
})
</script>

<style scoped>
.ai-assistant-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #fff;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #409eff;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  margin-right: 15px;
  cursor: pointer;
  font-size: 20px;
}

h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  height: calc(100vh - 130px); /* 减去头部和输入框的高度 */
  max-height: calc(100vh - 130px);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 15px;
}

.message {
  display: flex;
  margin-bottom: 10px;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.ai-message {
  margin-right: auto;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background-color: #409eff;
  color: white;
}

.ai-message .message-avatar {
  background-color: #67c23a;
  color: white;
}

.message-content {
  background-color: white;
  padding: 10px 15px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

.user-message .message-content {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 4px;
}

.ai-message .message-content {
  background-color: white;
  border-top-left-radius: 4px;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.input-container {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e6e6e6;
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.message-input {
  flex: 1;
  margin-right: 10px;
}

.send-button {
  width: 50px;
}

/* 超时弹窗样式 */
.timeout-options {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.timeout-options p {
  margin: 8px 0;
}

/* 加载动画 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.loading-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 3px;
  background-color: #409eff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .message {
    max-width: 90%;
  }
  
  .chat-container {
    height: calc(100vh - 120px);
    max-height: calc(100vh - 120px);
  }
}
</style> 
