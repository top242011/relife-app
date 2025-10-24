import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RegistrationApprovals() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const utils = trpc.useUtils();
  const { data: registrations, isLoading } =
    trpc.auth.getAllRegistrations.useQuery();

  const approveMutation = trpc.auth.approveRegistration.useMutation({
    onSuccess: () => {
      toast.success('อนุมัติคำขอสำเร็จ');
      utils.auth.getAllRegistrations.invalidate();
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.auth.rejectRegistration.useMutation({
    onSuccess: () => {
      toast.success('ปฏิเสธคำขอสำเร็จ');
      utils.auth.getAllRegistrations.invalidate();
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message,
      });
    },
  });

  const handleApprove = (requestId: string) => {
    setSelectedRequest(requestId);
    setApproveDialogOpen(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequest(requestId);
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({ requestId: selectedRequest });
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({
        requestId: selectedRequest,
        reason: rejectionReason || undefined,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            รอดำเนินการ
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            อนุมัติ
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            ปฏิเสธ
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการคำขอลงทะเบียน</h1>
        <p className="text-slate-600 mt-2">
          อนุมัติหรือปฏิเสธคำขอลงทะเบียนจากผู้ใช้ใหม่
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>รอดำเนินการ</CardDescription>
            <CardTitle className="text-3xl">
              {registrations?.filter((r) => r.status === 'pending').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>อนุมัติแล้ว</CardDescription>
            <CardTitle className="text-3xl">
              {registrations?.filter((r) => r.status === 'approved').length ||
                0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>ปฏิเสธ</CardDescription>
            <CardTitle className="text-3xl">
              {registrations?.filter((r) => r.status === 'rejected').length ||
                0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>คำขอลงทะเบียนทั้งหมด</CardTitle>
          <CardDescription>
            รายการคำขอลงทะเบียนเรียงตามวันที่ส่งคำขอล่าสุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ศูนย์การศึกษา</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations && registrations.length > 0 ? (
                  registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.name}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>
                        {registration.student_id || '-'}
                      </TableCell>
                      <TableCell>
                        {registration.education_center || '-'}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(registration.created_at),
                          'dd MMM yyyy HH:mm',
                          { locale: th }
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell className="text-right">
                        {registration.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(registration.id)}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(registration.id)}
                            >
                              ปฏิเสธ
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">
                            ดำเนินการแล้ว
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-slate-500">ไม่มีคำขอลงทะเบียน</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการอนุมัติ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการอนุมัติคำขอลงทะเบียนนี้ใช่หรือไม่?
              ผู้ใช้จะสามารถเข้าสู่ระบบได้ทันที
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ปฏิเสธคำขอลงทะเบียน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?
              คุณสามารถระบุเหตุผลในการปฏิเสธได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">เหตุผล (ไม่บังคับ)</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="ระบุเหตุผลในการปฏิเสธ"
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
