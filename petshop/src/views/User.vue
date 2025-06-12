<template>
  <div class="user-container">
    <div class="user-content">
      <!-- 左侧用户信息和菜单 -->
      <div class="user-sidebar">
        <div class="user-info">
          <div class="avatar">
            <img :src="userProfile.avatarUrl || '../assets/homelogo.png'" alt="用户头像" />
            <div class="vip-badge">会员</div>
            <div class="avatar-edit" @click="showAvatarDialog">
              <i class="el-icon-edit"></i>
            </div>
          </div>
          <div class="user-detail">
            <div class="username">{{ userProfile.nickname || userProfile.username }}</div>
            <div class="phone">{{ userProfile.phone || '未设置' }}</div>
            <div class="user-actions">
              <el-button type="text" @click="showProfileDialog">编辑资料</el-button>
              <el-button type="text" @click="showPasswordDialog">修改密码</el-button>
            </div>
          </div>
        </div>
        
        <div class="user-menu">
          <div class="menu-title" :class="{ active: activeTab === 'address' }" @click="setActiveTab('address')">收货地址管理</div>
          <div class="menu-title" :class="{ active: activeTab !== 'address' }">我的订单</div>
          <div class="sub-menu">
            <div class="menu-item" :class="{ active: activeTab === 'all' }" @click="setActiveTab('all')">全部订单</div>
            <div class="menu-item" :class="{ active: activeTab === 'pending' }" @click="setActiveTab('pending')">待付款</div>
            <div class="menu-item" :class="{ active: activeTab === 'shipping' }" @click="setActiveTab('shipping')">待发货</div>
            <div class="menu-item" :class="{ active: activeTab === 'receiving' }" @click="setActiveTab('receiving')">待收货</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="user-main">
        <div v-if="activeTab === 'address'" class="section address-section">
          <div class="section-header">
            <h2>收货地址管理</h2>
            <el-button type="primary" size="small" @click="addNewAddress">新增地址</el-button>
          </div>
          
          <div class="address-list">
            <el-empty v-if="addresses.length === 0" description="暂无收货地址"></el-empty>
            <div class="address-item" v-for="(address, index) in addresses" :key="address.id">
              <div class="address-content">
                <div class="contact-info">
                  <span class="contact-name">{{ address.contactName }}</span>
                  <span class="contact-phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-text">{{ formatAddress(address) }}</div>
              </div>
              <div class="address-actions">
                <el-button type="text" @click="setAsDefault(address)" v-if="!address.isDefault">设为默认</el-button>
                <el-button type="text" @click="editAddress(address)">编辑</el-button>
                <el-button type="text" @click="confirmDeleteAddress(address)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="section order-section">
          <div class="section-header">
            <h2>我的订单</h2>
          </div>
          
          <div class="order-tabs">
            <div class="tab" :class="{ active: activeTab === 'all' }" @click="setActiveTab('all')">全部订单</div>
            <div class="tab" :class="{ active: activeTab === 'pending' }" @click="setActiveTab('pending')">待付款</div>
            <div class="tab" :class="{ active: activeTab === 'shipping' }" @click="setActiveTab('shipping')">待发货</div>
            <div class="tab" :class="{ active: activeTab === 'receiving' }" @click="setActiveTab('receiving')">待收货</div>
          </div>
          
          <div class="order-list">
            <div class="order-item" v-for="order in filteredOrders" :key="order.id">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number">订单号：{{ order.orderNo }}</span>
                  <span class="order-date">{{ order.createdAtFormatted }}</span>
                </div>
                <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
              </div>
              
              <div class="order-product">
                <div class="product-image">
                  <img :src="order.productImage || '/assets/product-default.jpg'" alt="商品图片" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ order.productName }}</div>
                  <div class="product-desc">{{ order.productDesc }}</div>
                </div>
                <div class="product-price">
                  <div class="price">¥{{ order.price }}</div>
                  <div class="quantity">x{{ order.quantity || 1 }}</div>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">
                  共<span class="count">{{ order.quantity || 1 }}</span>件商品 
                  实付款：<span class="total-price">¥{{ order.totalAmount }}</span>
                </div>
                <div class="order-actions">
                  <el-button 
                    v-if="order.status === 10"
                    type="primary" 
                    size="small"
                    @click="payOrder(order)"
                  >
                    去支付
                  </el-button>
                  <el-button 
                    v-if="order.status === 30"
                    type="success" 
                    size="small"
                    @click="confirmReceive(order)"
                  >
                    确认收货
                  </el-button>
                  <el-button 
                    type="default" 
                    size="small"
                    @click="viewOrderDetail(order)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑地址对话框 -->
    <el-dialog
      v-model="addressDialogVisible"
      :title="isEditingAddress ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form 
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="100px"
      >
        <el-form-item label="收货人" prop="contactName">
          <el-input v-model="addressForm.contactName" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="street">
          <el-input
            v-model="addressForm.street"
            type="textarea"
            placeholder="请输入详细地址"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="地图选点">
          <div class="map-selector">
            <div class="map-container" ref="addressMapContainer" style="height: 300px; border: 1px solid #ddd; border-radius: 4px;"></div>
            <div class="map-actions">
              <el-button size="small" @click="getCurrentLocation">获取当前位置</el-button>
              <el-button size="small" @click="searchAddress" :disabled="!addressForm.street">搜索地址</el-button>
              <el-button size="small" @click="clearMapSelection">清除选择</el-button>
            </div>
            <div class="selected-location" v-if="selectedLocation.address">
              <span class="location-label">已选位置：</span>
              <span class="location-text">{{ selectedLocation.address }}</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveAddress">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 头像更新对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更新头像"
      width="400px"
    >
      <el-form>
        <el-form-item label="头像图片">
          <div class="file-upload-group">
            <input 
              ref="avatarFileInput" 
              type="file" 
              accept="image/*" 
              @change="handleAvatarUpload" 
              style="display: none;"
            >
            <div class="upload-area" @click="triggerAvatarUpload">
              <div v-if="avatarForm.avatarUrl" class="preview-container">
                <img :src="avatarForm.avatarUrl" alt="头像预览" class="avatar-preview">
                <div class="upload-overlay">
                  <span>点击更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <span>点击上传头像图片</span>
              </div>
            </div>
            <button 
              v-if="avatarForm.avatarUrl" 
              type="button" 
              @click="clearAvatar" 
              class="clear-btn"
            >
              清除图片
            </button>
          </div>
        </el-form-item>
        <el-form-item label="或直接输入URL">
          <el-input v-model="avatarForm.avatarUrl" placeholder="请输入头像图片URL" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateAvatar">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 个人资料更新对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="编辑个人资料"
      width="500px"
    >
      <el-form 
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateProfile">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 密码修改对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password"
            placeholder="请输入当前密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password"
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password"
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="updatePassword">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { USER_API } from '../api/config'
// 导入省市区数据
import { regionData } from 'element-china-area-data'

