'use client';

import { Shield, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function StepUpAuthModal({ 
  isOpen, 
  onClose, 
  onApprove,
  action,
  riskScore 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onApprove: () => void;
  action: string;
  riskScore: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-console">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-orange-500" />
            <DialogTitle className="font-space-mono text-xl">High-Risk Action Detected</DialogTitle>
          </div>
          <DialogDescription className="font-ibm-plex-mono mt-4">
            <div className="bg-pale border-2 border-console p-4 mb-4">
              <p className="font-semibold mb-2">Action: {action}</p>
              <p className="text-sm text-console/70">Risk Level: <span className="text-orange-500 font-bold">{riskScore}</span></p>
            </div>
            
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                This action requires additional verification. In production, Auth0 Guardian 
                would send a push notification to your device for approval.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-2 border-console"
          >
            Cancel
          </Button>
          <Button 
            onClick={onApprove}
            className="bg-console text-pale border-2 border-console hover:bg-mint hover:text-console"
          >
            🔐 Approve with Guardian (Demo)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
