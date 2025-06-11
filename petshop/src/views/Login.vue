<template>
  <div class="login-container">
    <div class="logo-container">
      <img src="../assets/homelogo.png" alt="宠物商店" class="logo" />
    </div>
    
    <div class="login-box">
      <div class="tab-container">
        <div :class="['tab', { active: activeTab === 'login' }]" @click="switchTab('login')">登录</div>
        <div :class="['tab', { active: activeTab === 'register' }]" @click="switchTab('register')">注册</div>
      </div>
      
      <div v-if="activeTab === 'login'" class="login-form">
        <h2>欢迎来到萌宠之家</h2>
        
        <div class="form-item">
          <label>用户名</label>
          <div class="input-container">
            <i class="icon user-icon"></i>
            <input type="text" v-model="loginForm.username" placeholder="请输入用户名" />
          </div>
        </div>
        
        <div class="form-item">
          <label>密码</label>
          <div class="input-container">
            <i class="icon password-icon"></i>
            <input type="password" v-model="loginForm.password" placeholder="请输入密码" />
            <i class="icon eye-icon" @click="togglePasswordVisibility"></i>
          </div>
        </div>
        
        <div class="remember-container">
          <label class="checkbox">
            <input type="checkbox" v-model="loginForm.remember" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-link">忘记密码?</a>
        </div>
        
        <button class="login-button" @click="handleLogin">登录</button>
        
        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="other-login-icons">
            <div class="icon-wrapper">
              <i class="wechat-icon"></i>
            </div>
            <div class="icon-wrapper">
              <i class="phone-icon"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="activeTab === 'register'" class="register-form">
        <h2>快速注册</h2>
        
        <div class="form-item">
          <label>用户名</label>
          <div class="input-container">
            <i class="icon user-icon"></i>
            <input type="text" v-model="registerForm.username" placeholder="请输入用户名" />
          </div>
        </div>
        
        <div class="form-item">
          <label>昵称</label>
          <div class="input-container">
            <i class="icon user-icon"></i>
            <input type="text" v-model="registerForm.nickname" placeholder="请输入昵称（选填）" />
          </div>
        </div>
        
        <div class="form-item">
          <label>密码</label>
          <div class="input-container">
            <i class="icon password-icon"></i>
            <input type="password" v-model="registerForm.password" placeholder="请输入密码" />
            <i class="icon eye-icon" @click="toggleRegPasswordVisibility"></i>
          </div>
        </div>
        
        <div class="form-item">
          <label>确认密码</label>
          <div class="input-container">
            <i class="icon password-icon"></i>
            <input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码" />
            <i class="icon eye-icon" @click="toggleConfirmPasswordVisibility"></i>
          </div>
        </div>
        
        <button class="register-button" @click="handleRegister">立即注册</button>
        
        <div class="login-link">
          <span>已有账号？</span>
          <a href="#" @click.prevent="switchTab('login')">去登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { AUTH_API } from '../api/config'
import { TOKEN_KEY, REMEMBERED_USERNAME_KEY } from '../config'

const router = useRouter()
const activeTab = ref('login')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const passwordVisible = ref(false)
const regPasswordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const switchTab = (tab: string) => {
  activeTab.value = tab
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
  const passwordInput = document.querySelector('.login-form .input-container input[type="password"]') as HTMLInputElement
  if (passwordInput) {
    passwordInput.type = passwordVisible.value ? 'text' : 'password'
  }
}

const toggleRegPasswordVisibility = () => {
  regPasswordVisible.value = !regPasswordVisible.value
  const passwordInput = document.querySelector('.register-form .input-container input[type="password"]') as HTMLInputElement
  if (passwordInput) {
    passwordInput.type = regPasswordVisible.value ? 'text' : 'password'
  }
}

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value
  const passwordInputs = document.querySelectorAll('.register-form .input-container input[type="password"]')
  if (passwordInputs && passwordInputs.length > 1) {
    const confirmInput = passwordInputs[1] as HTMLInputElement
    confirmInput.type = confirmPasswordVisible.value ? 'text' : 'password'
  }
}