// 扩展Window接口以包含AMap
declare global {
  interface Window {
    AMap: any;
  }
}

// 定义类型
interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  role: number;
  phone: string;
  email: string;
}

interface Address {
  id: number;
  contactName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNo: string;
  status: number;
  totalAmount: number;
  createdAt: string;
  paymentTime: string | null;
  productImage: string;
  productName: string;
  productDesc: string;
  price: number;
  quantity: number;
  items: any[];
  statusText?: string;
  createdAtFormatted?: string;
}

interface AddressForm {
  id: number;
  contactName: string;
  phone: string;
  region: string[];
  province: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

const router = useRouter()
const loading = ref(true)
const addressDialogVisible = ref(false)
const avatarDialogVisible = ref(false)
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const isEditingAddress = ref(false)
const addressFormRef = ref<any>(null)
const profileFormRef = ref<any>(null)
const passwordFormRef = ref<any>(null)
const activeTab = ref('all')
const avatarUploading = ref(false)
const addressMapContainer = ref<HTMLElement>()
const addressMap = ref<any>(null)
const addressMarker = ref<any>(null)

// 地图选择的位置信息
const selectedLocation = ref({
  lng: 0,
  lat: 0,
  address: ''
})

// 用户资料
const userProfile = ref<UserProfile>({
  id: 0,
  username: '',
  nickname: '',
  avatarUrl: '',
  role: 0,
  phone: '',
  email: ''
})

// 收货地址列表
const addresses = ref<Address[]>([])

// 订单列表
const orders = ref<Order[]>([])

// 地址表单
const addressForm = reactive<AddressForm>({
  id: 0,
  contactName: '',
  phone: '',
  region: [], // 存储省市区选择结果
  province: '',
  city: '',
  district: '',
  street: '',
  isDefault: false
})

// 头像表单
const avatarForm = reactive({
  avatarUrl: ''
})

const avatarFileInput = ref<HTMLInputElement>()

// 个人资料表单
const profileForm = reactive({
  nickname: '',
  phone: '',
  email: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 地址表单验证规则
const addressRules = {
  contactName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  street: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

// 个人资料表单验证规则
const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 使用element-china-area-data提供的省市区数据
const regionOptions = regionData

// 根据Tab筛选订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  
  const statusMap: Record<string, number> = {
    'pending': 10, // 待付款
    'shipping': 20, // 待发货
    'receiving': 30 // 待收货
  }
  
  return orders.value.filter(order => order.status === statusMap[activeTab.value])
})

// 设置当前活动标签
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// 格式化地址
const formatAddress = (address: any) => {
  return `${address.province} ${address.city} ${address.district} ${address.street}`
}

// 根据订单状态获取文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '已取消',
    10: '待付款',
    20: '待发货',
    30: '待收货',
    40: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 根据订单状态获取Tag类型
const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    10: 'warning',
    20: 'primary',
    30: 'success',
    40: 'success'
  }
  return typeMap[status] || 'info'
}

