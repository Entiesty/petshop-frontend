<template>
  <div class="store-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <template v-else>
      <div class="store-header">
        <el-page-header @back="goBack" :title="store.name" />
      </div>
      
      <div class="store-content">
        <div class="store-banner">
          <img :src="store.logoUrl || '/assets/store-default.jpg'" :alt="store.name">
          <div class="store-info-overlay">
            <h1>{{ store.name }}</h1>
            <div class="store-info-detail">
              <span class="store-address">
                <i class="el-icon"><Location /></i>
                {{ store.addressText }}
              </span>
              <span class="store-phone">
                <i class="el-icon"><Phone /></i>
                {{ store.contactPhone }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="store-actions">
          <el-button type="primary" @click="showMap">
            <i class="el-icon"><Location /></i>
            查看地图
          </el-button>
          <el-button type="primary" @click="showRoute">
            <i class="el-icon"><Position /></i>
            导航路线
          </el-button>
        </div>
        
        <div class="store-info-section">
          <h2>店铺信息</h2>
          <div class="store-info-card">
            <div class="store-details">
              <div class="store-detail-item">
                <span class="store-detail-label">营业时间</span>
                <span class="store-detail-value">周一～周五 10:00 - 20:00</span>
                <span class="store-detail-value">周末及节假日 9:30 - 21:00</span>
              </div>
              <div class="store-detail-item">
                <span class="store-detail-label">联系方式</span>
                <span class="store-detail-value">400-123-4567</span>
                <span class="store-detail-value">萌宠乐园客服</span>
              </div>
              <div class="store-detail-item">
                <span class="store-detail-label">店铺地址</span>
                <span class="store-detail-value">{{ store.addressText || '上海市浦东新区张江高科技园区科苑路88号' }}</span>
              </div>
            </div>
            <div class="store-description">
              <p>{{ store.description || '专业宠物用品店，一站式宠物体验，为您和您的爱宠提供最优质服务' }}</p>
            </div>
          </div>
        </div>
        
        <div class="store-products">
          <h2>店铺商品</h2>
          
          <el-tabs v-model="activeTab">
            <el-tab-pane label="宠物" name="pet">
              <div class="products-grid" v-if="petProducts.length > 0">
                <div 
                  class="product-card" 
                  v-for="product in petProducts" 
                  :key="product.id" 
                  @click="viewProduct(product.id)"
                >
                  <div class="product-image">
                    <img :src="product.imageUrl || '/assets/pet-default.jpg'" :alt="product.name">
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-desc">{{ product.description }}</div>
                    <div class="product-price">¥{{ product.price }}</div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无宠物商品" />
            </el-tab-pane>
            
            <el-tab-pane label="周边商品" name="accessory">
              <div class="products-grid" v-if="accessoryProducts.length > 0">
                <div 
                  class="product-card" 
                  v-for="product in accessoryProducts" 
                  :key="product.id" 
                  @click="viewProduct(product.id)"
                >
                  <div class="product-image">
                    <img :src="product.imageUrl || '/assets/product-default.jpg'" :alt="product.name">
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-desc">{{ product.description }}</div>
                    <div class="product-price">¥{{ product.price }}</div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无周边商品" />
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="store-reviews">
          <h2>用户评价</h2>
          
          <div class="store-rating">
            <div class="store-rating-score">4.8</div>
            <div class="store-rating-stars">★★★★★</div>
            <div class="store-rating-count">基于 128 条评价</div>
          </div>
          
          <div class="review-list">
            <div class="review-item" v-for="(review, index) in mockReviews" :key="index">
              <div class="reviewer-info">
                <img :src="review.avatar" :alt="review.name" class="reviewer-avatar">
                <div class="reviewer-name">{{ review.name }}</div>
                <div class="review-date">{{ review.date }}</div>
              </div>
              <div class="review-stars">{{ review.stars }}</div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 地图弹窗 -->
    <el-dialog v-model="mapDialogVisible" title="店铺位置" width="80%">
      <div class="map-container" ref="mapContainer" style="height: 400px;"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Location, Phone, Position } from '@element-plus/icons-vue'

