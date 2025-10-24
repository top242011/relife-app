import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Briefcase, Building2, Calendar, FileText, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { data: members = [] } = trpc.members.list.useQuery();
  const { data: positions = [] } = trpc.positions.list.useQuery();
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const { data: meetings = [] } = trpc.meetings.list.useQuery();
  const { data: regulations = [] } = trpc.draftRegulations.list.useQuery();

  // คำนวณสถิติ
  const stats = useMemo(() => {
    const openDataMembers = members.filter((m: any) => m.isOpenData).length;
    const openDataMeetings = meetings.filter((m: any) => m.isOpenData).length;
    const passedRegulations = regulations.filter((r: any) => r.status === 'passed').length;

    return [
      {
        title: "สมาชิกทั้งหมด",
        value: members.length,
        icon: Users,
        color: "bg-blue-100 text-blue-600",
        subtext: `${openDataMembers} เปิดเผย`,
      },
      {
        title: "ตำแหน่ง",
        value: positions.length,
        icon: Briefcase,
        color: "bg-purple-100 text-purple-600",
        subtext: "ประเภทตำแหน่ง",
      },
      {
        title: "ฝ่าย",
        value: departments.length,
        icon: Building2,
        color: "bg-green-100 text-green-600",
        subtext: "หน่วยงาน",
      },
      {
        title: "การประชุม",
        value: meetings.length,
        icon: Calendar,
        color: "bg-orange-100 text-orange-600",
        subtext: `${openDataMeetings} เปิดเผย`,
      },
      {
        title: "ร่างระเบียบ",
        value: regulations.length,
        icon: FileText,
        color: "bg-pink-100 text-pink-600",
        subtext: `${passedRegulations} ผ่านมติ`,
      },
    ];
  }, [members, positions, departments, meetings, regulations]);

  // สถิติร่างระเบียบตามสถานะ
  const regulationStats = useMemo(() => {
    return {
      proposed: regulations.filter((r: any) => r.status === 'proposed').length,
      considering: regulations.filter((r: any) => r.status === 'considering').length,
      passed: regulations.filter((r: any) => r.status === 'passed').length,
      failed: regulations.filter((r: any) => r.status === 'failed').length,
    };
  }, [regulations]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ด</h1>
        <p className="text-slate-600 mt-2">ยินดีต้อนรับสู่ระบบจัดการพรรคนักศึกษา Relife Connect</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-600 mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regulation Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะร่างระเบียบ</CardTitle>
            <CardDescription>การกระจายตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "เสนอ", value: regulationStats.proposed, color: "bg-blue-500" },
                { label: "พิจารณา", value: regulationStats.considering, color: "bg-yellow-500" },
                { label: "ผ่านมติ", value: regulationStats.passed, color: "bg-green-500" },
                { label: "ไม่ผ่าน", value: regulationStats.failed, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเปิดเผย</CardTitle>
            <CardDescription>สรุปข้อมูล Open Data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-slate-600">สมาชิกเปิดเผย</span>
                <span className="font-semibold text-slate-900">
                  {members.filter(m => m.isOpenData).length}/{members.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-slate-600">การประชุมเปิดเผย</span>
                <span className="font-semibold text-slate-900">
                  {meetings.filter((m: any) => m.isOpenData).length}/{meetings.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-slate-600">ร่างระเบียบผ่านมติ</span>
                <span className="font-semibold text-slate-900">
                  {regulationStats.passed}/{regulations.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลสำคัญ</CardTitle>
            <CardDescription>สรุปข้อมูลระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">ฝ่ายที่มีสมาชิกมากที่สุด</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {departments.length > 0 ? departments[0].name : "-"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">ตำแหน่งทั้งหมด</p>
                <p className="font-semibold text-slate-900 mt-1">{positions.length} ตำแหน่ง</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">อัตราการเข้าร่วมประชุม</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {meetings.length > 0 ? "ดูรายละเอียด" : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader>
          <CardTitle>สมาชิกล่าสุด</CardTitle>
          <CardDescription>รายชื่อสมาชิกที่เพิ่มเข้าระบบเมื่อเร็วๆ นี้</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-4">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{member.email || "ไม่มีอีเมล"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {member.educationCenter || "ไม่ระบุ"}
                    </span>
                    {member.isOpenData && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        เปิดเผย
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">ยังไม่มีสมาชิก</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

