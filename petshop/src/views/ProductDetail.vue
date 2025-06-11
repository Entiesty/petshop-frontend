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
        <div class="product-banner">
          <img :src="product.mainImageUrl || '/assets/product-default.jpg'" :alt="product.name">
        </div>

        <div class="product-info-section">
          <h1 class="product-title">{{ product.name }}</h1>

          <div class="product-basic-info">
            <div class="info-item">
              <span class="label">品种:</span>
              <span class="value">{{ product.breed || product.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄:</span>
              <span class="value">{{ product.age || '6 个月' }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别:</span>
              <span class="value">{{ product.sex || '雄性' }}</span>
            </div>
            <div class="info-item">
              <span class="label">体重:</span>
              <span class="value">{{ product.weight || '25 kg' }}</span>
            </div>
            <div class="info-item">
              <span class="label">颜色:</span>
              <span class="value">{{ product.color || '浅金色' }}</span>
            </div>
            <div class="info-item">
              <span class="label">价格:</span>
              <span class="value price">¥ {{ product.price || '6,800' }}</span>
            </div>
          </div>

          <div class="product-description">
            <h2>宠物描述</h2>
            <p>{{ product.description || '阳光一只非常活泼可爱的金毛寻回犬，性格温顺亲人，已经养了几个月的他很健康，和非常喜欢和人互动，对特别适合家庭饲养，热爱户外活动，特别适合有小孩子的家庭。' }}</p>
          </div>

          <div class="health-info">
            <h2>健康信息</h2>

            <div class="health-columns">
              <div class="health-column">
                <h3>疫苗接种情况:</h3>
                <ul>
                  <li>犬瘟热疫苗 - 已完成</li>
                  <li>狂犬疫苗 - 已完成</li>
                  <li>细小病毒疫苗 - 已完成</li>
                </ul>
              </div>

              <div class="health-column">
                <h3>驱虫检查:</h3>
                <ul>
                  <li>体内外驱虫 - 已完成</li>
                  <li>血液检查 - 正常</li>
                  <li>粪便检查 - 通过</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="store-section">
            <div class="store-info">
              <h2>{{ store?.name || '爱宠之家精品宠物店' }}</h2>
              <p>{{ store?.description || '专业宠物用品店，提供优质服务10年，提供优质健康服务' }}</p>
              <el-button type="primary" size="small" @click="viewStore" class="store-btn">查看店铺全部宠物</el-button>
            </div>
          </div>

          <div class="product-actions">
            <el-button type="default" @click="addToFavorites">收藏</el-button>
            <el-button type="primary" @click="addToCart">加入购物车</el-button>
          </div>
        </div>

        <div class="reviews-section">
          <h2>用户评价</h2>
          <div class="rating-summary">
            <div class="rating-score">4.8</div>
            <div class="rating-stars">★★★★★</div>
            <div class="rating-count">基于 128 条评价</div>
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
              <div class="review-images" v-if="review.images && review.images.length">
                <img v-for="(img, imgIndex) in review.images" :key="imgIndex" :src="img" class="review-image">
              </div>
            </div>
          </div>

          <div class="view-more-reviews">
            <el-button type="text">查看全部评价 ></el-button>
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
  mainImageUrl: '',
  videoUrl: '',
  storeId: 0,
  productType: 0,
  breed: '',
  age: '',
  sex: '',
  weight: '',
  color: '',
  healthInfo: '',
  averageRating: 0,
  reviewCount: 0
})
const store = ref<any>(null)

// 模拟评论数据
const mockReviews = [
  {
    name: '张雨薇',
    avatar: '/assets/avatars/avatar1.jpg',
    date: '2023-10-15',
    stars: '★★★★★',
    content: '阳光真的一只非常可爱的金毛，性格温顺，已经养了几个月了，非常健康活泼。爱家里所有人，推荐这家宠物店。',
    images: ['/assets/reviews/review1.jpg', '/assets/reviews/review2.jpg']
  },
  {
    name: '李志强',
    avatar: '/assets/avatars/avatar2.jpg',
    date: '2023-09-28',
    stars: '★★★★☆',
    content: '从宠物店买了只金毛幼犬，品种很纯正，阳光特别很听指令，已经养了几个多月了。总体很满意小狗狗。',
    images: []
  }
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 查看店铺
const viewStore = () => {
  if (store.value && store.value.id) {
    router.push(`/store/${store.value.id}`)
  } else {
    ElMessage.warning('店铺信息不完整')
  }
}

// 添加到收藏
const addToFavorites = () => {
  ElMessage.success('收藏成功')
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    console.log('开始获取商品详情，ID:', productId.value) // 调试日志

    const response = await axios.get(`/api/user/products/${productId.value}`)
    console.log('商品详情响应:', response.data) // 调试日志

    // 直接使用后端返回的数据，因为后端返回的是ProductDetailViewDto
    product.value = response.data

    // 从商品数据中获取商店信息（后端已经包含在response.data.store中）
    if (response.data.store) {
      store.value = response.data.store
      console.log('商店信息:', store.value) // 调试日志
    }

    loading.value = false
    console.log('商品详情加载完成:', product.value) // 调试日志

  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败，请稍后重试')

    // 使用模拟数据（实际开发中应删除）
    setTimeout(() => {
      product.value = {
        id: 1,
        name: '金毛寻回犬 - 阳光',
        description: '阳光一只非常活泼可爱的金毛寻回犬，性格温顺亲人，已经养了几个月的他很健康，和非常喜欢和人互动，对特别适合家庭饲养，热爱户外活动，特别适合有小孩子的家庭。',
        price: 6800,
        originalPrice: 0,
        mainImageUrl: '/assets/pets/golden.jpg',
        videoUrl: '',
        storeId: 1,
        productType: 1,
        breed: '金毛寻回犬',
        age: '6 个月',
        sex: '雄性',
        weight: '25 kg',
        color: '浅金色',
        healthInfo: '',
        averageRating: 0,
        reviewCount: 0
      }
      store.value = {
        id: 1,
        name: '爱宠之家精品宠物店',
        description: '专业宠物用品店，提供优质服务10年，提供优质健康服务'
      }
      loading.value = false
    }, 1000)
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

.product-header {
  margin-bottom: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 0 20px;
}

.product-content {
  display: flex;
  flex-direction: column;
  background-color: white;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
}

.product-banner {
  width: 100%;
  height: 350px;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 8px;
}

.product-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  margin-bottom: 30px;
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.product-basic-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.info-item {
  display: flex;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 60px;
}

.value {
  color: #666;
}

.value.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.product-description {
  margin-bottom: 30px;
}

.product-description h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.product-description p {
  line-height: 1.6;
  color: #666;
}

.health-info {
  margin-bottom: 30px;
}

.health-info h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.health-columns {
  display: flex;
  gap: 40px;
}

.health-column {
  flex: 1;
}

.health-column h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.health-column ul {
  list-style-type: none;
  padding: 0;
}

.health-column li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
  color: #666;
}

.health-column li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}

.store-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.store-info h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.store-info p {
  margin-bottom: 15px;
  color: #666;
}

.store-btn {
  margin-top: 10px;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.reviews-section {
  margin-bottom: 40px;
}

.reviews-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.rating-summary {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.rating-score {
  font-size: 36px;
  font-weight: bold;
  margin-right: 20px;
  color: #ff9800;
}

.rating-stars {
  color: #ff9800;
  font-size: 20px;
  margin-right: 20px;
}

.rating-count {
  color: #999;
}

.review-list {
  margin-bottom: 20px;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.reviewer-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.reviewer-name {
  font-weight: bold;
  margin-right: 15px;
}

.review-date {
  color: #999;
  font-size: 14px;
}

.review-stars {
  color: #ff9800;
  margin-bottom: 10px;
}

.review-content {
  line-height: 1.6;
  margin-bottom: 15px;
  color: #666;
}

.review-images {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.review-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.view-more-reviews {
  text-align: center;
}

@media (max-width: 768px) {
  .product-basic-info {
    grid-template-columns: 1fr;
  }

  .health-columns {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
