import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Brain, Lightbulb, TrendingUp } from "lucide-react";

interface AdminAISummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
}

export const AdminAISummaryCard: React.FC<AdminAISummaryCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (title.toLowerCase()) {
      case 'insights':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'trends':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`mt-2 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value} from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAISummaryCard;
