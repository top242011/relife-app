import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Heart, Users, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated && user) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-10 h-10 rounded-lg" />}
            <span className="text-xl font-bold text-slate-900">{APP_TITLE}</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Relife Connect
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            ระบบจัดการพรรคนักศึกษาที่ทันสมัย เพื่อการบริหารงานที่มีประสิทธิภาพและโปร่งใส
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              className="gap-2"
            >
              เข้าสู่ระบบ <ArrowRight size={20} />
            </Button>
            <Button size="lg" variant="outline">
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation Links */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/public/members" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">ทีมบริหารพรรค</h3>
              <p className="text-slate-600">ดูรายชื่อและข้อมูลสมาชิกคณะกรรมการบริหาร</p>
            </a>
            <a href="/public/meetings" className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">รายงานการประชุม</h3>
              <p className="text-slate-600">อ่านรายงานการประชุมสภาและกรรมาธิการ</p>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            คุณสมบัติหลัก
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">จัดการสมาชิก</h3>
              <p className="text-slate-600">
                บริหารข้อมูลสมาชิก ตำแหน่ง และฝ่ายต่างๆ ได้อย่างมีประสิทธิภาพ
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Zap className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">ระบบการประชุม</h3>
              <p className="text-slate-600">
                บันทึกการประชุม ระเบียบวาระ และผลการโหวตอย่างเป็นระบบ
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">โปร่งใสและเปิดเผย</h3>
              <p className="text-slate-600">
                เผยแพร่ข้อมูลสาธารณะและรายงานการประชุมให้สมาชิกทั้งหมด
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">เกี่ยวกับ Relife Connect</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-4">
            Relife Connect เป็นระบบจัดการพรรคนักศึกษาที่ออกแบบมาเพื่อให้การบริหารงานภายในพรรคเป็นไปอย่างมีประสิทธิภาพ โปร่งใส และเป็นระบบ
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            ระบบนี้รองรับการจัดการข้อมูลบุคลากร การบันทึกการประชุม ระบบการโหวต และการเผยแพร่ข้อมูลสาธารณะ เพื่อให้สมาชิกทั้งหมดสามารถติดตามการทำงานของพรรคได้อย่างชัดเจน
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 text-center">
        <p>&copy; 2024 Relife Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}

