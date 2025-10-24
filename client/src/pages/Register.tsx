import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    studentId: '',
    educationCenter: '',
    phone: '',
    reason: '',
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success('ส่งคำขอลงทะเบียนเรียบร้อยแล้ว', {
        description: 'รอการอนุมัติจากผู้ดูแลระบบ',
      });
      setLocation('/login');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      studentId: formData.studentId || undefined,
      educationCenter: formData.educationCenter || undefined,
      phone: formData.phone || undefined,
      reason: formData.reason || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">ลงทะเบียน</CardTitle>
          <CardDescription>
            กรอกข้อมูลเพื่อสมัครเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ระบุชื่อ-นามสกุล"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  อีเมล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="ยืนยันรหัสผ่าน"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentId">รหัสนักศึกษา</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  placeholder="ระบุรหัสนักศึกษา (ถ้ามี)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationCenter">ศูนย์การศึกษา</Label>
                <Input
                  id="educationCenter"
                  value={formData.educationCenter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      educationCenter: e.target.value,
                    })
                  }
                  placeholder="เช่น ธรรมศาสตร์ ท่าพระจันทร์"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0812345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">เหตุผลที่สมัคร</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="แบ่งปันเหตุผลที่คุณต้องการเข้าร่วม"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'กำลังส่งคำขอ...' : 'ลงทะเบียน'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setLocation('/login')}
              >
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
