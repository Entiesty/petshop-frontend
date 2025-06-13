<template>
  <div class="orders-container">
    <div class="page-header">
      <h1>我的订单</h1>
    </div>
    
    <div class="order-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部订单" name="all"></el-tab-pane>
        <el-tab-pane label="待付款" name="pending_payment"></el-tab-pane>
        <el-tab-pane label="待发货" name="pending_shipment"></el-tab-pane>
        <el-tab-pane label="待收货" name="pending_receipt"></el-tab-pane>
        <el-tab-pane label="已完成" name="completed"></el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="orders-list">
      <!-- 订单列表示例 -->
      <div class="order-card" v-for="i in 3" :key="i">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号: 2023{{ 1000 + i }}</span>
            <span class="order-date">下单时间: 2023-12-{{ 10 + i }}</span>
          </div>
          <div class="order-status" :class="`status-${i % 5}`">
            {{ ['待付款', '待发货', '待收货', '已完成', '已取消'][i % 5] }}
          </div>
        </div>
        
        <div class="order-items">
          <div class="order-item">
            <div class="item-image">
              <img src="@/assets/homelogo.png" alt="商品图片">
            </div>
            <div class="item-info">
              <div class="item-name">宠物商品示例 {{ i }}</div>
              <div class="item-price">¥{{ 99 + i * 10 }}.00</div>
              <div class="item-quantity">x{{ i }}</div>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span>共{{ i }}件商品</span>
            <span class="total-price">合计: ¥{{ (99 + i * 10) * i }}.00</span>
          </div>
          <div class="order-actions">
            <el-button size="small" v-if="i % 5 === 0">去付款</el-button>
            <el-button size="small" v-if="i % 5 === 2">确认收货</el-button>
            <el-button size="small" v-if="i % 5 === 3">再次购买</el-button>
            <el-button size="small" v-if="i % 5 === 0">取消订单</el-button>
            <el-button size="small">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElTabs, ElTabPane, ElButton } from 'element-plus'

const activeTab = ref('all')
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.order-tabs {
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.order-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.order-status {
  font-weight: bold;
  font-size: 14px;
}

.status-0 { color: #e6a23c; } /* 待付款 */
.status-1 { color: #409eff; } /* 待发货 */
.status-2 { color: #67c23a; } /* 待收货 */
.status-3 { color: #909399; } /* 已完成 */
.status-4 { color: #f56c6c; } /* 已取消 */

.order-items {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.order-item {
  display: flex;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.item-price {
  font-size: 14px;
  color: #f56c6c;
}

.item-quantity {
  font-size: 14px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.total-price {
  margin-left: 10px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  gap: 10px;
}
</style>