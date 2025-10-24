import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const proposedAtOptions = [
  { value: "internal", label: "ภายในพรรค" },
  { value: "central_council", label: "สภานักศึกษา (ส่วนกลาง)" },
  { value: "thaprajan_council", label: "สภานักศึกษาท่าพระจันทร์" },
  { value: "rangsit_council", label: "สภานักศึกษารังสิต" },
  { value: "lampang_council", label: "สภานักศึกษาลำปาง" },
  { value: "committee", label: "กรรมาธิการ" },
];

export default function RegulationsPage() {
  const { data: regulations = [], refetch } = trpc.draftRegulations.list.useQuery();
  const { data: members = [] } = trpc.members.list.useQuery();
  const { data: committees = [] } = trpc.committees.list.useQuery();
  const createRegulation = trpc.draftRegulations.create.useMutation();
  const updateRegulation = trpc.draftRegulations.update.useMutation();
  const deleteRegulation = trpc.draftRegulations.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    proposerMemberId: 0,
    content: "",
    proposedAt: "internal" as const,
    committeeId: 0,
    status: "proposed" as const,
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    proposed: { label: "เสนอ", color: "bg-blue-100 text-blue-700" },
    considering: { label: "พิจารณา", color: "bg-yellow-100 text-yellow-700" },
    passed: { label: "ผ่านมติ", color: "bg-green-100 text-green-700" },
    failed: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700" },
  };

  const handleOpenDialog = (regulation?: any) => {
    if (regulation) {
      setEditingRegulation(regulation);
      setFormData({
        title: regulation.title,
        proposerMemberId: regulation.proposerMemberId || 0,
        content: regulation.content,
        proposedAt: regulation.proposedAt || "internal",
        committeeId: regulation.committeeId || 0,
        status: regulation.status,
      });
    } else {
      setEditingRegulation(null);
      setFormData({
        title: "",
        proposerMemberId: members.length > 0 ? members[0].id : 0,
        content: "",
        proposedAt: "internal",
        committeeId: 0,
        status: "proposed",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRegulation) {
        await updateRegulation.mutateAsync({
          id: editingRegulation.id,
          ...formData,
        });
      } else {
        await createRegulation.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบร่างระเบียบนี้?")) {
      try {
        await deleteRegulation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const getProposerName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "ไม่ระบุ";
  };

  const getProposedAtLabel = (proposedAt: string) => {
    return proposedAtOptions.find(opt => opt.value === proposedAt)?.label || proposedAt;
  };

  const getCommitteeName = (committeeId: number) => {
    const committee = committees.find(c => c.id === committeeId);
    return committee ? committee.name : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">จัดการญัตติที่เสนอ</h1>
          <p className="text-slate-600 mt-2">จำนวนญัตติทั้งหมด: {regulations.length}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          เพิ่มญัตติ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ญัตติที่เสนอ</CardTitle>
          <CardDescription>
            จัดการญัตติและร่างระเบียบ/กฎหมายภายในพรรค
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ชื่อญัตติ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ผู้เสนอ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">สถานที่เสนอ</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">สถานะ</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {regulations.map((item: any) => {
                  const regulation = item.draftRegulations;
                  if (!regulation) return null;
                  <tr key={regulation.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{regulation?.title}</td>
                    <td className="px-4 py-3 text-slate-600">{getProposerName(regulation?.proposerMemberId)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {getProposedAtLabel(regulation?.proposedAt)}
                      {regulation?.committeeId && regulation?.proposedAt === "committee" && (
                        <div className="text-xs text-slate-500">({getCommitteeName(regulation?.committeeId)})</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[regulation?.status]?.color}`}>
                        {statusLabels[regulation?.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(regulation)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(regulation?.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegulation ? "แก้ไขญัตติ" : "เพิ่มญัตติใหม่"}
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลญัตติหรือร่างระเบียบ/กฎหมายภายในพรรค
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อญัตติ *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="กรอกชื่อญัตติ"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ผู้เสนอ *
                </label>
                <Select
                  value={formData.proposerMemberId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, proposerMemberId: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกผู้เสนอ" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  สถานที่เสนอ *
                </label>
                <Select
                  value={formData.proposedAt}
                  onValueChange={(value) =>
                    setFormData({ ...formData, proposedAt: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานที่เสนอ" />
                  </SelectTrigger>
                  <SelectContent>
                    {proposedAtOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.proposedAt as any) === "committee" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  กรรมาธิการ
                </label>
                <Select
                  value={formData.committeeId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, committeeId: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกกรรมาธิการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map((committee) => (
                      <SelectItem key={committee.id} value={committee.id.toString()}>
                        {committee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                เนื้อหา *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="กรอกเนื้อหาญัตติ"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                สถานะ
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposed">เสนอ</SelectItem>
                  <SelectItem value="considering">พิจารณา</SelectItem>
                  <SelectItem value="passed">ผ่านมติ</SelectItem>
                  <SelectItem value="failed">ไม่ผ่าน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingRegulation ? "บันทึก" : "เพิ่ม"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

