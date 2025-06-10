<template>
  <div class="order-detail-container">
    <div class="order-header">
      <el-page-header @back="goBack" title="订单详情" />
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <template v-else>
      <el-card class="order-info-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <el-tag :type="getStatusType(orderDetail.status)">{{ getOrderStatusText }}</el-tag>
          </div>
        </template>
        
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatTime(orderDetail.createdAt) }}</span>
          </div>
          <div v-if="orderDetail.paymentTime" class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatTime(orderDetail.paymentTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单备注：</span>
            <span class="value">{{ orderDetail.remark || '无' }}</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="address-card">
        <template #header>
          <div class="card-header">
            <span>收货信息</span>
          </div>
        </template>
        
        <div class="address-info" v-if="orderDetail.address">
          <div class="contact-info">
            <span class="contact-name">{{ orderDetail.address.contactName }}</span>
            <span class="contact-phone">{{ orderDetail.address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ formatAddress(orderDetail.address) }}
          </div>
        </div>
      </el-card>
      
      <el-card class="products-card">
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        
        <div class="product-list">
          <div class="product-item" v-for="item in orderDetail.items" :key="item.productId">
            <div class="product-image">
              <img :src="item.imageUrl || '/assets/product-default.jpg'" :alt="item.productName">
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-desc">{{ item.description }}</div>
            </div>
            <div class="product-price-qty">
              <div class="product-price">¥{{ item.unitPrice.toFixed(2) }}</div>
              <div class="product-qty">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
        
        <div class="order-amount">
          <div class="amount-item">
            <span>商品总额：</span>
            <span>¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span>实付金额：</span>
            <span class="final-price">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-card>
      
      <div class="order-actions">
        <el-button 
          v-if="orderDetail.status === 10" 
          type="primary" 
          @click="payOrder"
        >
          去支付
        </el-button>
        
        <el-button 
          v-if="orderDetail.status === 30" 
          type="success" 
          @click="confirmReceive"
        >
          确认收货
        </el-button>
        
        <el-button 
          v-if="orderDetail.status === 10" 
          type="danger" 
          @click="cancelOrder"
        >
          取消订单
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Address {
  id: number;
  contactName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  description: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

interface OrderDetail {
  id: number;
  orderNo: string;
  status: number;
  totalAmount: number;
  createdAt: string;
  paymentTime: string | null;
  remark: string | null;
  address: Address;
  items: OrderItem[];
}

const route = useRoute()
const router = useRouter()
const orderNo = ref(route.params.orderNo as string)
const loading = ref(true)
const orderDetail = ref<OrderDetail>({
  id: 0,
  orderNo: '',
  status: 0,
  totalAmount: 0,
  createdAt: '',
  paymentTime: null,
  remark: null,
  address: {
    id: 0,
    contactName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    street: ''
  },
  items: []
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化地址
const formatAddress = (address: Address) => {
  return `${address.province} ${address.city} ${address.district} ${address.street}`
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString()
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

// 根据订单状态获取文本
const getOrderStatusText = computed(() => {
  return formatOrderStatus(orderDetail.value.status)
})

// 根据订单状态获取Tag类型
const getStatusType = (status: number) => {
  const typeMap: {[key: number]: string} = {
    0: 'info',
    10: 'warning',
    20: 'primary',
    30: 'success',
    40: 'success'
  }
  return typeMap[status] || 'info'
}

// 去支付
const payOrder = () => {
  router.push(`/payment/${orderNo.value}`)
}

// 确认收货
const confirmReceive = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.post(`/api/user/orders/${orderNo.value}/receive`)
    ElMessage.success('确认收货成功')
    fetchOrderDetail() // 刷新订单信息
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败，请稍后重试')
    }
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确认取消订单吗？', '取消订单', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.post(`/api/user/orders/${orderNo.value}/cancel`)
    ElMessage.success('订单已取消')
    fetchOrderDetail() // 刷新订单信息
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败，请稍后重试')
    }
  }
}

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/user/orders/${orderNo.value}`)
    orderDetail.value = response.data
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
    router.push('/user')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.order-header {
  margin-bottom: 20px;
}

.loading-container {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.order-info-card, .address-card, .products-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
}

.label {
  width: 100px;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}

.address-info {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.contact-info {
  margin-bottom: 10px;
}

.contact-name {
  font-weight: bold;
  margin-right: 10px;
}

.contact-phone {
  color: #666;
}

.address-detail {
  color: #333;
  line-height: 1.5;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
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

.product-price-qty {
  margin-left: 20px;
  text-align: right;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 5px;
}

.product-qty {
  color: #999;
  font-size: 14px;
}

.order-amount {
  border-top: 1px solid #eee;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.amount-item {
  font-size: 14px;
}

.final-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .order-detail-container {
    padding: 10px;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .product-price-qty {
    margin-left: 0;
    margin-top: 10px;
    align-self: flex-end;
    text-align: left;
  }
  
  .order-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 