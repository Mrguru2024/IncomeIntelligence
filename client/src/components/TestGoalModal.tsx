import React from "react";
import { Button } from "@/components/ui/button";
import { BasicModal } from "./BasicModal";

interface TestGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestGoalModal({ isOpen, onClose }: TestGoalModalProps) {
  console.log("TestGoalModal rendered with isOpen:", isOpen);

  return (
    <BasicModal isOpen={isOpen} onClose={onClose} title="Create New Goal">
      <div className="space-y-4">
        <p>This is a test modal to create a new goal.</p>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              alert("Goal created!");
              onClose();
            }}
          >
            Create Goal
          </Button>
        </div>
      </div>
    </BasicModal>
  );
}
