<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>头像</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.nickname }}</td>
            <td>
              <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.nickname" class="user-avatar">
              <span v-else class="no-avatar">无头像</span>
            </td>
            <td>
              <span :class="['role-badge', user.role === 1 ? 'admin' : 'user']">
                {{ user.role === 1 ? '管理员' : '会员' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <button @click="viewUserAddresses(user.id)" class="view-btn">查看地址</button>
              <button @click="deleteUser(user.id)" class="delete-btn" :disabled="user.role === 1">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage <= 1" class="page-btn">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">下一页</button>
    </div>

    <!-- 用户地址模态框 -->
    <div v-if="showAddressModal" class="modal-overlay" @click="closeAddressModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>用户收货地址</h3>
          <button @click="closeAddressModal" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div v-if="userAddresses.length === 0" class="no-data">
            该用户暂无收货地址
          </div>
          <div v-else class="address-list">
            <div v-for="address in userAddresses" :key="address.id" class="address-item">
              <div class="address-info">
                <h4>{{ address.contactName }} {{ address.phone }}</h4>
                <p>{{ address.province }} {{ address.city }} {{ address.district }}</p>
                <p>{{ address.street }}</p>
                <span v-if="address.isDefault" class="default-badge">默认地址</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ADMIN_API } from '../../api/config'

interface User {
  id: number
  username: string
  nickname: string
  avatarUrl?: string
  role: number
  createdAt: string
}

interface Address {
  id: number
  userId: number
  contactName: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const users = ref<User[]>([])
const userAddresses = ref<Address[]>([])
const showAddressModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const totalUsers = ref(0)

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await fetch(`${ADMIN_API.USERS.LIST}?current=${currentPage.value}&size=${pageSize.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    users.value = data.records || []
    totalUsers.value = data.total || 0
    totalPages.value = Math.ceil(totalUsers.value / pageSize.value)
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 删除用户 - 修正API调用
const deleteUser = async (userId: number) => {
  if (confirm('确定要删除这个用户吗？此操作不可恢复！')) {
    try {
      await fetch(`${ADMIN_API.USERS.DELETE}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await fetchUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }
}

// 查看用户地址 - 修正API调用
const viewUserAddresses = async (userId: number) => {
  try {
    const response = await fetch(`${ADMIN_API.USERS.ADDRESSES}/${userId}/addresses`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    userAddresses.value = data || []
    showAddressModal.value = true
  } catch (error) {
    console.error('获取用户地址失败:', error)
    userAddresses.value = []
    showAddressModal.value = true
  }
}

const closeAddressModal = () => {
  showAddressModal.value = false
  userAddresses.value = []
}

// 分页操作
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchUsers()
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.user-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.user-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

.user-table tbody tr:hover {
  background: #f9f9f9;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.no-avatar {
  color: #999;
  font-size: 12px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: #fff2e8;
  color: #fa8c16;
}

.role-badge.user {
  background: #f6ffed;
  color: #52c41a;
}

.view-btn {
  padding: 4px 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
}

.delete-btn {
  padding: 4px 8px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-content {
  padding: 24px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.address-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.address-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.default-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #52c41a;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  margin-top: 8px;
}
</style>