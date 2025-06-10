<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <el-page-header @back="goBack" title="订单结算" />
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <div v-else class="checkout-content">
      <!-- 收货地址 -->
      <el-card class="address-card">
        <template #header>
          <div class="card-header">
            <span>收货地址</span>
            <el-button type="primary" size="small" @click="showAddressDialog">
              {{ selectedAddress ? '更换地址' : '添加地址' }}
            </el-button>
          </div>
        </template>
        
        <div v-if="selectedAddress" class="selected-address">
          <div class="contact-info">
            <span class="contact-name">{{ selectedAddress.contactName }}</span>
            <span class="contact-phone">{{ selectedAddress.phone }}</span>
          </div>
          <div class="address-detail">
            {{ formatAddress(selectedAddress) }}
          </div>
        </div>
        <el-empty v-else description="请选择收货地址" />
      </el-card>
      
      <!-- 商品列表 -->
      <el-card class="products-card">
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        
        <div class="product-list">
          <div class="product-item" v-for="item in checkoutItems" :key="item.productId">
            <div class="product-image">
              <img :src="item.imageUrl || '/assets/product-default.jpg'" :alt="item.productName">
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-desc">{{ item.description }}</div>
            </div>
            <div class="product-price-qty">
              <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
              <div class="product-qty">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 订单提交 -->
      <el-card class="submit-card">
        <div class="order-total">
          <span>商品总额：</span>
          <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="order-remark">
          <el-input 
            v-model="remark" 
            type="textarea" 
            placeholder="订单备注（选填）" 
            :rows="2"
          />
        </div>
        <div class="submit-action">
          <el-button 
            type="primary" 
            size="large" 
            :disabled="!canSubmitOrder" 
            :loading="submitting"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 地址选择对话框 -->
    <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="80%">
      <div class="address-list">
        <div 
          v-for="address in addresses" 
          :key="address.id" 
          class="address-item"
          :class="{ 'active': selectedAddressId === address.id }"
          @click="selectAddress(address)"
        >
          <div class="address-content">
            <div class="contact-info">
              <span class="contact-name">{{ address.contactName }}</span>
              <span class="contact-phone">{{ address.phone }}</span>
              <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ formatAddress(address) }}
            </div>
          </div>
        </div>
        
        <div class="address-add" @click="addNewAddress">
          <el-button type="dashed" icon="Plus">添加新地址</el-button>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddress">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

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

interface CheckoutItem {
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const remark = ref('')
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number | null>(null)
const addressDialogVisible = ref(false)
const checkoutItems = ref<CheckoutItem[]>([])

// 商品总金额
const totalAmount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
})

// 是否可以提交订单
const canSubmitOrder = computed(() => {
  return selectedAddressId.value !== null && checkoutItems.value.length > 0
})

// 选中的地址
const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return null
  return addresses.value.find(addr => addr.id === selectedAddressId.value) || null
})

// 格式化地址
const formatAddress = (address: Address) => {
  return `${address.province} ${address.city} ${address.district} ${address.street}`
}

// 返回上一页
const goBack = () => {
  router.push('/cart')
}

// 显示地址选择对话框
const showAddressDialog = () => {
  addressDialogVisible.value = true
}

// 选择地址
const selectAddress = (address: Address) => {
  selectedAddressId.value = address.id
}

// 确认选择地址
const confirmAddress = () => {
  addressDialogVisible.value = false
}

// 添加新地址
const addNewAddress = () => {
  router.push('/user')
}

// 提交订单
const submitOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (checkoutItems.value.length === 0) {
    ElMessage.warning('订单中没有商品')
    return
  }
  
  try {
    submitting.value = true
    
    // 获取购物车中选中的商品ID
    const cartItemIds = checkoutItems.value.map(item => item.productId)
    
    // 提交订单
    const response = await axios.post('/api/user/orders', {
      addressId: selectedAddressId.value,
      cartItemIds: cartItemIds,
      remark: remark.value
    })
    
    ElMessage.success('订单提交成功')
    
    // 跳转到支付页面
    router.push(`/payment/${response.data}`)
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 获取购物车中选中的商品
const fetchCheckoutItems = async () => {
  try {
    loading.value = true
    
    // 从查询参数中获取选中的商品ID
    const itemIds = route.query.items as string
    
    if (!itemIds) {
      ElMessage.warning('未选择结算商品')
      router.push('/cart')
      return
    }
    
    // 将逗号分隔的ID转为数组
    const productIds = itemIds.split(',').map(id => parseInt(id))
    
    // 从购物车API获取数据
    const response = await axios.get('/api/user/cart')
    
    if (response.data && response.data.items) {
      // 过滤出选中的商品
      const selectedItems = response.data.items.filter((item: any) => 
        productIds.includes(item.productId)
      )
      
      checkoutItems.value = selectedItems.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        quantity: item.quantity,
        imageUrl: item.mainImageUrl || '../assets/homelogo.png'
      }))
    } else {
      ElMessage.warning('获取结算商品失败')
      router.push('/cart')
    }
  } catch (error) {
    console.error('获取结算商品失败:', error)
    ElMessage.error('获取结算商品失败，请稍后重试')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 获取用户地址列表
const fetchAddresses = async () => {
  try {
    const response = await axios.get('/api/user/addresses')
    addresses.value = response.data
    
    // 如果有默认地址，则选中默认地址
    const defaultAddress = addresses.value.find(addr => addr.isDefault)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    } else if (addresses.value.length > 0) {
      // 如果没有默认地址，选中第一个地址
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败，请稍后重试')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCheckoutItems(),
    fetchAddresses()
  ])
})
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.checkout-header {
  margin-bottom: 20px;
}

.loading-container {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.selected-address {
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

.order-total {
  text-align: right;
  font-size: 16px;
  margin-bottom: 20px;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 20px;
}

.order-remark {
  margin-bottom: 20px;
}

.submit-action {
  text-align: right;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.address-item {
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #409eff;
}

.address-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.address-add {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  height: 100%;
  min-height: 120px;
}

.address-add:hover {
  border-color: #409eff;
  color: #409eff;
}

@media (max-width: 768px) {
  .checkout-container {
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
}
</style> 