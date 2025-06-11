<template>
  <div class="order-management">
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="filters">
        <el-select v-model="statusFilter" placeholder="选择订单状态" clearable style="width: 200px; margin-right: 10px;">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="待付款" :value="0"></el-option>
          <el-option label="待发货" :value="1"></el-option>
          <el-option label="待收货" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="已取消" :value="4"></el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或用户ID"
          style="width: 250px; margin-right: 10px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="searchOrders">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table
      :data="orders"
      v-loading="loading"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column prop="id" label="订单ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addressId" label="收货地址ID" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="paymentTime" label="支付时间" width="180">
        <template #default="scope">
          {{ scope.row.paymentTime ? formatDateTime(scope.row.paymentTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="viewOrderDetail(scope.row)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            type="warning"
            size="small"
            @click="updateOrderStatus(scope.row.id, 4)"
          >
            取消订单
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            type="success"
            size="small"
            @click="updateOrderStatus(scope.row.id, 2)"
          >
            发货
          </el-button>
          <el-popconfirm
            title="确定要删除这个订单吗？"
            @confirm="deleteOrder(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ selectedOrder.totalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(selectedOrder.status)">{{ getStatusText(selectedOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货地址ID">{{ selectedOrder.addressId }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(selectedOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ selectedOrder.paymentTime ? formatDateTime(selectedOrder.paymentTime) : '未支付' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(selectedOrder.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 订单商品列表 -->
        <div class="order-items" style="margin-top: 20px;">
          <h4>订单商品</h4>
          <el-table :data="orderItems" style="width: 100%">
            <el-table-column prop="productId" label="商品ID" width="100" />
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计" width="100">
              <template #default="scope">
                ¥{{ scope.row.totalPrice }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { adminOrderApi } from '../../api/admin'

// 响应式数据
const loading = ref(false)
const orders = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const searchKeyword = ref('')

// 订单详情相关
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)
const orderItems = ref([])

// 订单状态映射
const statusMap = {
  0: '待付款',
  1: '待发货', 
  2: '待收货',
  3: '已完成',
  4: '已取消'
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info', 
    3: 'success',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  return statusMap[status] || '未知状态'
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value,
      status: statusFilter.value || undefined,
      keyword: searchKeyword.value || undefined
    }
    const response = await adminOrderApi.getOrderList(params)
    orders.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置筛选条件
const resetFilters = () => {
  statusFilter.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = async (order: any) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
  
  // 获取订单商品列表
  try {
    const response = await adminOrderApi.getOrderItems(order.id)
    orderItems.value = response.data
  } catch (error) {
    ElMessage.error('获取订单商品失败')
    console.error('获取订单商品失败:', error)
  }
}

// 关闭详情对话框
const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedOrder.value = null
  orderItems.value = []
}

// 更新订单状态
const updateOrderStatus = async (orderId: number, status: number) => {
  try {
    await adminOrderApi.updateOrderStatus(orderId, status)
    ElMessage.success('订单状态更新成功')
    fetchOrders()
  } catch (error) {
    ElMessage.error('更新订单状态失败')
    console.error('更新订单状态失败:', error)
  }
}

// 删除订单
const deleteOrder = async (orderId: number) => {
  try {
    await adminOrderApi.deleteOrder(orderId)
    ElMessage.success('订单删除成功')
    fetchOrders()
  } catch (error) {
    ElMessage.error('删除订单失败')
    console.error('删除订单失败:', error)
  }
}

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchOrders()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOrders()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.filters {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.order-detail {
  max-height: 600px;
  overflow-y: auto;
}

.order-items h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-table .el-table__cell) {
  padding: 8px 0;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
}
</style>