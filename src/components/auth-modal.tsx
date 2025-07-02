"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    CheckCircle,
    Copy,
    ExternalLink,
    Github,
    Info,
    RefreshCw,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface AuthStatus {
  isAuthenticated: boolean;
  token?: string;
  status?: any;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'init' | 'device-code' | 'verifying' | 'success' | 'error'>('init');
  const [deviceCode, setDeviceCode] = useState<DeviceCodeResponse | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const initiateAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/github', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDeviceCode(data);
        setStep('device-code');
        setCountdown(data.expires_in);
        toast.success('GitHub authentication initiated');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Auth initiation error:', error);
      toast.error('Failed to initiate authentication');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAuth = async () => {
    if (!deviceCode) return;
    
    setIsLoading(true);
    setStep('verifying');
    
    try {
      const response = await fetch(`/api/auth/github?device_code=${deviceCode.device_code}`);
      const data = await response.json();
      
      if (data.success && data.access_token) {
        setAuthStatus({
          isAuthenticated: true,
          token: data.access_token,
          status: data.memory_lol_status
        });
        setStep('success');
        toast.success('Authentication successful!');
        onAuthSuccess(data.access_token);
      } else {
        // Don't throw error for "Authentication not completed" - this is expected
        if (data.error === 'Authentication not completed') {
          setStep('device-code');
          // Don't show error toast for this case
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      }
    } catch (error: any) {
      console.error('Auth verification error:', error);
      toast.error('Authentication failed. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyUserCode = () => {
    if (deviceCode?.user_code) {
      navigator.clipboard.writeText(deviceCode.user_code);
      toast.success('User code copied to clipboard');
    }
  };

  const copyToken = () => {
    if (authStatus.token) {
      navigator.clipboard.writeText(authStatus.token);
      toast.success('Token copied to clipboard');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && step === 'device-code') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);

  // Auto-verify every 5 seconds when in device-code step
  useEffect(() => {
    if (step === 'device-code' && deviceCode) {
      const interval = setInterval(() => {
        verifyAuth();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [step, deviceCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>GitHub Authentication</span>
          </CardTitle>
          <CardDescription>
            Authenticate with GitHub to access full Memory.lol data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'init' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Full access to 12 years of historical data</p>
                <p>• 542M+ screen names across 443M+ accounts</p>
                <p>• No private data access required</p>
              </div>
              
              <Button 
                onClick={initiateAuth} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Initiating...</span>
                  </div>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Start GitHub Authentication
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          )}

          {step === 'device-code' && deviceCode && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">User Code</Label>
                  <Button variant="ghost" size="sm" onClick={copyUserCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="font-mono text-lg bg-background p-2 rounded border text-center">
                  {deviceCode.user_code}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Visit <a href={deviceCode.verification_uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-1">
                    <span>GitHub Device Login</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Enter the user code above
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Authorize MemoryLoler (no private data access required)
                </p>
                <p className="text-sm text-muted-foreground">
                  4. Wait for automatic verification (checking every 5 seconds)
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center space-x-2 text-blue-800 mb-1">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Important</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    After authorization, your account may need approval for full access. 
                    This is a manual process by the Memory.lol team.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time remaining:</span>
                <span className={countdown < 60 ? "text-destructive" : ""}>
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button onClick={verifyAuth} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
              <p>Verifying authentication...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Authentication Failed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                There was an issue with the authentication process. Please try again.
              </p>
              <div className="flex space-x-2">
                <Button onClick={initiateAuth} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && authStatus.token && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Authentication Successful!</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Access Token</Label>
                  <Button variant="ghost" size="sm" onClick={copyToken}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="font-mono text-xs bg-background p-2 rounded border break-all">
                  {authStatus.token.substring(0, 20)}...
                </div>
              </div>

              {authStatus.status && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Memory.lol Status</Label>
                  <div className="text-sm text-muted-foreground">
                    <p>Access Level: {authStatus.status.access_level || 'Unknown'}</p>
                    <p>User: {authStatus.status.user || 'Unknown'}</p>
                  </div>
                </div>
              )}

              <Button onClick={onClose} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Authentication Failed</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the issue persists.
              </p>

              <div className="flex space-x-2">
                <Button onClick={initiateAuth} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 