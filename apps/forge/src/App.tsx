import ForgeIdeaGeneratorApp from "./features/idea-generator/ui/ForgeIdeaGeneratorApp";
import AnalyticsDashboard from "./features/analytics/ui/AnalyticsDashboard";
import NovaReplayTemplateModule from "./features/replay-template/ui/NovaReplayTemplateModule";

export default function App(): JSX.Element {
  return (
    <>
      <ForgeIdeaGeneratorApp />
      <NovaReplayTemplateModule />
      <AnalyticsDashboard />
    </>
  );
}
