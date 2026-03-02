import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    ShieldX,
    GraduationCap,
    Building2,
    Clock,
    User,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
    Search,
    AlertTriangle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import adminService from '../../services/admin.service';

export default function AdminVerificationsPage() {
    const [students, setStudents] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingOwners, setLoadingOwners] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // userId being acted upon
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [detailUser, setDetailUser] = useState(null);
    const [rejectConfirm, setRejectConfirm] = useState(null);

    // Fetch pending students
    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const data = await adminService.getPendingStudents();
            setStudents(data);
        } catch (err) {
            toast.error('Failed to load student verifications');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Fetch pending owners
    const fetchOwners = async () => {
        setLoadingOwners(true);
        try {
            const data = await adminService.getPendingOwners();
            setOwners(data);
        } catch (err) {
            toast.error('Failed to load owner verifications');
        } finally {
            setLoadingOwners(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchOwners();
    }, []);

    const handleApprove = async (userId, role) => {
        setActionLoading(userId);
        try {
            await adminService.approveUser(userId);
            toast.success('User verification approved!');
            if (role === 'student') {
                setStudents((prev) => prev.filter((s) => s.user_id !== userId));
            } else {
                setOwners((prev) => prev.filter((o) => o.user_id !== userId));
            }
            setDetailUser(null);
        } catch (err) {
            toast.error(err.message || 'Failed to approve verification');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId, role) => {
        setActionLoading(userId);
        try {
            await adminService.rejectUser(userId);
            toast.success('User verification rejected');
            if (role === 'student') {
                setStudents((prev) => prev.filter((s) => s.user_id !== userId));
            } else {
                setOwners((prev) => prev.filter((o) => o.user_id !== userId));
            }
            setDetailUser(null);
            setRejectConfirm(null);
        } catch (err) {
            toast.error(err.message || 'Failed to reject verification');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredStudents = students.filter((s) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q) ||
            s.university?.toLowerCase().includes(q)
        );
    });

    const filteredOwners = owners.filter((o) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            o.name?.toLowerCase().includes(q) ||
            o.email?.toLowerCase().includes(q) ||
            o.nid?.toLowerCase().includes(q) ||
            o.contact?.toLowerCase().includes(q)
        );
    });

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // --- Render a student card ---
    const renderStudentCard = (student) => (
        <Card
            key={student.user_id}
            id={`student-card-${student.user_id}`}
            className="bg-white"
        >
            <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* User info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center text-gray-700 font-semibold text-lg">
                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate text-base">{student.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {student.email}
                                </span>
                                {student.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {student.phone}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {student.student_id || 'N/A'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {student.university || 'Unknown University'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(student.created_at)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setDetailUser({ ...student, _role: 'student' })}
                        >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Details
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs"
                            disabled={actionLoading === student.user_id}
                            onClick={() => handleApprove(student.user_id, 'student')}
                        >
                            {actionLoading === student.user_id ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            disabled={actionLoading === student.user_id}
                            onClick={() => setRejectConfirm({ ...student, _role: 'student' })}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // --- Render an owner card ---
    const renderOwnerCard = (owner) => (
        <Card
            key={owner.user_id}
            id={`owner-card-${owner.user_id}`}
            className="bg-white"
        >
            <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* User info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center text-gray-700 font-semibold text-lg">
                            {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate text-base">{owner.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {owner.email}
                                </span>
                                {owner.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {owner.phone}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    NID: {owner.nid || 'N/A'}
                                </Badge>
                                {owner.contact && (
                                    <Badge variant="outline" className="text-xs">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {owner.contact}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(owner.created_at)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setDetailUser({ ...owner, _role: 'owner' })}
                        >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Details
                        </Button>
                        <Button
                            size="sm"
                            className="text-xs"
                            disabled={actionLoading === owner.user_id}
                            onClick={() => handleApprove(owner.user_id, 'owner')}
                        >
                            {actionLoading === owner.user_id ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            disabled={actionLoading === owner.user_id}
                            onClick={() => setRejectConfirm({ ...owner, _role: 'owner' })}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // --- Empty state ---
    const renderEmpty = (type) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShieldCheck className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pending {type} Verifications</h3>
            <p className="text-sm text-gray-500 max-w-sm">
                All {type.toLowerCase()} verification requests have been processed. New requests will appear here.
            </p>
        </div>
    );

    // --- Loading skeleton ---
    const renderLoading = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="flex gap-2">
                                    <div className="h-5 bg-gray-200 rounded w-20" />
                                    <div className="h-5 bg-gray-200 rounded w-32" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-gray-200 rounded w-20" />
                                <div className="h-8 bg-gray-200 rounded w-20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6" />
                            Verification Requests
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Review and manage user verification requests
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => { fetchStudents(); fetchOwners(); }}
                        className="self-start sm:self-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Student Requests</p>
                                <p className="text-2xl font-semibold mt-1">{students.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-gray-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Owner Requests</p>
                                <p className="text-2xl font-semibold mt-1">{owners.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="verification-search"
                        placeholder="Search by name, email, student ID, university, or NID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="students" className="w-full">
                    <TabsList className="w-full sm:w-auto mb-6 h-auto bg-transparent p-0 gap-6">
                        <TabsTrigger value="students" className="flex-1 sm:flex-none gap-2 rounded-md border bg-white px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary">
                            <GraduationCap className="h-4 w-4" />
                            Students
                            {students.length > 0 && (
                                <span className="ml-1 rounded-full border px-1.5 py-0.5 text-[11px] leading-none">
                                    {students.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="owners" className="flex-1 sm:flex-none gap-2 rounded-md border bg-white px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary">
                            <Building2 className="h-4 w-4" />
                            Owners
                            {owners.length > 0 && (
                                <span className="ml-1 rounded-full border px-1.5 py-0.5 text-[11px] leading-none">
                                    {owners.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Students Tab */}
                    <TabsContent value="students">
                        {loadingStudents ? (
                            renderLoading()
                        ) : filteredStudents.length === 0 ? (
                            searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Search className="h-10 w-10 text-gray-400 mb-3" />
                                    <p className="text-gray-500">No students matching "{searchQuery}"</p>
                                </div>
                            ) : (
                                renderEmpty('Student')
                            )
                        ) : (
                            <div className="space-y-4">
                                {filteredStudents.map(renderStudentCard)}
                            </div>
                        )}
                    </TabsContent>

                    {/* Owners Tab */}
                    <TabsContent value="owners">
                        {loadingOwners ? (
                            renderLoading()
                        ) : filteredOwners.length === 0 ? (
                            searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Search className="h-10 w-10 text-gray-400 mb-3" />
                                    <p className="text-gray-500">No owners matching "{searchQuery}"</p>
                                </div>
                            ) : (
                                renderEmpty('Owner')
                            )
                        ) : (
                            <div className="space-y-4">
                                {filteredOwners.map(renderOwnerCard)}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Verification Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the verification documents and info submitted by this user.
                        </DialogDescription>
                    </DialogHeader>

                    {detailUser && (
                        <div className="space-y-4 py-2">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                                    <p className="font-medium text-gray-900">{detailUser.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="font-medium text-gray-900">{detailUser.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                    <p className="font-medium text-gray-900">{detailUser.phone || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                                    <Badge className="capitalize">{detailUser.role}</Badge>
                                </div>
                            </div>

                            <hr />

                            {/* Role-specific info */}
                            {detailUser._role === 'student' ? (
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-blue-600" />
                                        Student Verification Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student ID</p>
                                            <p className="font-medium text-gray-900">{detailUser.student_id || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">University</p>
                                            <p className="font-medium text-gray-900">{detailUser.university || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {detailUser.student_proof && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student ID Card</p>
                                            <a
                                                href={detailUser.student_proof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Document
                                            </a>
                                            {/* Show preview if image */}
                                            {/\.(jpg|jpeg|png|gif|webp)/i.test(detailUser.student_proof) && (
                                                <img
                                                    src={detailUser.student_proof}
                                                    alt="Student ID"
                                                    className="mt-2 max-h-48 rounded-lg border object-contain w-full bg-gray-50"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Owner Verification Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">NID/Passport</p>
                                            <p className="font-medium text-gray-900">{detailUser.nid || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
                                            <p className="font-medium text-gray-900">{detailUser.contact || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {detailUser.ownership_proof && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verification Document</p>
                                            <a
                                                href={detailUser.ownership_proof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Document
                                            </a>
                                            {/\.(jpg|jpeg|png|gif|webp)/i.test(detailUser.ownership_proof) && (
                                                <img
                                                    src={detailUser.ownership_proof}
                                                    alt="Verification Document"
                                                    className="mt-2 max-h-48 rounded-lg border object-contain w-full bg-gray-50"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDetailUser(null)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={actionLoading === detailUser?.user_id}
                            onClick={() => {
                                setRejectConfirm(detailUser);
                            }}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            disabled={actionLoading === detailUser?.user_id}
                            onClick={() => handleApprove(detailUser.user_id, detailUser._role)}
                        >
                            {actionLoading === detailUser?.user_id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation */}
            <AlertDialog open={!!rejectConfirm} onOpenChange={(open) => !open && setRejectConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Reject Verification?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject the verification request from{' '}
                            <span className="font-semibold text-gray-700">{rejectConfirm?.name}</span>?
                            Their status will be reset to unverified and they will need to re-submit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 sm:gap-3">
                        <AlertDialogCancel disabled={!!actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={actionLoading === rejectConfirm?.user_id}
                            onClick={() => handleReject(rejectConfirm.user_id, rejectConfirm._role)}
                        >
                            {actionLoading === rejectConfirm?.user_id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <ShieldX className="h-4 w-4 mr-1" />
                            )}
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
