import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MembersPage() {
  const { data: members = [], refetch } = trpc.members.list.useQuery();
  const createMember = trpc.members.create.useMutation();
  const updateMember = trpc.members.update.useMutation();
  const deleteMember = trpc.members.delete.useMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof members[0] | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    educationCenter: "",
  });

  const filteredMembers = members.filter(
    (m) =>
      m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (member?: typeof members[0]) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        studentId: member.studentId || "",
        email: member.email || "",
        phone: member.phone || "",
        educationCenter: member.educationCenter || "",
      });
    } else {
      setEditingMember(null);
      setFormData({
        firstName: "",
        lastName: "",
        studentId: "",
        email: "",
        phone: "",
        educationCenter: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId || undefined,
        email: formData.email ? formData.email.trim() : undefined,
        phone: formData.phone || undefined,
        educationCenter: formData.educationCenter || undefined,
      };

      if (editingMember) {
        await updateMember.mutateAsync({
          id: editingMember.id,
          ...dataToSend,
        });
      } else {
        await createMember.mutateAsync(dataToSend);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบสมาชิกนี้?")) {
      try {
        await deleteMember.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">จัดการสมาชิก</h1>
          <p className="text-slate-600 mt-2">จำนวนสมาชิกทั้งหมด: {members.length}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          เพิ่มสมาชิก
        </Button>
      </div>

      {/* Search */}
      <Card>
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

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อสมาชิก</CardTitle>
          <CardDescription>แสดง {filteredMembers.length} จาก {members.length} สมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">ชื่อ</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">รหัสนักศึกษา</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">อีเมล</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">ศูนย์การศึกษา</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{member.studentId || "-"}</td>
                      <td className="py-3 px-4 text-slate-600">{member.email || "-"}</td>
                      <td className="py-3 px-4 text-slate-600">{member.educationCenter || "-"}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(member)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">ไม่มีสมาชิก</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? "แก้ไขสมาชิก" : "เพิ่มสมาชิกใหม่"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "แก้ไขข้อมูลสมาชิก" : "กรอกข้อมูลสมาชิกใหม่"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  ชื่อ *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  นามสกุล *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                รหัสนักศึกษา
              </label>
              <Input
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                อีเมล
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                เบอร์โทรศัพท์
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                ศูนย์การศึกษา
              </label>
              <Input
                value={formData.educationCenter}
                onChange={(e) => setFormData({ ...formData, educationCenter: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingMember ? "บันทึกการแก้ไข" : "เพิ่มสมาชิก"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

