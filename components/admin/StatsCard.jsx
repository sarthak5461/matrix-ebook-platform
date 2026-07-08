import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ icon: Icon, label, value, accent }) {
  return (
    <Card>
      <CardContent className='pt-6 flex items-center gap-4'>
        <div
          className={`h-12 w-12 rounded-lg flex items-center justify-center ${accent}`}
        >
          <Icon className='h-6 w-6' />
        </div>

        <div>
          <div className='text-sm text-muted-foreground'>{label}</div>

          <div className='text-2xl font-bold'>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
