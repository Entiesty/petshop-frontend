<template>
  <div class="wallet-container">
    <div class="page-header">
      <h1>我的钱包</h1>
    </div>
    
    <div class="wallet-card">
      <div class="balance-section">
        <div class="balance-label">当前余额</div>
        <div class="balance-amount">¥{{ balance.toFixed(2) }}</div>
        <el-button type="primary" @click="showRechargeDialog" class="recharge-btn">
          <el-icon><Plus /></el-icon> 充值
        </el-button>
      </div>
      
      <div class="wallet-info">
        <div class="info-item">
          <div class="info-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="info-text">
            <p>钱包余额可用于商城内购物</p>
            <p>充值金额将实时到账</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="transaction-history">
      <div class="section-title">交易记录</div>
      
      <div class="empty-state" v-if="transactions.length === 0">
        <el-empty description="暂无交易记录"></el-empty>
      </div>
      
      <div class="transaction-list" v-else>
        <div class="transaction-item" v-for="(transaction, index) in transactions" :key="index">
          <div class="transaction-info">
            <div class="transaction-type">{{ transaction.type }}</div>
            <div class="transaction-time">{{ transaction.time }}</div>
          </div>
          <div class="transaction-amount" :class="{ 'amount-positive': transaction.amount > 0 }">
            {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 充值对话框 -->
    <el-dialog v-model="rechargeDialogVisible" title="钱包充值" width="400px">
      <div class="recharge-form">
        <div class="amount-options">
          <div 
            v-for="amount in [50, 100, 200, 500, 1000]" 
            :key="amount"
            class="amount-option"
            :class="{ 'active': rechargeAmount === amount }"
            @click="rechargeAmount = amount"
          >
            ¥{{ amount }}
          </div>
        </div>
        
        <div class="custom-amount">
          <el-input 
            v-model="customAmount" 
            placeholder="其他金额" 
            type="number"
            @input="handleCustomAmountInput"
          >
            <template #prefix>¥</template>
          </el-input>
        </div>
        
        <div class="payment-methods">
          <div class="section-title">支付方式</div>
          <div class="payment-options">
            <div class="payment-option active">
              <img src="@/assets/homelogo.png" alt="支付宝" class="payment-icon">
              <span>支付宝</span>
            </div>
            <div class="payment-option">
              <img src="@/assets/homelogo.png" alt="微信支付" class="payment-icon">
              <span>微信支付</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRecharge" :disabled="!rechargeAmount">
            确认充值 ¥{{ rechargeAmount.toFixed(2) }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElButton, ElDialog, ElInput, ElEmpty, ElMessage } from 'element-plus'
import { Plus, InfoFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { WALLET_API } from '../api/config'

const balance = ref(0)
const transactions = ref([])
const rechargeDialogVisible = ref(false)
const rechargeAmount = ref(100)
const customAmount = ref('')

// 获取钱包余额
const fetchBalance = async () => {
  try {
    const response = await axios.get(WALLET_API.BALANCE)
    balance.value = response.data.balance
  } catch (error) {
    console.error('获取钱包余额失败:', error)
    ElMessage.error('获取钱包余额失败')
  }
}

// 显示充值对话框
const showRechargeDialog = () => {
  rechargeDialogVisible.value = true
  rechargeAmount.value = 100
  customAmount.value = ''
}

// 处理自定义金额输入
const handleCustomAmountInput = () => {
  if (customAmount.value) {
    rechargeAmount.value = parseFloat(customAmount.value)
  } else {
    rechargeAmount.value = 100
  }
}

// 处理充值
const handleRecharge = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    ElMessage.warning('请输入有效的充值金额')
    return
  }
  
  try {
    await axios.post(WALLET_API.RECHARGE, {
      amount: rechargeAmount.value
    })
    
    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    
    // 刷新余额
    fetchBalance()
    
    // 添加一条充值记录
    transactions.value.unshift({
      type: '钱包充值',
      amount: rechargeAmount.value,
      time: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('充值失败:', error)
    ElMessage.error('充值失败，请稍后再试')
  }
}

onMounted(() => {
  fetchBalance()
})
</script>

<style scoped>
.wallet-container {
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

.wallet-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

.balance-section {
  text-align: center;
  margin-bottom: 30px;
}

.balance-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.balance-amount {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

.recharge-btn {
  padding: 12px 30px;
  font-size: 16px;
}

.wallet-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-icon {
  color: #409eff;
  font-size: 24px;
}

.info-text p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.transaction-history {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.transaction-type {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.transaction-time {
  font-size: 14px;
  color: #999;
}

.transaction-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.amount-positive {
  color: #67c23a;
}

.recharge-form {
  padding: 0 20px;
}

.amount-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.amount-option {
  flex: 1;
  min-width: 80px;
  padding: 12px 0;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-option:hover {
  border-color: #409eff;
}

.amount-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
}

.custom-amount {
  margin-bottom: 20px;
}

.payment-methods {
  margin-top: 30px;
}

.payment-options {
  display: flex;
  gap: 15px;
}

.payment-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #409eff;
}

.payment-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.payment-icon {
  width: 24px;
  height: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>