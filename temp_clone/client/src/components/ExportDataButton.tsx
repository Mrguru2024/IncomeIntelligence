import React, { useState } from "react";
import { DownloadIcon, FileDownIcon, CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ExportableData,
  exportToCSV,
  exportToPDF,
  ExportOptions,
} from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

interface ExportDataButtonProps {
  data: ExportableData;
  options: Omit<ExportOptions, "fileName">;
  className?: string;
  fileNamePrefix: string;
}

const ExportDataButton: React.FC<ExportDataButtonProps> = ({
  data,
  options,
  className = "",
  fileNamePrefix,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setIsExporting(true);

      // Generate a filename with the current date
      const date = new Date().toISOString().split("T")[0];
      const fileName = `${fileNamePrefix}_${date}`;

      const exportOptions: ExportOptions = {
        ...options,
        fileName,
      };

      // Export based on the selected format
      if (format === "csv") {
        exportToCSV(data, exportOptions);
        toast({
          title: "CSV Export Successful",
          description: `Your data has been exported as ${fileName}.csv`,
          variant: "default",
        });
      } else {
        exportToPDF(data, exportOptions);
        toast({
          title: "PDF Export Successful",
          description: `Your data has been exported as ${fileName}.pdf`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`${className}`}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting || data.data.length === 0}
          className="flex items-center cursor-pointer"
        >
          <FileDownIcon className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting || data.data.length === 0}
          className="flex items-center cursor-pointer"
        >
          <FileDownIcon className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDataButton;
