'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, History, Settings, LogOut, LogIn, Sparkles, Zap, Shield, CheckCircle2, ArrowRight, FileText, TrendingUp, Clock, Globe, Star, Users, Link2, Bot, Eye, MessageSquare, BarChart3, Play, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useEffect, useState } from 'react'

// Animation on scroll hook
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.currentScript?.parentElement
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  return isVisible
}

export default function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI 深度研报',
      description: '首席架构师视角，主动拓展技术背景和竞品对比，建立完整知识网络',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: '智能标签提取',
      description: '自动生成YAML元数据，支持Notion/Obsidian无缝导入',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '多模型支持',
      description: 'DeepSeek、OpenAI、智谱AI，灵活切换，性价比最优',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ]

  const benefits = [
    { icon: <Clock className="h-5 w-5" />, text: '节省80%阅读时间' },
    { icon: <TrendingUp className="h-5 w-5" />, text: '建立完整知识网络' },
    { icon: <FileText className="h-5 w-5" />, text: 'Markdown格式导出' },
    { icon: <Globe className="h-5 w-5" />, text: '支持多语言输出' }
  ]

  const steps = [
    {
      icon: <Link2 className="h-6 w-6" />,
      title: '粘贴链接',
      description: '复制微信公众号文章链接'
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI 分析',
      description: '自动抓取并深度解析内容'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: '导出笔记',
      description: '获得结构化深度研报'
    }
  ]

  const testimonials = [
    {
      content: 'WeDigest 帮我将每周的阅读时间从10小时减少到2小时，而且知识掌握程度更高了。',
      author: '张明',
      role: '技术总监',
      company: '某互联网公司'
    },
    {
      content: '作为开发者，这个工具让我能快速跟进最新技术文章，AI的拓展功能非常有价值。',
      author: '李婷',
      role: '高级工程师',
      company: '知名科技公司'
    },
    {
      content: '最让我惊喜的是YAML元数据功能，直接导入到我的知识库中，工作流非常顺畅。',
      author: '王芳',
      role: '产品经理',
      company: 'AI创业公司'
    }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">WeDigest</h1>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <BookOpen className="mr-2 h-4 w-4" />
                  开始使用
                </Button>
                <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <History className="mr-2 h-4 w-4" />
                  历史记录
                </Button>
                <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
                <Button variant="ghost" onClick={() => signOut()} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  开始使用
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  登录
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Sparkles className="h-4 w-4" />
              AI驱动的智能阅读助手
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 dark:from-slate-100 via-indigo-800 to-purple-800 bg-clip-text text-transparent leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              将微信公众号文章转化为<br />
              <span className="text-indigo-600 dark:text-indigo-400 relative">
                深度研报级学习笔记
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4 Q50 0, 100 4 T200 4" stroke="url(#gradient)" strokeWidth="3" fill="none" className="opacity-30" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="currentColor" className="text-indigo-600" />
                      <stop offset="100%" stopColor="currentColor" className="text-purple-600" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              首席技术架构师视角，主动拓展技术背景和知识网络，让阅读更高效、更系统
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button
                onClick={() => router.push('/app')}
                className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                免费开始使用
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="h-14 px-8 text-base border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-300 hover:scale-105">
                了解更多
              </Button>
            </div>
          </div>

          {/* Bento Grid Features */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 cursor-pointer bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm group hover:-translate-y-2 hover:shadow-xl hover:shadow-${feature.gradient.split('-')[1]}-500/10`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl p-8 sm:p-12 mb-20 border border-indigo-200 dark:border-indigo-800 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">为什么选择 WeDigest?</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                    {benefit.icon}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-base font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Flow Section */}
          <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-4">简单三步，开始高效阅读</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-12 max-w-2xl mx-auto">无需学习复杂工具，粘贴链接即可获得结构化学习笔记</p>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-700 -translate-y-1/2" />
              <div className="hidden md:block absolute top-1/2 left-1/4 w-4 h-4 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse" />
              <div className="hidden md:block absolute top-1/2 left-2/4 w-4 h-4 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="hidden md:block absolute top-1/2 right-1/4 w-4 h-4 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse" style={{ animationDelay: '1s' }} />

              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center text-center pt-2">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">{step.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-4">用户反馈</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-12">来自数千用户的真实评价</p>

            <div className="max-w-3xl mx-auto">
              <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed mb-8 min-h-[100px]">
                    &ldquo;{testimonials[activeTestimonial].content}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {testimonials[activeTestimonial].author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{testimonials[activeTestimonial].author}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{testimonials[activeTestimonial].role} · {testimonials[activeTestimonial].company}</p>
                    </div>
                  </div>

                  {/* Testimonial indicators */}
                  <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === activeTestimonial ? 'w-8 bg-indigo-600 dark:bg-indigo-400' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Real-time Demo Preview Section */}
          <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-700 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-slate-700/50 rounded-lg px-4 py-1.5 text-sm text-slate-400 text-center">
                  app.wedigest.com
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side - Input */}
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-700 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="h-5 w-5 text-indigo-400" />
                    <h4 className="font-semibold text-slate-100">文章链接</h4>
                  </div>
                  <div className="bg-slate-900/50 dark:bg-slate-950/50 rounded-lg p-3 text-sm text-slate-400 mb-4 font-mono break-all">
                    https://mp.weixin.qq.com/s/example...
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <h4 className="font-semibold text-slate-100">AI 选项</h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>DeepSeek 模型</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>深度研报模板</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>实时流式输出</span>
                        </div>
                      </div>
                </div>

                {/* Right side - Output Preview */}
                <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-700 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-5 w-5 text-green-400" />
                    <h4 className="font-semibold text-slate-100">实时预览</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="animate-pulse">
                      <div className="h-3 bg-slate-700/50 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-slate-700/30 rounded w-full mb-1" />
                      <div className="h-2 bg-slate-700/30 rounded w-5/6" />
                    </div>
                    <div className="h-px bg-slate-700/50 my-3" />
                    <div className="flex flex-wrap gap-2">
                      {['React', 'SSR', '性能优化'].map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl shadow-indigo-500/30 overflow-hidden relative">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
              </div>

              <CardContent className="p-10 sm:p-16 text-center relative z-10">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                  准备好提升阅读效率了吗？
                </h3>
                <p className="text-indigo-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                  加入数千名用户，开始您的智能阅读之旅。完全免费，立即开始。
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => router.push('/app')}
                    size="lg"
                    className="h-14 px-10 text-base bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    立即开始
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-base border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    联系我们
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-white/20">
                  <div className="flex items-center gap-2 text-indigo-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">无需信用卡</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">数据加密存储</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">随时导出数据</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto max-w-6xl px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">产品</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">功能特性</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">使用案例</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">定价</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">资源</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">文档</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">API文档</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">博客</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">公司</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">关于我们</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">联系我们</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">加入我们</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">支持</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">帮助中心</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">社区</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">反馈</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-sm">© 2026 WeDigest. All rights reserved.</p>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">隐私政策</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">服务条款</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie政策</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

// Force static generation for better performance
export const dynamic = 'force-static'
