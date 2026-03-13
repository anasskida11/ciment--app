"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AlertCircle,
  Users,
  Package,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Bell,
  Check,
  CheckCheck,
} from "lucide-react"
import { orderService } from "@/features/orders/services/order.service"
import { productService } from "@/features/products/services/product.service"
import { accountService } from "@/features/accounts/services/account.service"
import { notificationService, type Notification } from "@/lib/notification.service"
import type { Order } from "@/features/orders/types"
import type { Product } from "@/features/products/types"
import type { Account } from "@/features/accounts/types"

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-white p-2 border border-slate-200 rounded text-right shadow-lg">
        {payload[0].value.toFixed(2)} أ.م
      </div>
    )
  }
  return null
}

interface DashboardOrder {
  date?: string;
  total: number;
}

interface DashboardProduct {
  name: string;
  stock: number;
  minStock?: number;
}

interface DashboardAccount {
  name: string;
  type: string;
  balance: number;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [products, setProducts] = useState<DashboardProduct[]>([])
  const [accounts, setAccounts] = useState<DashboardAccount[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "focused">("grid")

  const [filterType, setFilterType] = useState("all")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersData, productsData, accountsData, notificationsData] = await Promise.all([
          orderService.getAll(),
          productService.getAll(),
          accountService.getAll(),
          notificationService.getAll(),
        ])

        const mappedOrders: DashboardOrder[] = (ordersData as Order[]).map((order) => ({
          date: order.createdAt,
          total: Number(order.totalAmount || 0),
        }))

        const mappedProducts: DashboardProduct[] = (productsData as Product[]).map((product) => ({
          name: product.name,
          stock: Number(product.stock || 0),
          minStock: product.minStock ? Number(product.minStock) : undefined,
        }))

        const mappedAccounts: DashboardAccount[] = (accountsData as Account[]).map((account) => ({
          name: account.client?.name || account.supplier?.name || account.id,
          type: account.accountType,
          balance: Number(account.balance || 0),
        }))

