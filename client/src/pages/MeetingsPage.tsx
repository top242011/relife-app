import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MeetingsPage() {
  const { data: meetings = [], refetch } = trpc.meetings.list.useQuery();
  const createMeeting = trpc.meetings.create.useMutation();
  const updateMeeting = trpc.meetings.update.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [formData, setFormData] = useState({
    meetingTypeId: 1,
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    isOpenData: false,
  });

  const handleOpenDialog = (meeting?: any) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setFormData({
        meetingTypeId: meeting.meetingTypeId,
        title: meeting.title,
        date: meeting.date instanceof Date ? meeting.date.toISOString().split('T')[0] : meeting.date,
        time: meeting.time || "",
        location: meeting.location || "",
        description: meeting.description || "",
        isOpenData: meeting.isOpenData || false,
      });
    } else {
      setEditingMeeting(null);
      setFormData({
        meetingTypeId: 1,
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        isOpenData: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert date string to ISO format
      const dateObj = new Date(formData.date);
      const isoDate = dateObj.toISOString().split('T')[0];
      
      const submitData = {
        meetingTypeId: formData.meetingTypeId,
        title: formData.title,
        date: isoDate,
        time: (formData.time && formData.time !== 'ไม่ระบุ') ? formData.time : undefined,
        location: (formData.location && formData.location !== 'ไม่ระบุ') ? formData.location : undefined,
        description: (formData.description && formData.description !== 'ไม่ระบุ') ? formData.description : undefined,
        isOpenData: formData.isOpenData,
      };
      if (editingMeeting) {
        await updateMeeting.mutateAsync({
          id: editingMeeting.id,
          ...submitData,
        });
      } else {
        await createMeeting.mutateAsync(submitData);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">จัดการการประชุม</h1>
          <p className="text-slate-600 mt-2">จำนวนการประชุมทั้งหมด: {meetings.length}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          เพิ่มการประชุม
        </Button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting: any) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{meeting.title}</CardTitle>
                  <CardDescription>
                    {meeting.meetingTypes?.name || "ประเภทไม่ระบุ"}
                  </CardDescription>
                </div>
                {meeting.isOpenData && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    เปิดเผย
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600">วันที่</p>
                  <p className="font-medium">
                    {meeting.date instanceof Date ? meeting.date.toLocaleDateString('th-TH') : new Date(meeting.date).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">เวลา</p>
                  <p className="font-medium">{meeting.time || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">สถานที่</p>
                  <p className="font-medium">{meeting.location || "-"}</p>
                </div>
              </div>
              {meeting.description && (
                <p className="text-slate-600 text-sm mb-4">{meeting.description}</p>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(meeting)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-600">ยังไม่มีการประชุม</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? "แก้ไขการประชุม" : "เพิ่มการประชุมใหม่"}</DialogTitle>
            <DialogDescription>
              {editingMeeting ? "แก้ไขข้อมูลการประชุม" : "กรอกข้อมูลการประชุมใหม่"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                หัวข้อการประชุม *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="เช่น การประชุมพรรค ครั้งที่ 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  วันที่ *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  เวลา
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                สถานที่
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="เช่น ห้องประชุมชั้น 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                รายละเอียด
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการประชุม"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOpenData"
                checked={formData.isOpenData}
                onChange={(e) => setFormData({ ...formData, isOpenData: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isOpenData" className="text-sm font-medium text-slate-900">
                เปิดเผยข้อมูลการประชุมนี้เป็น Open Data
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingMeeting ? "บันทึกการแก้ไข" : "เพิ่มการประชุม"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

