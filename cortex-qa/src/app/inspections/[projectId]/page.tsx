import { InspectionWizardClient } from './InspectionWizardClient';

export default async function Page(props: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await props.params;
  return <InspectionWizardClient projectId={projectId} />;
}
