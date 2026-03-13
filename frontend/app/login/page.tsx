"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Récupérer le paramètre redirect de l'URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirectTo = searchParams?.get('redirect') || '/'

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: {
          user: {
            id: string
            email: string
            firstName: string
            lastName: string
            role: string
          }
          token: string
        }
      }>('/auth/login', {
        email: data.email,
        password: data.password,
      })

      if (response.success && response.data?.token) {
        // Stocker le token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدخول بنجاح',
        })

        // Rediriger vers la page demandée ou la page principale
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error: any) {
      // Ne pas logger l'erreur pour éviter l'overlay Next.js
      let errorMessage = 'فشل تسجيل الدخول'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.status === 401) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      }

      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">نظام إدارة الشركة</CardTitle>
          <CardDescription className="text-lg">
            سجل الدخول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pr-10"
                  {...loginForm.register('email')}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-destructive text-sm">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            <p className="text-xs">
              للوصول إلى النظام، يرجى التواصل مع المدير لإنشاء حساب لك
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
