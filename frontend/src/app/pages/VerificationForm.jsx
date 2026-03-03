
import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import userService from '../services/user.service.jsx';
import { toast } from 'sonner';

export default function VerificationForm({ role, onSuccess, onCancel }) {
  const formRef = useRef();
  const studentProofInputRef = useRef(null);
  const ownerProofInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [studentProofFileName, setStudentProofFileName] = useState('');
  const [ownerProofFileName, setOwnerProofFileName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const formData = new FormData(form);
    setLoading(true);
    try {
      const res = await userService.submitVerification(formData);
      toast.success('Verification info submitted!');
      if (onSuccess) onSuccess(res.user);
    } catch (err) {
      toast.error(err.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off" action="#">
      {role === 'student' ? (
        <div className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" name="studentId" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="university">University Name</Label>
            <Input id="university" name="university" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="studentProof">Upload Student ID Card</Label>
            <input
              id="studentProof"
              name="studentProof"
              type="file"
              accept="image/*,application/pdf,.pdf"
              required
              ref={studentProofInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setStudentProofFileName(file ? `${file.name} (${file.type || 'file'})` : '');
              }}
            />
            <label
              htmlFor="studentProof"
              className="block border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm text-gray-600">Click to add student ID document</p>
              <p className="text-xs text-gray-500 mt-1">Image or PDF</p>
            </label>
            {studentProofFileName && (
              <div className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <span>Selected: {studentProofFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentProofFileName('');
                    if (studentProofInputRef.current) {
                      studentProofInputRef.current.value = '';
                    }
                  }}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-green-100"
                  aria-label="Remove selected student document"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">Upload a clear student ID document (image or PDF).</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerNid">NID/Passport Number</Label>
            <Input
              id="ownerNid"
              name="ownerNid"
              placeholder="e.g., NID: 1234567890 or Passport: A12345678"
              required
            />
            <p className="text-xs text-gray-500">Enter your NID or passport number.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ownershipProof">Add Verification Document</Label>
            <input
              id="ownershipProof"
              name="ownershipProof"
              type="file"
              accept="image/*,application/pdf,.pdf"
              required
              ref={ownerProofInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setOwnerProofFileName(file ? `${file.name} (${file.type || 'file'})` : '');
              }}
            />
            <label
              htmlFor="ownershipProof"
              className="block border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm text-gray-600">Click to add proof document</p>
              <p className="text-xs text-gray-500 mt-1">Image or PDF</p>
            </label>
            {ownerProofFileName && (
              <div className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <span>Selected: {ownerProofFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setOwnerProofFileName('');
                    if (ownerProofInputRef.current) {
                      ownerProofInputRef.current.value = '';
                    }
                  }}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-green-100"
                  aria-label="Remove selected file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">Upload a clear verification document (image or PDF).</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" name="contact" required />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
      </div>
    </form>
  );
}