<template>
  <div class="payment-container">
    <div class="payment-header">
      <el-page-header @back="goBack" title="订单支付" />
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="5" animated />
    </div>
    
    <template v-else>
      <el-card class="payment-card">
        <div class="payment-info">
          <div class="order-no">订单号：{{ orderDetail.orderNo }}</div>
          <div class="payment-amount">
            <span>支付金额</span>
            <span class="amount">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="payment-methods">
          <div class="method-title">支付方式</div>
          <div class="method-list">
            <div 
              class="method-item" 
              :class="{ active: paymentMethod === 'alipay' }"
              @click="selectPaymentMethod('alipay')"
            >
              <img src="/assets/payment/alipay.png" alt="支付宝">
              <span>支付宝</span>
            </div>
            <div 
              class="method-item" 
              :class="{ active: paymentMethod === 'wechat' }"
              @click="selectPaymentMethod('wechat')"
            >
              <img src="/assets/payment/wechat.png" alt="微信支付">
              <span>微信支付</span>
            </div>
            <div 
              class="method-item" 
              :class="{ active: paymentMethod === 'card' }"
              @click="selectPaymentMethod('card')"
            >
              <img src="/assets/payment/card.png" alt="银行卡">
              <span>银行卡</span>
            </div>
          </div>
        </div>
        
        <div class="payment-action">
          <el-button 
            type="primary" 
            size="large" 
            :disabled="!paymentMethod || paying" 
            :loading="paying"
            @click="payOrder"
          >
            立即支付
          </el-button>
        </div>
      </el-card>
      
      <!-- 订单详情 -->
      <el-card class="order-detail-card">
        <template #header>
          <div class="card-header">
            <span>订单详情</span>
            <el-button type="text" @click="router.push(`/order/${orderNo}`)">查看详情</el-button>
          </div>
        </template>
        
        <div class="order-items">
          <div class="item" v-for="item in orderDetail.items" :key="item.productId">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
            <span class="item-price">¥{{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="order-total">
          <span>总计：</span>
          <span class="total-price">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
        </div>
      </el-card>
    </template>
    
    <!-- 支付结果对话框 -->
    <el-dialog v-model="paymentResultVisible" :title="paymentSuccess ? '支付成功' : '支付失败'" width="30%">
      <div class="payment-result">
        <div class="result-icon">
          <el-icon v-if="paymentSuccess" class="success-icon" size="60">
            <CircleCheckFilled />
          </el-icon>
          <el-icon v-else class="error-icon" size="60">
            <CircleCloseFilled />
          </el-icon>
        </div>
        <div class="result-message">
          {{ paymentSuccess ? '订单支付成功' : '订单支付失败，请重试' }}
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePaymentResult">关闭</el-button>
          <el-button type="primary" @click="viewOrder">
            {{ paymentSuccess ? '查看订单' : '重新支付' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface OrderDetail {
  id: number;
  orderNo: string;
  totalAmount: number;
  items: OrderItem[];
}

const route = useRoute()
const router = useRouter()
const orderNo = ref(route.params.orderNo as string)
const loading = ref(true)
const paying = ref(false)
const paymentMethod = ref('')
const paymentResultVisible = ref(false)
const paymentSuccess = ref(false)

const orderDetail = ref<OrderDetail>({
  id: 0,
  orderNo: '',
  totalAmount: 0,
  items: []
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 选择支付方式
const selectPaymentMethod = (method: string) => {
  paymentMethod.value = method
}

// 支付订单
const payOrder = async () => {
  if (!paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  try {
    paying.value = true
    
    // 模拟支付接口调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 调用后端支付接口
    await axios.post(`/api/user/orders/${orderNo.value}/pay`, {
      paymentMethod: paymentMethod.value
    })
    
    paymentSuccess.value = true
  } catch (error) {
    console.error('支付失败:', error)
    paymentSuccess.value = false
  } finally {
    paying.value = false
    paymentResultVisible.value = true
  }
}

// 关闭支付结果对话框
const closePaymentResult = () => {
  paymentResultVisible.value = false
  
  if (paymentSuccess.value) {
    router.push('/user')
  }
}

// 查看订单或重新支付
const viewOrder = () => {
  paymentResultVisible.value = false
  
  if (paymentSuccess.value) {
    router.push(`/order/${orderNo.value}`)
  } else {
    // 重置支付状态，允许用户重新选择支付方式
    paymentMethod.value = ''
  }
}

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/user/orders/${orderNo.value}`)
    
    // 提取需要的订单信息
    orderDetail.value = {
      id: response.data.id,
      orderNo: response.data.orderNo,
      totalAmount: response.data.totalAmount,
      items: response.data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        imageUrl: item.mainImageUrl || '../assets/homelogo.png'
      }))
    }
    
    // 如果订单已支付，重定向到订单详情页
    if (response.data.status > 10) {
      ElMessage.info('该订单已支付')
      router.replace(`/order/${orderNo.value}`)
    }
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
.payment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.payment-header {
  margin-bottom: 20px;
}

.loading-container {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.payment-card {
  margin-bottom: 20px;
}

.payment-info {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  color: #666;
  margin-bottom: 10px;
}

.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-amount span:first-child {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.amount {
  color: #f56c6c;
  font-size: 32px;
  font-weight: bold;
}

.payment-methods {
  margin-bottom: 30px;
}

.method-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.method-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item img {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
}

.method-item:hover {
  border-color: #409eff;
}

.method-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.payment-action {
  text-align: center;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.order-items {
  margin-bottom: 20px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
}

.item-quantity {
  color: #666;
  margin: 0 20px;
}

.item-price {
  font-weight: bold;
}

.order-total {
  text-align: right;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.payment-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.result-icon {
  margin-bottom: 20px;
}

.success-icon {
  color: #67c23a;
}

.error-icon {
  color: #f56c6c;
}

.result-message {
  font-size: 16px;
}

@media (max-width: 768px) {
  .payment-container {
    padding: 10px;
  }
  
  .method-list {
    justify-content: center;
  }
  
  .method-item {
    width: 100px;
  }
}
</style> 