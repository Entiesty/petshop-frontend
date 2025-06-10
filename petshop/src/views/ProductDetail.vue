<template>
  <div class="product-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <template v-else>
      <div class="product-header">
        <el-page-header @back="goBack" :title="product.name" />
      </div>
      
      <div class="product-content">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.imageUrl || '/assets/product-default.jpg'" :alt="product.name">
          </div>
          <div class="video-preview" v-if="product.videoUrl">
            <video 
              controls 
              :src="product.videoUrl" 
              poster="/assets/video-poster.jpg"
            ></video>
          </div>
        </div>
        
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.originalPrice && product.originalPrice > product.price">
              ¥{{ product.originalPrice }}
            </span>
          </div>
          
          <div class="product-desc">
            <h3>商品介绍</h3>
            <p>{{ product.description }}</p>
          </div>
          
          <div class="product-store">
            <h3>商店信息</h3>
            <div class="store-info" v-if="store">
              <div class="store-name">{{ store.name }}</div>
              <div class="store-address">{{ store.address }}</div>
              <div class="store-contact">联系电话: {{ store.contactPhone }}</div>
            </div>
          </div>
          
          <div class="product-actions">
            <el-input-number v-model="quantity" :min="1" :max="99" size="large" />
            <el-button 
              type="primary" 
              size="large" 
              @click="addToCart"
              :disabled="adding"
              :loading="adding"
            >
              加入购物车
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const productId = ref(route.params.id)
const loading = ref(true)
const adding = ref(false)
const quantity = ref(1)
const product = ref({
  id: 0,
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  imageUrl: '',
  videoUrl: '',
  storeId: 0,
  productType: 0
})
const store = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/user/products/${productId.value}`)
    product.value = response.data
    
    // 如果商品有店铺ID，则获取店铺信息
    if (product.value.storeId) {
      fetchStoreInfo(product.value.storeId)
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取店铺信息
const fetchStoreInfo = async (storeId) => {
  try {
    const response = await axios.get(`/api/user/stores/${storeId}`)
    store.value = response.data
  } catch (error) {
    console.error('获取店铺信息失败:', error)
  }
}

// 添加到购物车
const addToCart = async () => {
  // 检查是否登录
  const token = localStorage.getItem('token')
  if (!token) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  try {
    adding.value = true
    await axios.post('/api/user/cart/items', {
      productId: product.value.id,
      quantity: quantity.value
    })
    
    ElMessage.success('成功加入购物车')
  } catch (error) {
    console.error('添加购物车失败:', error)
    ElMessage.error('添加购物车失败，请稍后重试')
  } finally {
    adding.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.loading-container {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.product-header {
  margin-bottom: 20px;
}

.product-content {
  display: flex;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-gallery {
  flex: 1;
  padding: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 4px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 4px;
}

.video-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  padding: 30px;
  border-left: 1px solid #eee;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #333;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 10px;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.product-desc, .product-store {
  margin-bottom: 30px;
}

.product-desc h3, .product-store h3 {
  font-size: 18px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.product-desc p {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.store-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.store-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.store-address, .store-contact {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.product-actions {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .product-content {
    flex-direction: column;
  }
  
  .product-info {
    border-left: none;
    border-top: 1px solid #eee;
  }
  
  .main-image {
    height: 300px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
</style> 