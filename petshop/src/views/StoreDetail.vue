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

const route = useRoute()
const router = useRouter()
const storeId = ref(route.params.id)
const loading = ref(true)
const activeTab = ref('pet')
const mapDialogVisible = ref(false)
const mapContainer = ref(null)
const showDirections = ref(false)
const userLocation = ref({ lng: 116.404, lat: 39.915 }) // 默认位置（北京）

// 店铺信息
const store = ref({
  id: 0,
  name: '',
  addressText: '',
  logoUrl: '',
  contactPhone: '',
  latitude: 0,
  longitude: 0
})

// 店铺商品
const products = ref([])

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
const viewProduct = (productId) => {
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
  } finally {
    loading.value = false
  }
}

// 获取店铺商品
const fetchStoreProducts = async () => {
  try {
    const response = await axios.get(`/api/user/products/store/${storeId.value}`)
    products.value = response.data
  } catch (error) {
    console.error('获取店铺商品失败:', error)
    ElMessage.error('获取店铺商品失败，请稍后重试')
  }
}

onMounted(() => {
  // 获取用户位置
  getUserLocation()
  
  // 获取店铺详情和商品
  fetchStoreDetail()
  fetchStoreProducts()
  
  // 加载高德地图API
  if (!window.AMap) {
    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=您的高德地图Key'
    script.async = true
    document.head.appendChild(script)
  }
})
</script>

<style scoped>
.store-detail-container {
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

.store-header {
  margin-bottom: 20px;
}

.store-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.store-banner {
  position: relative;
  height: 300px;
  overflow: hidden;
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 30px 20px 20px;
  color: white;
}

.store-info-overlay h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.store-info-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.store-address, .store-phone {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.el-icon {
  margin-right: 5px;
}

.store-actions {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.store-products {
  padding: 20px;
}

.store-products h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 180px;
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
  margin-bottom: 8px;
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
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .store-banner {
    height: 200px;
  }
  
  .store-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .product-image {
    height: 150px;
  }
}
</style> 