const handleLogin = async () => {
  // 表单验证
  if (!loginForm.username || !loginForm.password) {
    alert('请填写用户名和密码')
    return
  }
  
  try {
    console.log('准备发送登录请求，URL:', AUTH_API.LOGIN)
    console.log('请求数据:', { username: loginForm.username, password: '***' })
    
    const response = await axios.post(AUTH_API.LOGIN, {
      username: loginForm.username,
      password: loginForm.password
    })
    
    console.log('登录响应:', response.data)
    
    // 根据后端实际返回结构修改：直接访问 accessToken 和 role
    if (response.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.data.accessToken)
      
      // 保存用户名用于显示
      localStorage.setItem('username', loginForm.username)
      
      console.log('已保存令牌:', response.data.accessToken)
      console.log('用户角色:', response.data.role)
      
      // 如果用户选择了记住用户名，则保存
      if (loginForm.remember) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, loginForm.username)
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY)
      }
      
      alert('登录成功')
      
      // 添加请求头到axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
      
      // 根据用户角色直接判断并跳转（修改为使用 response.data.role）
      if (response.data.role === 1) {
        // 管理员跳转到管理员页面
        console.log('管理员用户，跳转到管理页面')
        router.push('/admin')
      } else {
        // 普通用户跳转到首页
        console.log('普通用户，跳转到首页')
        router.push('/')
      }
    } else {
      console.error('响应中没有包含令牌')
      alert('登录失败：服务器响应异常')
    }
  } catch (error: any) {
    console.error('登录请求错误:', error)
    alert(error.response?.data?.message || '登录失败，请稍后重试')
  }
}

const handleRegister = async () => {
  // 表单验证
  if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
    alert('请填写所有必填项')
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  try {
    // 调试信息
    console.log('准备发送注册请求，URL:', AUTH_API.REGISTER)
    console.log('请求数据:', { 
      username: registerForm.username, 
      password: '***',
      nickname: registerForm.nickname || registerForm.username 
    })
    
    const response = await axios.post(AUTH_API.REGISTER, {
      username: registerForm.username,
      password: registerForm.password,
      nickname: registerForm.nickname || registerForm.username // 如果昵称为空，使用用户名
    })
    
    // 调试信息
    console.log('注册响应:', response.data)
    
    alert('注册成功，请登录')
    // 清空注册表单
    registerForm.username = ''
    registerForm.nickname = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    // 切换到登录页
    switchTab('login')
  } catch (error: any) {
    console.error('注册请求错误:', error)
    console.error('错误详情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    })
    alert(error.response?.data?.message || '注册失败，请稍后重试')
  }
}

// 在页面加载时检查是否有记住的用户名
onMounted(() => {
  const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY)
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #FEF8ED;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 120px;
  height: auto;
}

.login-box {
  width: 450px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-container {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  cursor: pointer;
  color: #666;
  position: relative;
}

.tab.active {
  color: #F77F00;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #F77F00;
}

.login-form, .register-form {
  padding: 30px;
}

h2 {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
}

.input-container input {
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 0 10px;
}

.icon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}

.remember-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 8px;
}

.forgot-link {
  color: #F77F00;
  text-decoration: none;
  font-size: 14px;
}

.login-button, .register-button {
  width: 100%;
  height: 44px;
  background-color: #F77F00;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.login-button:hover, .register-button:hover {
  background-color: #E57100;
}

.other-login {
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #eee;
}

.divider span {
  padding: 0 10px;
}

.other-login-icons {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #F77F00;
  text-decoration: none;
  margin-left: 5px;
}

.user-icon, .password-icon, .email-icon, .phone-icon, .wechat-icon, .eye-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
}

.user-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
}

.password-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>');
}

.email-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>');
}

.eye-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
  cursor: pointer;
}

.wechat-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2307C160"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c1.25.56 2.66.84 4 .84h.31c-.41-.7-.67-1.5-.69-2.34A6.48 6.48 0 0 1 16.5 8c0-.63-.11-1.23-.29-1.8C14.69 4.92 12.38 4 9.5 4zm-.5 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z M16.5 9c-3.31 0-6 2.12-6 4.72 0 2.61 2.69 4.72 6 4.72.75 0 1.47-.12 2.12-.34L22 20l-1.08-2.34c1.24-.88 2.08-2.2 2.08-3.66 0-2.6-2.69-4.72-6-4.72zm-3 3.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>');
}

.phone-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231677FF"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>');
}
</style>