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

export default function PositionsPage() {
  const { data: positions = [], refetch } = trpc.positions.list.useQuery();
  const createPosition = trpc.positions.create.useMutation();
  const updatePosition = trpc.positions.update.useMutation();
  const deletePosition = trpc.positions.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<typeof positions[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleOpenDialog = (position?: typeof positions[0]) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        name: position.name,
        description: position.description || "",
      });
    } else {
      setEditingPosition(null);
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
      if (editingPosition) {
        await updatePosition.mutateAsync({
          id: editingPosition.id,
          ...formData,
        });
      } else {
        await createPosition.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบตำแหน่งนี้?")) {
      try {
        await deletePosition.mutateAsync({ id });
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
          <h1 className="text-3xl font-bold text-slate-900">จัดการตำแหน่ง</h1>
          <p className="text-slate-600 mt-2">จำนวนตำแหน่งทั้งหมด: {positions.length}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          เพิ่มตำแหน่ง
        </Button>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((position) => (
          <Card key={position.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{position.name}</CardTitle>
              <CardDescription>{position.description || "ไม่มีรายละเอียด"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(position)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(position.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {positions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-600">ยังไม่มีตำแหน่ง</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPosition ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่งใหม่"}</DialogTitle>
            <DialogDescription>
              {editingPosition ? "แก้ไขข้อมูลตำแหน่ง" : "กรอกข้อมูลตำแหน่งใหม่"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                ชื่อตำแหน่ง *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="เช่น ประธานพรรค, กรรมการบริหาร"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                รายละเอียด
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดเกี่ยวกับตำแหน่งนี้"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingPosition ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่ง"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

