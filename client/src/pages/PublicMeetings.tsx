import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, Calendar } from "lucide-react";

export default function PublicMeetings() {
  const { data: meetings = [] } = trpc.meetings.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter only open data meetings
  const openDataMeetings = meetings.filter((m: any) => m.isOpenData);
  const filteredMeetings = openDataMeetings.filter(
    (m: any) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by date descending
  const sortedMeetings = [...filteredMeetings].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
            <a href="/public/members" className="text-slate-600 hover:text-slate-900">ทีมบริหาร</a>
            <a href="/public/meetings" className="text-blue-600 font-medium">รายงานการประชุม</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">รายงานการประชุม</h1>
          <p className="text-slate-600">รายงานการประชุมสภา กรรมาธิการ และอนุกรรมาธิการ</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <Input
                placeholder="ค้นหารายงานการประชุม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meetings List */}
        {sortedMeetings.length > 0 ? (
          <div className="space-y-4">
            {sortedMeetings.map((meeting: any) => (
              <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{meeting.title}</CardTitle>
                      <CardDescription>
                        {meeting.meetingTypes?.name || "ประเภทไม่ระบุ"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Calendar size={16} />
                        วันที่
                      </p>
                      <p className="font-medium">
                        {meeting.date instanceof Date
                          ? meeting.date.toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date(meeting.date).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                      </p>
                    </div>
                    {meeting.time && (
                      <div>
                        <p className="text-sm text-slate-600">เวลา</p>
                        <p className="font-medium">{meeting.time}</p>
                      </div>
                    )}
                    {meeting.location && (
                      <div>
                        <p className="text-sm text-slate-600">สถานที่</p>
                        <p className="font-medium">{meeting.location}</p>
                      </div>
                    )}
                  </div>
                  {meeting.description && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {meeting.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600">ไม่พบรายงานการประชุม</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-slate-600">
          <p>แสดง {sortedMeetings.length} จาก {openDataMeetings.length} รายงาน</p>
        </div>
      </div>
    </div>
  );
}

