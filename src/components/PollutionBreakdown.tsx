import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Factory, Info } from "lucide-react";

const data = [
  { name: "Vehicular Traffic", value: 35, color: "hsl(0, 80%, 55%)" },
  { name: "Industrial Emissions", value: 25, color: "hsl(25, 95%, 55%)" },
  { name: "Construction Dust", value: 18, color: "hsl(45, 93%, 50%)" },
  { name: "Crop Burning", value: 14, color: "hsl(190, 80%, 50%)" },
  { name: "Domestic Heating", value: 8, color: "hsl(142, 70%, 45%)" },
];

const PollutionBreakdown = () => {
  return (
    <div className="glass-card-strong p-6 space-y-4">
      <h2 className="section-title text-foreground flex items-center gap-2">
        <Factory className="w-5 h-5 text-primary" />
        Pollution Source Breakdown
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 25%, 12%)",
                  border: "1px solid hsl(222, 20%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(210, 20%, 92%)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-semibold font-mono text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Key Contributor:</strong> Vehicular traffic accounts for 35% of total pollution,
          making transport emissions the single largest contributor to poor air quality in the region.
        </p>
      </div>
    </div>
  );
};

export default PollutionBreakdown;
