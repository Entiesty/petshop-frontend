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
          <el-button type="primary" @click="navigateToStore">
            <i class="el-icon"><Position /></i>
            导航路线
          </el-button>
        </div>
        
        <div class="store-info-section">
          <h2>店铺信息</h2>
          <div class="store-info-card">
            <div class="store-details">
              <div class="store-detail-item" v-if="store.contactPhone">
                <span class="store-detail-label">联系方式</span>
                <span class="store-detail-value">{{ store.contactPhone }}</span>
              </div>
              <div class="store-detail-item" v-if="store.addressText">
                <span class="store-detail-label">店铺地址</span>
                <span class="store-detail-value">{{ store.addressText }}</span>
              </div>
            </div>
            <div class="store-description" v-if="store.description">
              <p>{{ store.description }}</p>
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
                    <img :src="product.mainImageUrl || '/assets/pet-default.jpg'" :alt="product.name">
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
                    <img :src="product.mainImageUrl || '/assets/product-default.jpg'" :alt="product.name">
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
          <el-empty description="暂无用户评价" />
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
  mainImageUrl: string;
  storeId: number;
  categoryId: number;
  breed?: string;
  age?: string;
  sex?: string;
  weight?: number;
  color?: string;
  healthInfo?: string;
  stock?: number;
  videoUrl?: string;
  averageRating?: number;
  reviewCount?: number;
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

// 评论数据（暂无数据）
const reviews = ref<Review[]>([])

// 按类别筛选商品（根据categoryId或其他规则）
const petProducts = computed(() => {
  // 暂时返回所有商品，后续可根据实际业务规则筛选
  return products.value
})

const accessoryProducts = computed((): Product[] => {
  // 暂时返回空数组，后续可根据实际业务规则筛选
  return []
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

// 导航到店铺
const navigateToStore = () => {
  const { name, latitude, longitude } = store.value;
  
  if (!latitude || !longitude || !name) {
    ElMessage.warning('店铺位置信息不完整');
    return;
  }

  // 判断是否是移动设备
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

  if (isMobile) {
    // 移动端：尝试唤起高德地图App
    const appSchemeUrl = `iosamap://navi?sourceApplication=PetShop&poiname=${encodeURIComponent(name)}&lat=${latitude}&lon=${longitude}&dev=1&style=2`;
    window.location.href = appSchemeUrl;

    // Fallback 逻辑：如果App没唤起，几秒后跳转到网页版
    const timeout = setTimeout(() => {
      if (confirm('检测到您未安装高德地图App或唤起失败，是否跳转到高德地图网页版进行导航？')) {
        const webNavUrl = `https://uri.amap.com/navigation?from=&to=${longitude},${latitude},${encodeURIComponent(name)}&mode=car&policy=1&src=PetShop&coordinate=gaode`;
        window.open(webNavUrl, '_blank');
      }
    }, 800);

    // 监听页面可见性变化来清除计时器
    const visibilitychangeHandler = () => {
      if (document.hidden || (document as any).webkitHidden) {
        clearTimeout(timeout);
        document.removeEventListener('visibilitychange', visibilitychangeHandler);
        document.removeEventListener('webkitvisibilitychange', visibilitychangeHandler);
      }
    };
    document.addEventListener('visibilitychange', visibilitychangeHandler);
    document.addEventListener('webkitvisibilitychange', visibilitychangeHandler);
  } else {
    // 桌面端：直接跳转到高德地图网页版
    const webNavUrl = `https://uri.amap.com/navigation?from=&to=${longitude},${latitude},${encodeURIComponent(name)}&mode=car&policy=1&src=PetShop&coordinate=gaode`;
    window.open(webNavUrl, '_blank');
  }
};

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
    
    // 如果店铺详情包含商品数据，直接使用
    if (response.data.products && response.data.products.records) {
      products.value = response.data.products.records
    }
  } catch (error) {
    console.error('获取店铺详情失败:', error)
    ElMessage.error('获取店铺详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStoreDetail()
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
  flex-wrap: wrap;
  align-items: center;
}

.store-actions .el-button {
  min-width: 120px;
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
  
  .store-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .store-actions .el-button {
    width: 100%;
    min-width: auto;
  }
  
  .store-info-detail {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 