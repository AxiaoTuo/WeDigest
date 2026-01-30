'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, History, Settings, LogOut, LogIn, Sparkles, Zap, Shield, CheckCircle2, ArrowRight, FileText, TrendingUp, Clock, Globe, Star, Users } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI 深度研报',
      description: '首席架构师视角，主动拓展技术背景和竞品对比，建立完整知识网络'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: '智能标签提取',
      description: '自动生成YAML元数据，支持Notion/Obsidian无缝导入'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '多模型支持',
      description: 'DeepSeek、OpenAI、智谱AI，灵活切换，性价比最优'
    }
  ]

  const benefits = [
    { icon: <Clock className="h-5 w-5" />, text: '节省80%阅读时间' },
    { icon: <TrendingUp className="h-5 w-5" />, text: '建立完整知识网络' },
    { icon: <FileText className="h-5 w-5" />, text: 'Markdown格式导出' },
    { icon: <Globe className="h-5 w-5" />, text: '支持多语言输出' }
  ]

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: '10K+', label: '活跃用户' },
    { icon: <FileText className="h-6 w-6" />, value: '50K+', label: '处理文章' },
    { icon: <Star className="h-6 w-6" />, value: '4.9', label: '用户评分' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">WeDigest</h1>
          </div>
          <div className="flex gap-2">
            {session ? (
              <>
                <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 hover:text-slate-900">
                  <BookOpen className="mr-2 h-4 w-4" />
                  开始使用
                </Button>
                <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 hover:text-slate-900">
                  <History className="mr-2 h-4 w-4" />
                  历史记录
                </Button>
                <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 hover:text-slate-900">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
                <Button variant="ghost" onClick={() => signOut()} className="text-slate-700 hover:text-slate-900">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 hover:text-slate-900">
                  开始使用
                </Button>
                <Button 
                  onClick={() => router.push('/login')} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  登录
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="container mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI驱动的智能阅读助手
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent leading-tight">
              将微信公众号文章转化为<br />
              <span className="text-indigo-600">深度研报级学习笔记</span>
            </h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto mb-10">
              首席技术架构师视角，主动拓展技术背景和知识网络，让阅读更高效、更系统
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => router.push('/app')} 
                className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                免费开始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="h-14 px-8 text-base border-2 border-slate-200 hover:border-indigo-300">
                了解更多
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 mb-20 border border-indigo-200">
            <h3 className="text-3xl font-bold text-slate-900 text-center mb-8">为什么选择 WeDigest?</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600">
                    {benefit.icon}
                  </div>
                  <span className="text-slate-700 text-lg font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">用户数据</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border-t border-slate-200">
          <div className="container mx-auto max-w-6xl px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">产品</h4>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">功能特性</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">使用案例</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">定价</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">资源</h4>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">文档</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">API文档</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">博客</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">公司</h4>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">关于我们</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">联系我们</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">加入我们</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">支持</h4>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">帮助中心</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">社区</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">反馈</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
              <p className="text-slate-500 text-sm">© 2026 WeDigest. All rights reserved.</p>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <a href="#" className="hover:text-indigo-600 transition-colors">隐私政策</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">服务条款</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Cookie政策</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
