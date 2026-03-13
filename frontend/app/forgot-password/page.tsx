"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Mail, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      
      setEmailSent(true)
      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال طلبك بنجاح',
      })
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error?.message || 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">تم استلام طلبك</CardTitle>
            <CardDescription className="text-lg">
              سيقوم المسؤول بمراجعة طلبك وإعادة تعيين كلمة المرور الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              يرجى الانتظار حتى يقوم المسؤول بإعادة تعيين كلمة المرور الخاصة بك. سيتم إبلاغك عند الانتهاء.
            </p>
            <Link href="/login">
              <Button className="w-full" variant="outline">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">نسيت كلمة المرور؟</CardTitle>
          <CardDescription className="text-lg">
            أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pr-10"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>

            <Link href="/login">
              <Button type="button" variant="outline" className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
