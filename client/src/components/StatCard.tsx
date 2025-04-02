import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  changeValue: number;
  changeText: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  changeValue,
  changeText
}: StatCardProps) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <span className="text-2xl font-semibold text-gray-800 mt-1">{value}</span>
          </div>
          <div className={`rounded-full bg-${iconBgColor} p-3`}>
            <i className={`fas fa-${icon} text-${iconColor}`}></i>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
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