// 添加新地址
const addNewAddress = () => {
  isEditingAddress.value = false
  resetAddressForm()
  addressDialogVisible.value = true
  
  // 对话框显示后初始化地图
  setTimeout(() => {
    initAddressMap()
  }, 300)
}

// 编辑地址
const editAddress = (address: Address) => {
  isEditingAddress.value = true
  
  // 填充表单数据
  addressForm.id = address.id
  addressForm.contactName = address.contactName
  addressForm.phone = address.phone
  addressForm.region = [address.province, address.city, address.district]
  addressForm.province = address.province
  addressForm.city = address.city
  addressForm.district = address.district
  addressForm.street = address.street
  addressForm.isDefault = address.isDefault
  
  addressDialogVisible.value = true
  
  // 对话框显示后初始化地图
  setTimeout(() => {
    initAddressMap()
  }, 300)
}

// 重置地址表单
const resetAddressForm = () => {
  addressForm.id = 0
  addressForm.contactName = ''
  addressForm.phone = ''
  addressForm.region = []
  addressForm.province = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.street = ''
  addressForm.isDefault = false
}

// 保存地址
const saveAddress = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      // 从级联选择器的值中提取省市区
      if (addressForm.region && addressForm.region.length === 3) {
        addressForm.province = addressForm.region[0]
        addressForm.city = addressForm.region[1]
        addressForm.district = addressForm.region[2]
      }
      
      // 删除中间变量，只保留需要提交的字段
      const submitData = {
        id: addressForm.id,
        contactName: addressForm.contactName,
        phone: addressForm.phone,
        province: addressForm.province,
        city: addressForm.city,
        district: addressForm.district,
        street: addressForm.street,
        isDefault: addressForm.isDefault
      }
      
      if (isEditingAddress.value) {
        // 更新地址
        await axios.put(`${USER_API.UPDATE_ADDRESS}/${addressForm.id}`, submitData)
        ElMessage.success('地址更新成功')
      } else {
        // 新增地址
        await axios.post(USER_API.ADD_ADDRESS, submitData)
        ElMessage.success('地址添加成功')
      }
      
      // 关闭对话框并刷新地址列表
      addressDialogVisible.value = false
      fetchAddresses()
    } catch (error) {
      console.error('保存地址失败:', error)
      ElMessage.error('保存地址失败，请稍后重试')
    }
  })
}

// 设为默认地址
const setAsDefault = async (address: Address) => {
  try {
    await axios.patch(`${USER_API.ADDRESS_DEFAULT}/${address.id}/default`)
    ElMessage.success('默认地址设置成功')
    fetchAddresses()
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败，请稍后重试')
  }
}

