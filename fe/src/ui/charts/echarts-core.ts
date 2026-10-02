// Only the pieces we use, so the chart bundle stays small.
import { LineChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";

echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, SVGRenderer]);

export { echarts };
