<template>
  <div class="cart-macos">
    <!-- macOS 风格头部导航栏 -->
    <header class="cart-header-macos">
      <div class="header-content">
        <div class="cart-title">
          <span class="cart-icon">🛒</span>
          购物车
          <span v-if="cartItems.length > 0" class="item-count">({{ cartItems.length }})</span>
        </div>
        
        <div class="header-actions">
          <button @click="goBack" class="back-btn">
            <span class="back-icon">←</span>
            返回
          </button>
          <button 
            v-if="cartItems.length > 0" 
            @click="clearCart" 
            class="clear-btn"
          >
            清空购物车
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="cart-content">
      <!-- 购物车商品列表 -->
      <div v-if="cartItems.length > 0" class="cart-items">
        <div class="section-header">
          <h2 class="section-title">商品清单</h2>
          <p class="items-count">共 {{ cartItems.length }} 件商品</p>
        </div>
        
        <div class="items-list">
          <article 
            v-for="item in cartItems" 
            :key="item.id"
            class="cart-item-macos"
          >
            <div class="item-image">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
            
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-category" v-if="item.categoryPath">
                <span class="category-path">{{ item.categoryPath }}</span>
              </div>
              <div class="item-specs">
                <span class="spec-item">规格: {{ item.specification }}</span>
                <span class="spec-item">品牌: {{ item.brand }}</span>
              </div>
            </div>
            
            <div class="item-price">
              <div class="current-price">¥{{ item.price }}</div>
              <div v-if="item.originalPrice" class="original-price">
                ¥{{ item.originalPrice }}
              </div>
            </div>
            
            <div class="quantity-controls">
              <button 
                @click="decreaseQuantity(item)" 
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >
                −
              </button>
              <span class="quantity-display">{{ item.quantity }}</span>
              <button 
                @click="increaseQuantity(item)"
                class="quantity-btn"
              >
                +
              </button>
            </div>
            
            <div class="item-actions">
              <button @click="removeItem(item)" class="remove-btn">
                <span class="remove-icon">🗑️</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- 空购物车状态 -->
      <div v-else class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2 class="empty-title">购物车是空的</h2>
        <p class="empty-description">
          还没有添加任何商品，快去选购您喜欢的宠物和用品吧！
        </p>
        <button @click="startShopping" class="start-shopping-btn">
          开始购物
        </button>
      </div>

      <!-- 订单摘要 -->
      <aside v-if="cartItems.length > 0" class="order-summary">
        <div class="summary-card">
          <div class="summary-header">
            <h3 class="summary-title">订单摘要</h3>
          </div>
          
          <div class="summary-items">
            <div class="summary-item">
              <span class="item-label">商品总额</span>
              <span class="item-value">¥{{ subtotal }}</span>
            </div>
            <div class="summary-item">
              <span class="item-label">运费</span>
              <span class="item-value highlight">{{ shipping === 0 ? '免费' : `¥${shipping}` }}</span>
            </div>
            <div v-if="discount > 0" class="summary-item">
              <span class="item-label">优惠金额</span>
              <span class="item-value highlight">-¥{{ discount }}</span>
            </div>
            <div class="divider"></div>
            <div class="summary-item total-item">
              <span class="item-label">合计</span>
              <span class="item-value">¥{{ total }}</span>
            </div>
          </div>
          
          <div class="checkout-actions">
            <button @click="proceedToCheckout" class="checkout-btn">
              立即结算
            </button>
            <button @click="continueShopping" class="continue-shopping">
              继续购物
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 接口定义
interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  specification: string;
  brand: string;
  categoryId?: number;
  categoryName?: string;
  categoryPath?: string;
}

// 响应式数据
const router = useRouter()
const cartItems = ref<CartItem[]>([
  {
    id: 1,
    name: '阳光-金毛寻回犬',
    description: '温顺亲人，适合家庭饲养的可爱金毛幼犬',
    price: 6800,
    originalPrice: 7200,
    quantity: 1,
    imageUrl: '/src/assets/homelogo.png',
    specification: '8个月大',
    brand: '汪汪之家',
    categoryId: 101,
    categoryName: '狗狗专区',
    categoryPath: '活体宠物 > 狗狗专区'
  },
  {
    id: 2,
    name: '皇家大型犬幼犬粮 15kg',
    description: '专为大型犬幼犬设计的营养犬粮',
    price: 589,
    quantity: 1,
    imageUrl: '/src/assets/homelogo.png',
    specification: '15kg装',
    brand: '皇家',
    categoryId: 201,
    categoryName: '犬粮',
    categoryPath: '宠物主粮 > 犬粮'
  }
])

// 分类信息缓存
const categoriesCache = ref<Map<number, any>>(new Map())

// 获取分类信息
const fetchCategoryInfo = async (categoryId: number) => {
  if (categoriesCache.value.has(categoryId)) {
    return categoriesCache.value.get(categoryId)
  }
  
  try {
    const response = await axios.get(`/api/user/categories/${categoryId}`)
    const category = response.data
    categoriesCache.value.set(categoryId, category)
    return category
  } catch (error) {
    console.error('获取分类信息失败:', error)
    return null
  }
}

// 构建分类路径
const buildCategoryPath = async (categoryId: number): Promise<string> => {
  const category = await fetchCategoryInfo(categoryId)
  if (!category) return ''
  
  if (category.parentId && category.parentId !== 0) {
    const parentPath = await buildCategoryPath(category.parentId)
    return parentPath ? `${parentPath} > ${category.name}` : category.name
  }
  
  return category.name
}

// 初始化购物车商品的分类信息
const initializeCategoryInfo = async () => {
  for (const item of cartItems.value) {
    if (item.categoryId && !item.categoryPath) {
      item.categoryPath = await buildCategoryPath(item.categoryId)
    }
  }
}

// 计算属性
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const shipping = computed(() => {
  return subtotal.value >= 299 ? 0 : 20
})

const discount = computed(() => {
  return 0 // 可以根据优惠券等计算
})

const total = computed(() => {
  return subtotal.value + shipping.value - discount.value
})

// 方法
const goBack = () => {
  router.go(-1)
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空购物车吗？此操作不可恢复。',
      '清空购物车',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    cartItems.value = []
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消操作
  }
}

const increaseQuantity = (item: CartItem) => {
  item.quantity++
}

const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = async (item: CartItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要从购物车中移除 "${item.name}" 吗？`,
      '移除商品',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const index = cartItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      ElMessage.success('商品已移除')
    }
  } catch {
    // 用户取消操作
  }
}

const startShopping = () => {
  router.push('/')
}

const continueShopping = () => {
  router.push('/')
}

const proceedToCheckout = () => {
  router.push('/checkout')
}

// 组件挂载时初始化分类信息
onMounted(() => {
  initializeCategoryInfo()
})
</script>

<style lang="scss">
@import '../styles/cart-macos.scss';

// 分类信息样式
.item-category {
  margin: 4px 0 8px 0;
  
  .category-path {
    font-size: 12px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }
}
</style> 