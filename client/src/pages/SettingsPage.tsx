import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("positions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Positions
  const { data: positions = [], refetch: refetchPositions } = trpc.positions.list.useQuery();
  const createPosition = trpc.positions.create.useMutation();
  const updatePosition = trpc.positions.update.useMutation();
  const deletePosition = trpc.positions.delete.useMutation();

  // Departments
  const { data: departments = [], refetch: refetchDepartments } = trpc.departments.list.useQuery();
  const createDepartment = trpc.departments.create.useMutation();
  const updateDepartment = trpc.departments.update.useMutation();
  const deleteDepartment = trpc.departments.delete.useMutation();

  // Committees
  const { data: committees = [], refetch: refetchCommittees } = trpc.committees.list.useQuery();
  const createCommittee = trpc.committees.create.useMutation();
  const updateCommittee = trpc.committees.update.useMutation();
  const deleteCommittee = trpc.committees.delete.useMutation();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name, description: item.description || "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "positions") {
        if (editingId) {
          await updatePosition.mutateAsync({ id: editingId, ...formData });
        } else {
          await createPosition.mutateAsync(formData);
        }
        refetchPositions();
      } else if (activeTab === "departments") {
        if (editingId) {
          await updateDepartment.mutateAsync({ id: editingId, ...formData });
        } else {
          await createDepartment.mutateAsync(formData);
        }
        refetchDepartments();
      } else if (activeTab === "committees") {
        if (editingId) {
          await updateCommittee.mutateAsync({ id: editingId, ...formData });
        } else {
          await createCommittee.mutateAsync(formData);
        }
        refetchCommittees();
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบ?")) {
      try {
        if (activeTab === "positions") {
          await deletePosition.mutateAsync({ id });
          refetchPositions();
        } else if (activeTab === "departments") {
          await deleteDepartment.mutateAsync({ id });
          refetchDepartments();
        } else if (activeTab === "committees") {
          await deleteCommittee.mutateAsync({ id });
          refetchCommittees();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const renderTable = (items: any[], title: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มใหม่
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ชื่อ</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">คำอธิบาย</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.description || "-"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">ตั้งค่า</h1>
        <p className="text-slate-600 mt-2">จัดการตำแหน่ง ฝ่าย และกรรมาธิการ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การจัดการ</CardTitle>
          <CardDescription>
            จัดการข้อมูลตำแหน่ง ฝ่าย และกรรมาธิการในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="positions">ตำแหน่ง</TabsTrigger>
              <TabsTrigger value="departments">ฝ่าย</TabsTrigger>
              <TabsTrigger value="committees">กรรมาธิการ</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-6">
              {renderTable(positions, "ตำแหน่งในพรรค")}
            </TabsContent>

            <TabsContent value="departments" className="mt-6">
              {renderTable(departments, "ฝ่ายต่างๆ")}
            </TabsContent>

            <TabsContent value="committees" className="mt-6">
              {renderTable(committees, "กรรมาธิการ")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "แก้ไข" : "เพิ่มใหม่"}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "positions" && "ตำแหน่งในพรรค"}
              {activeTab === "departments" && "ฝ่ายต่างๆ"}
              {activeTab === "committees" && "กรรมาธิการ"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อ *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="กรอกชื่อ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                คำอธิบาย
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="กรอกคำอธิบาย (ไม่บังคับ)"
                rows={3}
              />
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
                {editingId ? "บันทึก" : "เพิ่ม"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

