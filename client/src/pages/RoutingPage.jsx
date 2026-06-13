import { PageHeader, ProcessStepCard } from "../components";

const RoutingPage = () => {
  return (
    <div className="bg-amazonclone-background min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6">
        <PageHeader
          title="Smart Routing"
          subtitle="Every returned item is automatically routed to its best next destination — reducing waste and recovering value."
        />
        <div className="flex flex-col">
          <ProcessStepCard
            step={1}
            title="Item received"
            description="A returned item arrives at a ReCircle processing centre and is scanned."
          />
          <ProcessStepCard
            step={2}
            title="AI condition check"
            description="The AI Grading system assesses condition, completeness, and functionality."
          />
          <ProcessStepCard
            step={3}
            title="Routing decision"
            description="Based on the grade, the item is routed to resale, repair, recycling, or donation."
          />
          <ProcessStepCard
            step={4}
            title="Outcome tracked"
            description="The outcome is logged in the item's Product Passport and counted toward sustainability savings."
          />
        </div>
      </div>
    </div>
  );
};

export default RoutingPage;