// 确认删除地址
const confirmDeleteAddress = (address: Address) => {
  ElMessageBox.confirm(
    '确定要删除该收货地址吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteAddress(address.id)
  }).catch(() => {
    // 用户取消删除
  })
}

// 删除地址
const deleteAddress = async (addressId: number) => {
  try {
    await axios.delete(`${USER_API.DELETE_ADDRESS}/${addressId}`)
    ElMessage.success('地址删除成功')
    fetchAddresses()
  } catch (error) {
    console.error('删除地址失败:', error)
    ElMessage.error('删除地址失败，请稍后重试')
  }
}

// 查看订单详情
const viewOrderDetail = (order: Order) => {
  router.push(`/order/${order.orderNo}`)
}

// 支付订单
const payOrder = (order: Order) => {
  router.push(`/payment/${order.orderNo}`)
}

// 确认收货
const confirmReceive = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.post(`${USER_API.ORDER_RECEIVE}/${order.orderNo}`)
    ElMessage.success('确认收货成功')
    fetchOrders() // 刷新订单信息
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败，请稍后重试')
    }
  }
}

// 显示头像更新对话框
const showAvatarDialog = () => {
  avatarForm.avatarUrl = userProfile.value.avatarUrl || ''
  avatarDialogVisible.value = true
}

// 显示个人资料更新对话框
const showProfileDialog = () => {
  profileForm.nickname = userProfile.value.nickname || ''
  profileForm.phone = userProfile.value.phone || ''
  profileForm.email = userProfile.value.email || ''
  profileDialogVisible.value = true
}

// 显示密码修改对话框
const showPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

// 触发文件选择
const triggerAvatarUpload = () => {
  avatarFileInput.value?.click()
}

// 处理头像上传
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过5MB')
    return
  }
  
  avatarUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // 使用用户的头像上传接口
    const response = await fetch(USER_API.UPLOAD_AVATAR, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    avatarForm.avatarUrl = data.fileUrl
    
    ElMessage.success('头像上传成功！')
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    avatarUploading.value = false
    // 清空input的值，允许重复选择同一文件
    if (target) target.value = ''
  }
}

// 清除头像
const clearAvatar = () => {
  avatarForm.avatarUrl = ''
}

// 更新头像
const updateAvatar = async () => {
  try {
    if (!avatarForm.avatarUrl.trim()) {
      return ElMessage.warning('请上传头像或输入有效的头像URL')
    }
    
    await axios.put(USER_API.UPDATE_AVATAR, { avatarUrl: avatarForm.avatarUrl })
    userProfile.value.avatarUrl = avatarForm.avatarUrl
    avatarDialogVisible.value = false
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('更新头像失败:', error)
    ElMessage.error('更新头像失败，请稍后重试')
  }
}

