"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ProfileImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string
  name: string
}

export function ProfileImageModal({ isOpen, onClose, imageUrl, name }: ProfileImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative w-full aspect-square bg-(--color-muted)">
          {imageUrl ? (
            <img src={imageUrl || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-9xl font-bold text-(--color-text-tertiary)">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
