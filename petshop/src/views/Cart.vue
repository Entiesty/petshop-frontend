<template>
  <div class="cart-container">
    <header class="header">
      <h1>购物车</h1>
    </header>

    <div v-if="loading" class="loading-spinner">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="cartItems.length > 0" class="cart-content">
      <div class="cart-item" v-for="item in cartItems" :key="item.productId">
        <div class="item-checkbox">
          <el-checkbox v-model="item.selected" @change="calculateTotal" />
        </div>
        <div class="item-image">
          <img :src="item.imageUrl || '/assets/product-default.jpg'" :alt="item.productName" />
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-desc">{{ item.description }}</div>
          <div class="item-price-quantity">
            <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
            <div class="quantity-control">
              <el-button size="small" @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</el-button>
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="99" 
                size="small" 
                controls-position="right"
                @change="updateCartItem(item)"
              />
              <el-button size="small" @click="increaseQuantity(item)">+</el-button>
            </div>
          </div>
        </div>
        <div class="item-delete" @click="confirmRemoveItem(item.productId)">
          <el-button type="danger" size="small" icon="Delete" circle />
        </div>
      </div>

      <div class="cart-footer">
        <div class="select-all">
          <el-checkbox v-model="allSelected" @change="toggleSelectAll">全选</el-checkbox>
        </div>
        <div class="total-info">
          <span>合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <el-button 
          class="checkout-btn" 
          type="primary" 
          :disabled="!hasSelectedItems" 
          @click="checkout"
          size="large"
        >
          结算 ({{ selectedCount }})
        </el-button>
      </div>
    </div>

    <div v-else class="empty-cart">
      <el-empty description="购物车还是空的哦，快去选购吧~">
        <el-button type="primary" @click="goShopping">去购物</el-button>
      </el-empty>
    </div>

    <!-- 底部导航 - 移动端显示 -->
    <div class="bottom-nav">
      <div class="nav-item">
        <router-link to="/">
          <i class="nav-icon">
            <el-icon><HomeFilled /></el-icon>
          </i>
          <span>首页</span>
        </router-link>
      </div>
      <div class="nav-item active">
        <i class="nav-icon">
          <el-icon><ShoppingCart /></el-icon>
        </i>
        <span>购物车</span>
      </div>
      <div class="nav-item">
        <router-link to="/user">
          <i class="nav-icon">
            <el-icon><User /></el-icon>
          </i>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ShoppingCart, HomeFilled, Delete } from '@element-plus/icons-vue'

interface CartItem {
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  selected: boolean;
  imageUrl: string;
}

const router = useRouter()
const loading = ref(true)
const cartItems = ref<CartItem[]>([])
const allSelected = ref(true)
const totalPrice = ref(0)

// 选中的商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

// 是否有选中的商品
const hasSelectedItems = computed(() => {
  return selectedCount.value > 0
})

// 计算总价
const calculateTotal = () => {
  totalPrice.value = cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  // 更新全选状态
  allSelected.value = cartItems.value.length > 0 && 
    cartItems.value.every(item => item.selected)
}

// 全选/取消全选
const toggleSelectAll = () => {
  cartItems.value.forEach(item => {
    item.selected = allSelected.value
  })
  calculateTotal()
}

// 增加数量
const increaseQuantity = (item: CartItem) => {
  if (item.quantity < 99) {
    item.quantity++
    updateCartItem(item)
  }
}

// 减少数量
const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
    updateCartItem(item)
  }
}

// 更新购物车商品数量
const updateCartItem = async (item: CartItem) => {
  try {
    await axios.post('/api/user/cart/items', {
      productId: item.productId,
      quantity: item.quantity
    })
    calculateTotal()
  } catch (error) {
    console.error('更新购物车失败:', error)
    ElMessage.error('更新购物车失败，请稍后重试')
  }
}

// 确认删除商品
const confirmRemoveItem = (productId: number) => {
  ElMessageBox.confirm(
    '确定要从购物车中移除该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    removeItem(productId)
  }).catch(() => {
    // 用户取消删除
  })
}

// 移除商品
const removeItem = async (productId: number) => {
  try {
    await axios.delete(`/api/user/cart/items/${productId}`)
    
    const index = cartItems.value.findIndex(item => item.productId === productId)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
      calculateTotal()
      ElMessage.success('商品已从购物车移除')
    }
  } catch (error) {
    console.error('移除商品失败:', error)
    ElMessage.error('移除商品失败，请稍后重试')
  }
}

// 前往购物
const goShopping = () => {
  router.push('/')
}

// 结算
const checkout = () => {
  // 获取选中的商品ID
  const selectedItems = cartItems.value
    .filter(item => item.selected)
    .map(item => item.productId)
  
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  // 跳转到结算页面，并传递选中的商品ID
  router.push({
    path: '/checkout',
    query: { items: selectedItems.join(',') }
  })
}

// 获取购物车数据
const fetchCartItems = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/user/cart')
    
    if (response.data && response.data.items) {
      // 转换接口返回的数据格式
      cartItems.value = response.data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        quantity: item.quantity,
        selected: true, // 默认全选
        imageUrl: item.mainImageUrl || '../assets/homelogo.png'
      }))
      calculateTotal()
    } else {
      cartItems.value = []
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取购物车数据失败，请稍后重试')
    
    // 使用本地数据作为后备
    cartItems.value = [
      {
        productId: 1,
        productName: '布偶猫',
        description: '温顺友好，性格温和',
        price: 3800,
        quantity: 1,
        selected: true,
        imageUrl: '../assets/homelogo.png'
      },
      {
        productId: 2,
        productName: '金毛犬',
        description: '聪明友善，适合陪伴',
        price: 2500,
        quantity: 1,
        selected: true,
        imageUrl: '../assets/homelogo.png'
      }
    ]
    calculateTotal()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.cart-container {
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

.header {
  background-color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.loading-spinner {
  padding: 30px;
  background-color: white;
  margin: 20px;
  border-radius: 8px;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  transition: all 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.item-checkbox {
  margin-right: 15px;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 20px;
  border: 1px solid #eee;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}

.item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.item-price-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-delete {
  margin-left: 20px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  background-color: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.cart-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  border-radius: 8px;
}

.select-all {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.total-info {
  flex: 1;
  text-align: right;
  padding-right: 20px;
  font-size: 16px;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 20px;
}

.checkout-btn {
  font-size: 16px;
}

/* 底部导航 - 只在移动端显示 */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.nav-item.active {
  color: #409eff;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 3px;
}

.nav-item a {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .cart-container {
    padding-bottom: 60px;
  }
  
  .header {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 18px;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
  }
  
  .item-image {
    width: 100%;
    height: 180px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .item-price-quantity {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .item-delete {
    margin-left: 0;
    margin-top: 15px;
    align-self: flex-end;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .select-all {
    margin-right: 0;
  }
  
  .total-info {
    padding-right: 0;
    text-align: left;
  }
  
  .bottom-nav {
    display: flex;
    justify-content: space-around;
  }
}

@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }
  
  .cart-content {
    padding-bottom: 60px;
  }
}
</style> 