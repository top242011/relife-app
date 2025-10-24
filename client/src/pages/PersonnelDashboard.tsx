import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Building2, Calendar, CheckCircle } from "lucide-react";

export default function PersonnelDashboard() {
  const { data: members = [] } = trpc.members.list.useQuery();
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const { data: meetings = [] } = trpc.meetings.list.useQuery();
  const { data: allVotes = [] } = trpc.votes.list.useQuery();
  const { data: meetingAttendances = [] } = trpc.meetingAttendances.list.useQuery();

  const [selectedDepartment] = useState<string>("all");
  const [selectedEducationCenter, setSelectedEducationCenter] = useState<string>("all");

  // Filter data
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (selectedEducationCenter !== "all" && member.educationCenter !== selectedEducationCenter) {
        return false;
      }
      return true;
    });
  }, [members, selectedEducationCenter, selectedDepartment]);

  // Extract votes from leftJoin result
  const votes = useMemo(() => {
    return allVotes
      .map((item: any) => item.votes)
      .filter(Boolean);
  }, [allVotes]);

  // Extract meetings from leftJoin result
  const meetingsData = useMemo(() => {
    return meetings.map((item: any) => {
      if (item.meetings) {
        return item.meetings;
      }
      return item;
    });
  }, [meetings]);

  // Vote statistics (moved outside stats useMemo)
  const voteStats = useMemo(() => {
    const votesByAgenda = new Map<number, { approve: number; disapprove: number; abstain: number; noVote: number }>();

    votes.forEach((vote: any) => {
      if (!votesByAgenda.has(vote.agendaId)) {
        votesByAgenda.set(vote.agendaId, { approve: 0, disapprove: 0, abstain: 0, noVote: 0 });
      }
      const stats = votesByAgenda.get(vote.agendaId)!;
      if (vote.voteChoice === "agree") stats.approve++;
      else if (vote.voteChoice === "disagree") stats.disapprove++;
      else if (vote.voteChoice === "abstain") stats.abstain++;
      else stats.noVote++;
    });

    return Array.from(votesByAgenda.entries()).map(([agendaId, stats]) => {
      const total = stats.approve + stats.disapprove + stats.abstain + stats.noVote;
      const unanimity = total > 0 ? ((stats.approve / total) * 100).toFixed(1) : "0";

      return {
        agendaTitle: `ระเบียบวาระ ${agendaId}`,
        approve: stats.approve,
        disapprove: stats.disapprove,
        abstain: stats.abstain,
        noVote: stats.noVote,
        unanimity: parseFloat(unanimity),
      };
    });
  }, [votes]);

  // Statistics
  const stats = useMemo(() => {
    const totalMembers = filteredMembers.length;
    const membersByDepartment = departments.map((dept) => ({
      name: dept.name,
      count: members.filter((m) => m.id).length,
    }));

    const educationCentersSet = new Set(members.map((m) => m.educationCenter).filter((c) => c));
    const membersByCenter = Array.from(educationCentersSet).map((center) => ({
      name: center || "ไม่ระบุ",
      count: filteredMembers.filter((m) => m.educationCenter === center).length,
    }));

    // Meeting attendance statistics
    const attendanceStats = meetingsData.map((meeting) => {
      const attendances = meetingAttendances.filter((a: any) => {
        const att = a.meetingAttendances || a;
        return att.meetingId === meeting.id;
      });
      const present = attendances.filter((a: any) => (a.meetingAttendances || a).status === "present").length;
      const absent = attendances.filter((a: any) => (a.meetingAttendances || a).status === "absent").length;
      const late = attendances.filter((a: any) => (a.meetingAttendances || a).status === "late").length;
      const excused = attendances.filter((a: any) => (a.meetingAttendances || a).status === "excused").length;

      return {
        meetingTitle: meeting.title || `การประชุม ${meeting.id}`,
        present,
        absent,
        late,
        excused,
      };
    });

    return {
      totalMembers,
      membersByDepartment,
      membersByCenter,
      attendanceStats,
      voteStats,
    };
  }, [filteredMembers, departments, members, meetingsData, meetingAttendances, voteStats]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ดสรุปข้อมูลบุคลากร</h1>
        <p className="text-slate-600 mt-2">สถิติและการวิเคราะห์ข้อมูลบุคลากรและการประชุม</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ตัวกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ฝ่าย</label>
            <Select value={selectedDepartment} disabled>
              <SelectTrigger disabled>
                <SelectValue placeholder="ไม่มีการกรองตามฝ่าย" />
              </SelectTrigger>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ศูนย์การศึกษา</label>
            <Select value={selectedEducationCenter} onValueChange={setSelectedEducationCenter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {Array.from(new Set(members.map((m) => m.educationCenter).filter((c) => c))).map((center) => (
                  <SelectItem key={center} value={center || ""}>
                    {center || "ไม่ระบุ"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">จำนวนสมาชิก</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">จำนวนฝ่าย</p>
                <p className="text-3xl font-bold text-slate-900">{departments.length}</p>
              </div>
              <Building2 className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">การประชุมทั้งหมด</p>
                <p className="text-3xl font-bold text-slate-900">{meetingsData.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">การโหวตทั้งหมด</p>
                <p className="text-3xl font-bold text-slate-900">{votes.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members by Department */}
        <Card>
          <CardHeader>
            <CardTitle>จำนวนสมาชิกแยกตามฝ่าย</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.membersByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Members by Education Center */}
        <Card>
          <CardHeader>
            <CardTitle>จำนวนสมาชิกแยกตามศูนย์การศึกษา</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.membersByCenter}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.membersByCenter.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vote Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>สถิติการโหวต</CardTitle>
            <CardDescription>เห็นชอบ / ไม่เห็นชอบ / งดออกเสียง / ไม่โหวต</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.voteStats.length > 0 ? (
              <div className="space-y-6">
                {stats.voteStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">{stat.agendaTitle}</p>
                      <p className="text-sm text-slate-600">เอกภาพ: {stat.unanimity}%</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[
                          { name: "เห็นชอบ", value: stat.approve },
                          { name: "ไม่เห็นชอบ", value: stat.disapprove },
                          { name: "งดออกเสียง", value: stat.abstain },
                          { name: "ไม่โหวต", value: stat.noVote },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6">
                          {[
                            { name: "เห็นชอบ", value: stat.approve },
                            { name: "ไม่เห็นชอบ", value: stat.disapprove },
                            { name: "งดออกเสียง", value: stat.abstain },
                            { name: "ไม่โหวต", value: stat.noVote },
                          ].map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={
                                entry.name === "เห็นชอบ"
                                  ? "#10b981"
                                  : entry.name === "ไม่เห็นชอบ"
                                  ? "#ef4444"
                                  : entry.name === "งดออกเสียง"
                                  ? "#f59e0b"
                                  : "#9ca3af"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-8">ไม่มีข้อมูลการโหวต</p>
            )}
          </CardContent>
        </Card>

        {/* Meeting Attendance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>สถิติการเข้าร่วมประชุม</CardTitle>
            <CardDescription>เข้าร่วม / ขาด / สาย / ลาป่วย</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.attendanceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.attendanceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="meetingTitle" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="เข้าร่วม" />
                  <Bar dataKey="late" stackId="a" fill="#f59e0b" name="สาย" />
                  <Bar dataKey="excused" stackId="a" fill="#3b82f6" name="ลาป่วย" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" name="ขาด" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-600 text-center py-8">ไม่มีข้อมูลการเข้าร่วมประชุม</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