// 扩展Window接口以包含AMap
declare global {
  interface Window {
    AMap: any;
  }
}

// 定义商品接口
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  productType: number;
}

// 定义店铺接口
interface Store {
  id: number;
  name: string;
  addressText: string;
  logoUrl: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  description?: string;
}

// 定义评论接口
interface Review {
  name: string;
  avatar: string;
  date: string;
  stars: string;
  content: string;
}

const route = useRoute()
const router = useRouter()
const storeId = ref(route.params.id as string)
const loading = ref(true)
const activeTab = ref('pet')
const mapDialogVisible = ref(false)
const mapContainer = ref(null)
const showDirections = ref(false)
const userLocation = ref({ lng: 116.404, lat: 39.915 }) // 默认位置（北京）

// 店铺信息
const store = ref<Store>({
  id: 0,
  name: '',
  addressText: '',
  logoUrl: '',
  contactPhone: '',
  latitude: 0,
  longitude: 0
})

// 店铺商品
const products = ref<Product[]>([])

// 模拟评论数据
const mockReviews: Review[] = [
  {
    name: '张明',
    avatar: '/assets/avatars/avatar1.jpg',
    date: '2023-05-15',
    stars: '★★★★★',
    content: '狗粮质量真不错里的物美价廉，品质很好，宠物很喜欢，会继续回购！'
  },
  {
    name: '李琳',
    avatar: '/assets/avatars/avatar2.jpg',
    date: '2023-04-28',
    stars: '★★★★★',
    content: '商品样式很好，服务态度好，就是价格稍微有点贵，但质量确实不错。'
  },
  {
    name: '王强',
    avatar: '/assets/avatars/avatar3.jpg',
    date: '2023-04-10',
    stars: '★★★★★',
    content: '给猫咪买的玩具真的很好，猫咪很喜欢玩，物有所值，非常满意！'
  }
]

// 按类型筛选商品
const petProducts = computed(() => {
  return products.value.filter(product => product.productType === 1)
})

const accessoryProducts = computed(() => {
  return products.value.filter(product => product.productType === 2)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 查看商品详情
const viewProduct = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 显示地图
const showMap = () => {
  mapDialogVisible.value = true
  showDirections.value = false
  
  // 在对话框显示后渲染地图
  setTimeout(() => {
    if (window.AMap && mapContainer.value) {
      renderMap()
    } else {
      ElMessage.warning('地图服务暂不可用')
    }
  }, 300)
}

// 显示路线
const showRoute = () => {
  mapDialogVisible.value = true
  showDirections.value = true
  
  // 在对话框显示后渲染地图
  setTimeout(() => {
    if (window.AMap && mapContainer.value) {
      renderMap()
    } else {
      ElMessage.warning('地图服务暂不可用')
    }
  }, 300)
}

// 渲染地图
const renderMap = () => {
  if (!window.AMap || !mapContainer.value) return
  
  const map = new window.AMap.Map(mapContainer.value, {
    zoom: 15,
    center: [store.value.longitude, store.value.latitude]
  })
  
  // 添加店铺标记
  new window.AMap.Marker({
    position: [store.value.longitude, store.value.latitude],
    title: store.value.name,
    map: map
  })
  
  // 如果需要显示导航路线
  if (showDirections.value) {
    // 添加用户位置标记
    new window.AMap.Marker({
      position: [userLocation.value.lng, userLocation.value.lat],
      title: '我的位置',
      icon: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      map: map
    })
    
    // 添加两点间的路线
    const driving = new window.AMap.Driving({
      map: map,
      panel: false
    })
    
    driving.search(
      [userLocation.value.lng, userLocation.value.lat],
      [store.value.longitude, store.value.latitude]
    )
  }
}

// 获取用户位置
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        }
      },
      (error) => {
        console.error('获取位置失败:', error)
      }
    )
  } else {
    console.error('浏览器不支持地理位置服务')
  }
}

