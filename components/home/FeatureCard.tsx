import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor?: string;
}

export function FeatureCard({ icon: Icon, title, description, bgColor = "bg-muted/30" }: FeatureCardProps) {
  return (
    <Card className={bgColor}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