// 更新个人资料
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      await axios.put(USER_API.UPDATE_PROFILE, {
        nickname: profileForm.nickname,
        phone: profileForm.phone,
        email: profileForm.email
      })
      
      userProfile.value.nickname = profileForm.nickname
      userProfile.value.phone = profileForm.phone
      userProfile.value.email = profileForm.email
      
      profileDialogVisible.value = false
      ElMessage.success('个人资料更新成功')
    } catch (error) {
      console.error('更新个人资料失败:', error)
      ElMessage.error('更新个人资料失败，请稍后重试')
    }
  })
}

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      await axios.put(USER_API.UPDATE_PASSWORD, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      
      passwordDialogVisible.value = false
      ElMessage.success('密码修改成功，请重新登录')
      
      // 密码修改成功后，可以选择跳转到登录页或其他操作
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error) {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败，请确认当前密码是否正确')
    }
  })
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(USER_API.PROFILE)
    userProfile.value = {
      id: response.data.id,
      username: response.data.username,
      nickname: response.data.nickname || response.data.username,
      avatarUrl: response.data.avatarUrl || '../assets/homelogo.png',
      role: response.data.role,
      phone: response.data.phone || '',
      email: response.data.email || ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取收货地址列表
const fetchAddresses = async () => {
  try {
    addressesLoading.value = true
    const response = await axios.get(USER_API.ADDRESS_LIST)
    
    if (Array.isArray(response.data)) {
      addresses.value = response.data.map((addr: any) => ({
        id: addr.id,
        contactName: addr.contactName,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        street: addr.street,
        isDefault: addr.isDefault,
        fullAddress: `${addr.province} ${addr.city} ${addr.district} ${addr.street}`
      }))
    } else {
      addresses.value = []
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    addressesLoading.value = false
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    ordersLoading.value = true
    const response = await axios.get(USER_API.ORDER_LIST, {
      params: {
        current: orderCurrentPage.value,
        size: orderPageSize.value
      }
    })
    
    if (response.data && response.data.records) {
      orders.value = response.data.records.map((order: any) => ({
        ...order,
        statusText: formatOrderStatus(order.status),
        createdAtFormatted: formatDate(order.createdAt)
      }))
      orderTotal.value = response.data.total || 0
    } else {
      orders.value = []
      orderTotal.value = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    ordersLoading.value = false
  }
}

// 格式化订单状态
const formatOrderStatus = (status: number) => {
  switch (status) {
    case 0:
      return '已取消'
    case 10:
      return '待付款'
    case 20:
      return '待发货'
    case 30:
      return '待收货'
    case 40:
      return '已完成'
    default:
      return '未知状态'
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 地图相关方法
const initAddressMap = () => {
  if (!window.AMap || !addressMapContainer.value) return
  
  // 创建地图
  addressMap.value = new window.AMap.Map(addressMapContainer.value, {
    zoom: 15,
    center: [116.404, 39.915] // 默认北京位置
  })
  
  // 添加点击事件
  addressMap.value.on('click', (e: any) => {
    const lng = e.lnglat.getLng()
    const lat = e.lnglat.getLat()
    
    // 清除之前的标记
    if (addressMarker.value) {
      addressMap.value.remove(addressMarker.value)
    }
    
    // 添加新标记
    addressMarker.value = new window.AMap.Marker({
      position: [lng, lat],
      map: addressMap.value
    })
    
    // 逆地理编码获取地址
    const geocoder = new window.AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        const addressComponent = result.regeocode.addressComponent
        const formattedAddress = result.regeocode.formattedAddress
        
        selectedLocation.value = {
          lng,
          lat,
          address: formattedAddress
        }
        
        // 自动填充地址信息
        if (addressComponent.province) {
          // 根据地址信息更新表单
          addressForm.province = addressComponent.province
          addressForm.city = addressComponent.city
          addressForm.district = addressComponent.district
          addressForm.street = addressComponent.township + addressComponent.street
          
          // 更新省市区选择器
          addressForm.region = [
            addressComponent.province,
            addressComponent.city,
            addressComponent.district
          ]
        }
      }
    })
  })
}

// 获取当前位置
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.warning('浏览器不支持地理位置服务')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lng = position.coords.longitude
      const lat = position.coords.latitude
      
      if (addressMap.value) {
        addressMap.value.setCenter([lng, lat])
        
        // 清除之前的标记
        if (addressMarker.value) {
          addressMap.value.remove(addressMarker.value)
        }
        
        // 添加当前位置标记
        addressMarker.value = new window.AMap.Marker({
          position: [lng, lat],
          map: addressMap.value
        })
        
        // 逆地理编码获取地址
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            const addressComponent = result.regeocode.addressComponent
            const formattedAddress = result.regeocode.formattedAddress
            
            selectedLocation.value = {
              lng,
              lat,
              address: formattedAddress
            }
            
            // 自动填充地址信息
            if (addressComponent.province) {
              addressForm.province = addressComponent.province
              addressForm.city = addressComponent.city
              addressForm.district = addressComponent.district
              addressForm.street = addressComponent.township + addressComponent.street
              
              addressForm.region = [
                addressComponent.province,
                addressComponent.city,
                addressComponent.district
              ]
            }
          }
        })
      }
      
      ElMessage.success('位置获取成功')
    },
    (error) => {
      console.error('获取位置失败:', error)
      ElMessage.error('获取位置失败，请检查浏览器定位权限')
    },
    {
      timeout: 10000,
      enableHighAccuracy: true
    }
  )
}

