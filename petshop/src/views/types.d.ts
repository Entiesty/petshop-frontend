// 用户信息接口
interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar_url?: string;
  role: number; // 0-会员, 1-管理员
}

// 登录表单接口
interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

// 注册表单接口
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// API响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 登录响应数据
interface LoginResponseData {
  token: string;
  user: UserInfo;
}

export {
  UserInfo,
  LoginForm,
  RegisterForm,
  ApiResponse,
  LoginResponseData
}; 