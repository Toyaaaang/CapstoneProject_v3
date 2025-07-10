"use client";

import { useState, useCallback, useEffect } from "react";
import { UserCircle, LogOut, Signature, UserPen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ESignatureRecorder from "@/components/shared/accounts/Esignaturerecorder";
import EditNameDialog from "@/components/shared/accounts/EditAccount";
import useLogout from "@/hooks/useLogout";
import axios from "@/lib/axios";

export default function AccountPopover() {
  const [isSignatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setEditAccountDialogOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { logout } = useLogout();

  const handleSignatureFetched = useCallback(() => {
    setHasSignature(true);
  }, []);

  const handleLogout = async () => {
    logout();
  };

  // Fetch name data when opening edit dialog
  useEffect(() => {
    if (isEditAccountDialogOpen) {
      axios.get("/authentication/account/").then((res) => {
        const data = res.data as { first_name: string; last_name: string };
        setFirstName(data.first_name);
        setLastName(data.last_name);
      });
    }
  }, [isEditAccountDialogOpen]);

  // Fetch signature URL when opening signature dialog
  useEffect(() => {
    if (isSignatureDialogOpen) {
      axios.get("/authentication/get-signature/").then((res) => {
        setSignatureUrl(res.data.signature || undefined);
        setHasSignature(!!res.data.signature);
      });
    }
  }, [isSignatureDialogOpen]);

  useEffect(() => {
    // Fetch signature status on mount
    axios.get("/authentication/get-signature/").then((res) => {
      setSignatureUrl(res.data.signature || undefined);
      setHasSignature(!!res.data.signature);
    });
  }, []);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-2 relative group">
            <UserCircle className="h-6 w-6 text-blue-300 transition-colors duration-200 group-hover:text-black" />
            {!hasSignature && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full select-none" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-55">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setEditAccountDialogOpen(true)}
              >
                <UserPen className="mr-2 h-4 w-4" />
                Edit Account
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start relative"
                onClick={() => setSignatureDialogOpen(true)}
              >
                <Signature className="mr-2 h-4 w-4" />
                Add E-Signature
                {!hasSignature && (
                  <span className="absolute top-1/2 right-1 ml-8 transform -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </li>
          </ul>
        </PopoverContent>
      </Popover>

      {/* E-Signature Recorder Dialog */}
      <ESignatureRecorder
        isOpen={isSignatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSignatureFetched={handleSignatureFetched}
        existingSignatureUrl={signatureUrl} // Pass the fetched signature URL
      />

      {/* Edit Account Dialog */}
      <EditNameDialog
        open={isEditAccountDialogOpen}
        onOpenChange={setEditAccountDialogOpen}
        initialFirstName={firstName}
        initialLastName={lastName}
      />
    </>
  );
}
