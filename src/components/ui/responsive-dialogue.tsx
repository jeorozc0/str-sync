"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query"; // Assuming you have this hook
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsiveConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>; // Function to call when confirmed
  isConfirming?: boolean; // Optional loading state for confirm button
  confirmVariant?: ButtonProps['variant']; // Allow customizing confirm button style (e.g., 'destructive')
  // children?: React.ReactNode; // Optional: Could add a trigger later if needed
}

export function ResponsiveConfirm({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isConfirming = false,
  confirmVariant,
}: ResponsiveConfirmProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent any default form submission if nested
    if (isConfirming) return; // Prevent double clicks
    void Promise.resolve(onConfirm()); // Call the confirm handler (allow async)
    // Note: Closing the dialog/drawer is handled by the parent via onOpenChange
    // or within the onConfirm handler itself if needed after async op.
  };

  const content = (
    <>
      {/* Using AlertDialog structure as the base for content */}
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => onOpenChange(false)}
          disabled={isConfirming}
        >
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction // Use AlertDialogAction for styling consistency
          onClick={handleConfirm}
          disabled={isConfirming}
          // Apply variant directly if needed, or rely on parent styling
          className={cn(
            confirmVariant === 'destructive' && "bg-red-600 hover:bg-red-700 text-white",
            // Add other variant styles if necessary
          )}
        // variant={confirmVariant} // Or pass variant directly if Button accepts it
        >
          {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConfirming ? 'Processing...' : confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );

  const drawerContent = (
    <>
      <DrawerHeader className="text-left">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter className="pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isConfirming}
          variant={confirmVariant ?? "default"} // Apply variant
          className={cn(
            "w-full",
            confirmVariant === 'destructive' && "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
          )}
        >
          {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConfirming ? 'Processing...' : confirmText}
        </Button>
        <DrawerClose asChild>
          <Button variant="outline" className="w-full" disabled={isConfirming}>
            {cancelText}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );


  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-[#111] border-[#333] text-white">
          {content}
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#111] border-[#333] text-white">
        {drawerContent}
      </DrawerContent>
    </Drawer>
  );
}