        setOrders(mappedOrders)
        setProducts(mappedProducts)
        setAccounts(mappedAccounts)
        setNotifications(notificationsData)
      } catch (error) {
        setOrders([])
        setProducts([])
        setAccounts([])
      }
    }

    loadDashboardData()
  }, [])

  const getFilteredOrders = () => {
    const today = new Date()
    let filteredOrders = [...orders]

    switch (filterType) {
      case "last5days":
        const fiveDaysAgo = new Date(today)
        fiveDaysAgo.setDate(today.getDate() - 5)
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.date || new Date())
          return orderDate >= fiveDaysAgo && orderDate <= today
        })
        break

      case "lastmonth":
        const oneMonthAgo = new Date(today)
        oneMonthAgo.setMonth(today.getMonth() - 1)
        filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.date || new Date())
          return orderDate >= oneMonthAgo && orderDate <= today
        })
        break

      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          filteredOrders = orders.filter((order) => {
            const orderDate = new Date(order.date || new Date())
            return orderDate >= start && orderDate <= end
          })
        }
        break

      default:
        filteredOrders = orders
    }

    return filteredOrders
  }

  const filteredOrders = getFilteredOrders()

  const totalOrders = filteredOrders.length
  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0
  const lowStockProducts = products.filter((p) => p.stock < (p.minStock || 10))
  const criticalStockProducts = products.filter((p) => p.stock === 0)
  const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const accountsOwingMoney = accounts.filter((a) => a.balance < 0)
  const accountsOwnedMoney = accounts.filter((a) => a.balance > 0)
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Math.max(order.total, 0), 0)
  const totalDue = Math.abs(filteredOrders.reduce((sum, order) => sum + Math.min(order.total, 0), 0))

  // Data for charts
  const ordersTrend = filteredOrders.slice(-7).map((order, idx) => ({
    date: `اليوم ${idx + 1}`,
    value: order.total,
  }))

  const accountBalanceData = [
    {
      name: "نننا تدين بأموال",
      value: Math.abs(accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)),
    },
    { name: "لنا أموال مستحقة", value: accounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0) },
  ]

  const stockData = products.slice(0, 5).map((p) => ({
    name: p.name,
    stock: p.stock,
    minStock: p.minStock || 10,
  }))

  const COLORS = ["rgb(239,68,68)", "rgb(34,197,94)"]

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: "blue" | "red" | "green";
  status?: string;
}

  const KPICard = ({ title, value, icon: Icon, trend, color = "blue", status = "normal" }: KPICardProps) => (
    <Card
      className={`border-l-4 ${color === "red" ? "border-l-red-500 bg-red-50" : color === "green" ? "border-l-green-500 bg-green-50" : "border-l-blue-500 bg-blue-50"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 text-right mb-1">{title}</p>
            <p
              className={`text-2xl font-bold text-right ${color === "red" ? "text-red-600" : color === "green" ? "text-green-600" : "text-blue-600"}`}
            >
              {typeof value === "number" && value > 1000 ? (value / 1000).toFixed(1) + "K" : value}
            </p>
          </div>
          <Icon
            className={`h-8 w-8 ${color === "red" ? "text-red-500" : color === "green" ? "text-green-500" : "text-blue-500"}`}
          />
        </div>
        {trend && <p className="text-xs text-slate-500 text-right mt-2">{trend}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")} size="sm">
              <Eye className="h-4 w-4 ml-2" />
              عرض شامل
            </Button>
            <Button
              variant={viewMode === "focused" ? "default" : "outline"}
              onClick={() => setViewMode("focused")}
              size="sm"
            >
              <EyeOff className="h-4 w-4 ml-2" />
              عرض مركز
            </Button>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-600 text-sm">نظام إدارة الشركة المتقدم</p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="ابحث عن طلب أو عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-right placeholder-slate-400"
          />
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardHeader className="text-right pb-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {notifications.some(n => !n.isRead) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-700 hover:text-amber-900"
                      onClick={async () => {
                        await notificationService.markAllAsRead()
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                      }}
                    >
                      <CheckCheck className="h-4 w-4 ml-1" />
                      قراءة الكل
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-amber-800">الإشعارات</CardTitle>
                  <Bell className="h-5 w-5 text-amber-600" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                      notification.isRead
                        ? "bg-white border-slate-200"
                        : "bg-amber-100 border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-amber-600 hover:text-green-600"
                          onClick={async () => {
                            await notificationService.markAsRead(notification.id)
                            setNotifications(prev =>
                              prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                            )
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`text-sm ${notification.isRead ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Filter Card */}
        <Card className="mb-8 bg-white border-slate-200">
          <CardHeader className="text-right">
            <div className="flex items-center gap-2 justify-end mb-4">
              <CardTitle>فلتر التواريخ</CardTitle>
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-right">
            <div className="space-y-4">
              <div className="flex gap-2 justify-end flex-wrap">
                <Button
                  onClick={() => setFilterType("all")}
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-right"
                >
                  كل الطلبات
                </Button>
                <Button
                  onClick={() => setFilterType("last5days")}
                  variant={filterType === "last5days" ? "default" : "outline"}
                  size="sm"
                >
                  آخر 5 أيام
                </Button>
                <Button
                  onClick={() => setFilterType("lastmonth")}
                  variant={filterType === "lastmonth" ? "default" : "outline"}
                  size="sm"
                >
                  آخر شهر
                </Button>
                <Button
                  onClick={() => setFilterType("custom")}
                  variant={filterType === "custom" ? "default" : "outline"}
                  size="sm"
                >
                  نطاق مخصص
                </Button>
              </div>

              {filterType === "custom" && (
                <div className="flex gap-2 justify-end flex-wrap bg-slate-50 p-4 rounded-lg">
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded text-right"
                    />
                    <span className="text-slate-600">إلى</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded text-right"
                    />
                    <span className="text-slate-600">من</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="إجمالي الطلبات"
            value={totalOrders}
            icon={Package}
            color="blue"
            trend={`${totalOrders > 0 ? "جاهزة للمراجعة" : "لا توجد طلبات"}`}
          />
          <KPICard
            title="إجمالي المبيعات"
            value={`${totalOrderValue.toFixed(0)} أ.م`}
            icon={DollarSign}
            color="green"
            trend={`متوسط الطلب: ${averageOrderValue.toFixed(0)} أ.م`}
          />
          <KPICard
            title="المنتجات المنخفضة"
            value={lowStockProducts.length}
            icon={AlertCircle}
            color={lowStockProducts.length > 0 ? "red" : "blue"}
            trend={`${criticalStockProducts.length} منتج غير موجود`}
          />
          <KPICard
            title="الحسابات النشطة"
            value={accounts.length}
            icon={Users}
            color="blue"
            trend={`${accountsOwingMoney.length} يدينون بأموال`}
          />
        </div>

        {/* Critical Alerts */}
        {(criticalStockProducts.length > 0 || accountsOwingMoney.length > 5) && (
          <Card className="mb-8 border-red-300 bg-red-50">
            <CardHeader className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <CardTitle className="text-red-600">تنبيهات حرجة</CardTitle>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="text-right">
              <div className="space-y-2">
                {criticalStockProducts.length > 0 && (
                  <p className="text-red-700">
                    ⚠️ {criticalStockProducts.length} منتج(ات) غير موجودة في المخزن:{" "}
                    {criticalStockProducts.map((p) => p.name).join("، ")}
                  </p>
                )}
                {accountsOwingMoney.length > 5 && (
                  <p className="text-red-700">⚠️ هناك {accountsOwingMoney.length} حساب يدين بأموال أكثر من المتوقع</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend */}
            <Card className="col-span-1">
              <CardHeader className="text-right">
                <CardTitle>اتجاه المبيعات</CardTitle>
                <CardDescription className="text-right">آخر 7 طلبات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ direction: "rtl" }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="rgb(59,130,246)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Account Balance Distribution */}
            <Card className="col-span-1">
              <CardHeader className="text-right">
                <CardTitle>توزيع الرصيد</CardTitle>
                <CardDescription className="text-right">أموال مستحقة مقابل مستحقات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accountBalanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="rgb(136,132,216)"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="text-right">
                <CardTitle>حالة المخزون</CardTitle>
                <CardDescription className="text-right">المنتجات الخمسة الأولى</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ direction: "rtl" }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ direction: "rtl", textAlign: "right" }} />
                    <Bar dataKey="stock" fill="rgb(34,197,94)" name="المخزون الحالي" />
                    <Bar dataKey="minStock" fill="rgb(251,191,36)" name="الحد الأدنى" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access Section */}
        <Card className="bg-white">
          <CardHeader className="text-right">
            <CardTitle>الحسابات المستحقة</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {accounts.length === 0 ? (
                <p className="text-slate-500">لا توجد حسابات</p>
              ) : (
                accounts.slice(0, 5).map((acc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between ${acc.balance < 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                  >
                    <div>
                      <p className="font-semibold">{acc.name}</p>
                      <p className="text-sm text-slate-600">{acc.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.balance < 0 ? (
                        <ArrowDownLeft className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      )}
                      <span className={`font-bold ${acc.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                        {acc.balance.toFixed(0)} أ.م
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
