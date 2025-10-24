import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, X } from "lucide-react";

interface DragItem {
  type: "role" | "position" | "department" | "committee";
  id: number;
  name: string;
}

interface MemberWithRoles {
  id: number;
  firstName: string;
  lastName: string;
  roles: string[];
  positions: string[];
  departments: string[];
  committees: string[];
}

export default function MemberRolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [members, setMembers] = useState<MemberWithRoles[]>([]);

  // Fetch data
  const { data: allMembers = [] } = trpc.members.list.useQuery();
  const { data: positions = [] } = trpc.positions.list.useQuery();
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const { data: committees = [] } = trpc.committees.list.useQuery();

  // Mutations
  const addMemberRole = trpc.memberRoles.create.useMutation();
  const addMemberPosition = trpc.memberPositions.add.useMutation();
  const addMemberDepartment = trpc.memberDepartments.add.useMutation();
  const addMemberCommittee = trpc.memberCommittees.create.useMutation();

  // Initialize members with roles
  useEffect(() => {
    const membersWithRoles = allMembers.map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      roles: [],
      positions: [],
      departments: [],
      committees: [],
    }));
    setMembers(membersWithRoles);
  }, [allMembers]);

  const filteredMembers = members.filter((member) =>
    `${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (
    e: React.DragEvent,
    memberId: number,
    type: "role" | "position" | "department" | "committee"
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    try {
      if (type === "role") {
        await addMemberRole.mutateAsync({
          memberId,
          role: draggedItem.name as any,
          isCurrent: true,
        });
      } else if (type === "position") {
        await addMemberPosition.mutateAsync({
          memberId,
          positionId: draggedItem.id,
          isCurrent: true,
        });
      } else if (type === "department") {
        await addMemberDepartment.mutateAsync({
          memberId,
          departmentId: draggedItem.id,
          isCurrent: true,
        });
      } else if (type === "committee") {
        await addMemberCommittee.mutateAsync({
          memberId,
          committeeId: draggedItem.id,
          isCurrent: true,
        });
      }

      // Update local state
      setMembers((prev) =>
        prev.map((member) => {
          if (member.id === memberId) {
            if (type === "role") {
              return { ...member, roles: [...member.roles, draggedItem.name] };
            } else if (type === "position") {
              return { ...member, positions: [...member.positions, draggedItem.name] };
            } else if (type === "department") {
              return { ...member, departments: [...member.departments, draggedItem.name] };
            } else if (type === "committee") {
              return { ...member, committees: [...member.committees, draggedItem.name] };
            }
          }
          return member;
        })
      );
    } catch (error) {
      console.error("Error:", error);
    }

    setDraggedItem(null);
  };

  const handleRemoveItem = (memberId: number, type: string, itemName: string) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId) {
          if (type === "role") {
            return { ...member, roles: member.roles.filter((r) => r !== itemName) };
          } else if (type === "position") {
            return { ...member, positions: member.positions.filter((p) => p !== itemName) };
          } else if (type === "department") {
            return { ...member, departments: member.departments.filter((d) => d !== itemName) };
          } else if (type === "committee") {
            return { ...member, committees: member.committees.filter((c) => c !== itemName) };
          }
        }
        return member;
      })
    );
  };

  const roleOptions = [
    { id: 1, name: "council_member", label: "สมาชิกสภา" },
    { id: 2, name: "committee_member", label: "กรรมการ" },
    { id: 3, name: "regular_member", label: "สมาชิกทั่วไป" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">จัดการบทบาทสมาชิก</h1>
        <p className="text-slate-600 mt-2">
          ลากตำแหน่ง ฝ่าย กรรมาธิการ และบทบาท มาวางไว้ท้ายชื่อสมาชิก
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Available Items */}
        <div className="space-y-4">
          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">บทบาท</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roleOptions.map((role) => (
                <div
                  key={role.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { type: "role", id: role.id, name: role.name })
                  }
                  className="p-2 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 text-sm"
                >
                  {role.label}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ตำแหน่ง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {positions.map((position) => (
                <div
                  key={position.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { type: "position", id: position.id, name: position.name })
                  }
                  className="p-2 bg-green-50 border border-green-200 rounded cursor-move hover:bg-green-100 text-sm"
                >
                  {position.name}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ฝ่าย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { type: "department", id: department.id, name: department.name })
                  }
                  className="p-2 bg-yellow-50 border border-yellow-200 rounded cursor-move hover:bg-yellow-100 text-sm"
                >
                  {department.name}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Committees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">กรรมาธิการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {committees.map((committee) => (
                <div
                  key={committee.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { type: "committee", id: committee.id, name: committee.name })
                  }
                  className="p-2 bg-purple-50 border border-purple-200 rounded cursor-move hover:bg-purple-100 text-sm"
                >
                  {committee.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Members */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>สมาชิก</CardTitle>
              <CardDescription>ลากรายการมาวางไว้ที่สมาชิก</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="ค้นหาสมาชิก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      // Determine drop type based on dragged item
                      if (draggedItem?.type === "role") {
                        handleDrop(e, member.id, "role");
                      } else if (draggedItem?.type === "position") {
                        handleDrop(e, member.id, "position");
                      } else if (draggedItem?.type === "department") {
                        handleDrop(e, member.id, "department");
                      } else if (draggedItem?.type === "committee") {
                        handleDrop(e, member.id, "committee");
                      }
                    }}
                    className="p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <h4 className="font-semibold text-slate-900 mb-3">
                      {member.firstName} {member.lastName}
                    </h4>

                    {/* Roles */}
                    {member.roles.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">บทบาท:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.roles.map((role) => (
                            <div
                              key={role}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                              {roleOptions.find((r) => r.name === role)?.label || role}
                              <button
                                onClick={() => handleRemoveItem(member.id, "role", role)}
                                className="ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Positions */}
                    {member.positions.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">ตำแหน่ง:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.positions.map((position) => (
                            <div
                              key={position}
                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                            >
                              {position}
                              <button
                                onClick={() => handleRemoveItem(member.id, "position", position)}
                                className="ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Departments */}
                    {member.departments.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">ฝ่าย:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.departments.map((department) => (
                            <div
                              key={department}
                              className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                            >
                              {department}
                              <button
                                onClick={() => handleRemoveItem(member.id, "department", department)}
                                className="ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Committees */}
                    {member.committees.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">กรรมาธิการ:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.committees.map((committee) => (
                            <div
                              key={committee}
                              className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {committee}
                              <button
                                onClick={() => handleRemoveItem(member.id, "committee", committee)}
                                className="ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.roles.length === 0 &&
                      member.positions.length === 0 &&
                      member.departments.length === 0 &&
                      member.committees.length === 0 && (
                        <p className="text-sm text-slate-500 italic">ยังไม่มีบทบาท</p>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

