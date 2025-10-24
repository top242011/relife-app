import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, Users } from "lucide-react";

export default function PublicMembers() {
  const { data: members = [] } = trpc.members.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter only open data members
  const openDataMembers = members.filter((m: any) => m.isOpenData);
  const filteredMembers = openDataMembers.filter(
    (m: any) =>
      m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-900">Relife Connect</span>
          </div>
          <div className="flex gap-4">
            <a href="/" className="text-slate-600 hover:text-slate-900">หน้าแรก</a>
            <a href="/public/members" className="text-blue-600 font-medium">ทีมบริหาร</a>
            <a href="/public/meetings" className="text-slate-600 hover:text-slate-900">รายงานการประชุม</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">ทีมบริหารพรรค</h1>
          <p className="text-slate-600">รายชื่อสมาชิกคณะกรรมการบริหารพรรคนักศึกษา</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <Input
                placeholder="ค้นหาสมาชิก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member: any) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {member.firstName} {member.lastName}
                  </CardTitle>
                  <CardDescription>{member.educationCenter || "ไม่ระบุ"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {member.email && (
                      <div>
                        <p className="text-xs text-slate-600">อีเมล</p>
                        <p className="text-sm text-slate-900">{member.email}</p>
                      </div>
                    )}
                    {member.phone && (
                      <div>
                        <p className="text-xs text-slate-600">เบอร์โทรศัพท์</p>
                        <p className="text-sm text-slate-900">{member.phone}</p>
                      </div>
                    )}
                    {member.studentId && (
                      <div>
                        <p className="text-xs text-slate-600">รหัสนักศึกษา</p>
                        <p className="text-sm text-slate-900">{member.studentId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600">ไม่พบสมาชิก</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-slate-600">
          <p>แสดง {filteredMembers.length} จาก {openDataMembers.length} สมาชิก</p>
        </div>
      </div>
    </div>
  );
}