// 获取店铺详情
const fetchStoreDetail = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/user/stores/${storeId.value}`)
    store.value = response.data
  } catch (error) {
    console.error('获取店铺详情失败:', error)
    ElMessage.error('获取店铺详情失败，请稍后重试')
    
    // 使用模拟数据（实际开发中应删除）
    store.value = {
      id: 1,
      name: '萌宠乐园',
      addressText: '上海市浦东新区张江高科技园区科苑路88号',
      logoUrl: '/assets/stores/store1.jpg',
      contactPhone: '400-123-4567',
      latitude: 31.2304,
      longitude: 121.4737,
      description: '专业宠物用品店，一站式宠物体验，为您和您的爱宠提供最优质服务'
    }
  } finally {
    loading.value = false
  }
}

// 获取店铺商品
const fetchStoreProducts = async () => {
  try {
    const response = await axios.get(`/api/user/stores/${storeId.value}/products`)
    products.value = response.data
  } catch (error) {
    console.error('获取店铺商品失败:', error)
    
    // 使用模拟数据（实际开发中应删除）
    products.value = [
      {
        id: 1,
        name: '皇家小型犬成犬粮 3kg',
        description: '适合小型犬',
        price: 198,
        imageUrl: '/assets/products/dogfood.jpg',
        productType: 2
      },
      {
        id: 2,
        name: '海勒六种鱼全猫粮 5.4kg',
        description: '适合所有猫咪',
        price: 589,
        imageUrl: '/assets/products/catfood.jpg',
        productType: 2
      },
      {
        id: 3,
        name: 'ZEAL 宠物牛奶 380ml*6',
        description: '高营养配方',
        price: 89,
        imageUrl: '/assets/products/milk.jpg',
        productType: 2
      },
      {
        id: 4,
        name: 'KONG 经典漏食玩具 中号',
        description: '耐咬互动',
        price: 128,
        imageUrl: '/assets/products/toy.jpg',
        productType: 2
      },
      {
        id: 5,
        name: '福莱尔 伸缩牵引绳 5m',
        description: '结实耐用',
        price: 159,
        imageUrl: '/assets/products/leash.jpg',
        productType: 2
      },
      {
        id: 6,
        name: '小佩 智能饮水机 2代',
        description: '智能过滤',
        price: 299,
        imageUrl: '/assets/products/waterer.jpg',
        productType: 2
      }
    ]
  }
}

onMounted(() => {
  fetchStoreDetail()
  fetchStoreProducts()
  getUserLocation()
})
</script>

<style scoped>
.store-detail-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #fff;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.store-header {
  margin-bottom: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 0 20px;
}

.store-content {
  display: flex;
  flex-direction: column;
  background-color: white;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
}

.store-banner {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.store-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
}

.store-info-overlay h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.store-info-detail {
  display: flex;
  gap: 20px;
}

.store-address, .store-phone {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.store-address i, .store-phone i {
  margin-right: 5px;
}

.store-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.store-products {
  margin-bottom: 40px;
}

.store-products h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 16px;
  color: #333;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

/* 店铺信息部分 */
.store-info-section {
  margin-bottom: 40px;
}

.store-info-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.store-info-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.store-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.store-detail-item {
  display: flex;
  flex-direction: column;
}

.store-detail-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.store-detail-value {
  color: #666;
}

/* 用户评价部分 */
.store-reviews {
  margin-bottom: 40px;
}

.store-reviews h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.store-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.store-rating-score {
  font-size: 36px;
  font-weight: bold;
  color: #ff9800;
  margin-right: 20px;
}

.store-rating-stars {
  color: #ff9800;
  font-size: 20px;
  margin-right: 10px;
}

.store-rating-count {
  color: #999;
}

.review-list {
  margin-bottom: 20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .store-details {
    grid-template-columns: 1fr;
  }
}
</style> 