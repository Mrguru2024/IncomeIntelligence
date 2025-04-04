import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  changeValue: number;
  changeText: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  changeValue,
  changeText,
  className
}: StatCardProps) {
  return (
    <Card className={cn("border border-gray-100", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-gray-500">{title}</span>
            <span className="text-xl sm:text-2xl font-semibold text-gray-800 mt-1">{value}</span>
          </div>
          <div className={`rounded-full bg-${iconBgColor} p-2 sm:p-3`}>
            <i className={`fas fa-${icon} text-${iconColor} text-sm sm:text-base`}></i>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
          <span className="text-green-500 flex items-center">
            <i className="fas fa-arrow-up mr-1"></i>
            {changeValue}%
          </span>
          <span className="text-gray-500 ml-2">{changeText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