// 搜索地址
const searchAddress = () => {
  if (!addressForm.street.trim()) {
    ElMessage.warning('请先输入详细地址')
    return
  }
  
  if (!window.AMap) {
    ElMessage.warning('地图服务暂不可用')
    return
  }
  
  const geocoder = new window.AMap.Geocoder()
  const searchText = `${addressForm.province} ${addressForm.city} ${addressForm.district} ${addressForm.street}`
  
  geocoder.getLocation(searchText, (status: string, result: any) => {
    if (status === 'complete' && result.geocodes.length > 0) {
      const location = result.geocodes[0].location
      const lng = location.getLng()
      const lat = location.getLat()
      
      if (addressMap.value) {
        addressMap.value.setCenter([lng, lat])
        
        // 清除之前的标记
        if (addressMarker.value) {
          addressMap.value.remove(addressMarker.value)
        }
        
        // 添加搜索结果标记
        addressMarker.value = new window.AMap.Marker({
          position: [lng, lat],
          map: addressMap.value
        })
        
        selectedLocation.value = {
          lng,
          lat,
          address: result.geocodes[0].formattedAddress
        }
        
        ElMessage.success('地址搜索成功')
      }
    } else {
      ElMessage.error('地址搜索失败，请检查地址是否正确')
    }
  })
}

// 清除地图选择
const clearMapSelection = () => {
  if (addressMarker.value && addressMap.value) {
    addressMap.value.remove(addressMarker.value)
    addressMarker.value = null
  }
  
  selectedLocation.value = {
    lng: 0,
    lat: 0,
    address: ''
  }
  
  ElMessage.success('已清除地图选择')
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchUserInfo(),
      fetchAddresses(),
      fetchOrders()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 订单相关数据
const ordersLoading = ref(false)
const orderCurrentPage = ref(1)
const orderPageSize = ref(10)
const orderTotal = ref(0)

// 地址相关数据
const addressesLoading = ref(false)

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
/* 文件上传相关样式 */
.file-upload-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.upload-area {
  width: 150px;
  height: 150px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
  overflow: hidden;
  position: relative;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-placeholder {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 10px;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-container:hover .upload-overlay {
  opacity: 1;
}

.clear-btn {
  margin-top: 5px;
  padding: 5px 10px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #e74c3c;
}

.user-container {
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
}

.user-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 左侧边栏 */
.user-sidebar {
  width: 250px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-right: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vip-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.avatar-edit {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.avatar-edit i {
  color: white;
  font-size: 20px;
}

.avatar:hover .avatar-edit {
  opacity: 1;
}

.user-detail {
  text-align: center;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.phone {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.user-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.user-menu {
  display: flex;
  flex-direction: column;
}

.menu-title {
  padding: 12px 0;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.menu-title.active {
  color: #409eff;
}

.sub-menu {
  padding-left: 15px;
}

.menu-item {
  padding: 10px 0;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

.menu-item:hover {
  color: #409eff;
}

.menu-item.active {
  color: #409eff;
}

/* 右侧内容区域 */
.user-main {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: calc(100% - 270px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

/* 地址列表 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.address-content {
  flex: 1;
}

.contact-info {
  margin-bottom: 8px;
}

.contact-name {
  font-weight: bold;
  margin-right: 10px;
}

.contact-phone {
  color: #666;
  margin-right: 10px;
}

.address-text {
  color: #333;
}

.address-actions {
  display: flex;
  gap: 10px;
}

/* 订单列表 */
.order-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #409eff;
}

.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 20px;
}

.order-number {
  font-size: 14px;
  color: #333;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-product {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.product-desc {
  font-size: 14px;
  color: #666;
}

.product-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 20px;
}

.price {
  font-weight: bold;
  color: #f56c6c;
}

.quantity {
  font-size: 14px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.count {
  font-weight: bold;
  margin: 0 5px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .user-content {
    flex-direction: column;
  }
  
  .user-sidebar {
    width: 100%;
    margin-bottom: 20px;
    margin-right: 0;
  }
  
  .user-main {
    width: 100%;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-actions {
    align-self: flex-end;
  }
}

/* 地图选择器样式 */
.map-selector {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
}

.map-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.selected-location {
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
}

.location-label {
  font-weight: bold;
  color: #409eff;
}

.location-text {
  color: #333;
  margin-left: 5px;
}
</style>