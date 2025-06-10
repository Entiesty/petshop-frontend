<template>
  <div class="user-container">
    <div class="user-content">
      <!-- 左侧用户信息和菜单 -->
      <div class="user-sidebar">
        <div class="user-info">
          <div class="avatar">
            <img src="../assets/homelogo.png" alt="用户头像" />
            <div class="vip-badge">会员</div>
          </div>
          <div class="user-detail">
            <div class="username">陈佳怡</div>
            <div class="phone">138****8888</div>
          </div>
        </div>
        
        <div class="user-menu">
          <div class="menu-title">收货地址管理</div>
          <div class="menu-title active">我的订单</div>
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
            <div class="address-item" v-for="(address, index) in addresses" :key="index">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义类型
interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  role: number;
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
const isEditingAddress = ref(false)
const addressFormRef = ref<any>(null)
const activeTab = ref('all')

// 用户资料
const userProfile = ref<UserProfile>({
  id: 0,
  username: '',
  nickname: '',
  avatarUrl: '',
  role: 0
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

// 省市区数据（简化版）
const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '西城区', label: '西城区' },
          { value: '东城区', label: '东城区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '浦东新区', label: '浦东新区' },
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '静安区', label: '静安区' }
        ]
      }
    ]
  }
  // 省略其他省市区数据
]

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
        await axios.put(`/api/user/addresses/${addressForm.id}`, submitData)
        ElMessage.success('地址更新成功')
      } else {
        // 新增地址
        await axios.post('/api/user/addresses', submitData)
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
    await axios.patch(`/api/user/addresses/${address.id}/default`)
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
    await axios.delete(`/api/user/addresses/${addressId}`)
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
    
    await axios.post(`/api/user/orders/${order.orderNo}/receive`)
    ElMessage.success('确认收货成功')
    fetchOrders() // 刷新订单信息
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败，请稍后重试')
    }
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/api/user/users/me')
    userProfile.value = {
      id: response.data.id,
      username: response.data.username,
      nickname: response.data.nickname || response.data.username,
      avatarUrl: response.data.avatarUrl || '../assets/homelogo.png',
      role: response.data.role
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
    const response = await axios.get('/api/user/addresses')
    
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
    const response = await axios.get('/api/user/orders', {
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
</style> 