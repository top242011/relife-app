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

export default function DepartmentsPage() {
  const { data: departments = [], refetch } = trpc.departments.list.useQuery();
  const createDepartment = trpc.departments.create.useMutation();
  const updateDepartment = trpc.departments.update.useMutation();
  const deleteDepartment = trpc.departments.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<typeof departments[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleOpenDialog = (department?: typeof departments[0]) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          ...formData,
        });
      } else {
        await createDepartment.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบฝ่ายนี้?")) {
      try {
        await deleteDepartment.mutateAsync({ id });
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
          <h1 className="text-3xl font-bold text-slate-900">จัดการฝ่าย</h1>
          <p className="text-slate-600 mt-2">จำนวนฝ่ายทั้งหมด: {departments.length}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          เพิ่มฝ่าย
        </Button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <CardDescription>{department.description || "ไม่มีรายละเอียด"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(department)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(department.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-600">ยังไม่มีฝ่าย</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? "แก้ไขฝ่าย" : "เพิ่มฝ่ายใหม่"}</DialogTitle>
            <DialogDescription>
              {editingDepartment ? "แก้ไขข้อมูลฝ่าย" : "กรอกข้อมูลฝ่ายใหม่"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                ชื่อฝ่าย *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="เช่น ฝ่ายนโยบาย, ฝ่ายสาธารณสัมพันธ์"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                รายละเอียด
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดเกี่ยวกับฝ่ายนี้"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingDepartment ? "บันทึกการแก้ไข" : "เพิ่มฝ่าย"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

