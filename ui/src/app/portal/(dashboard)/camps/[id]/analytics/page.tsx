import CampAnalyticsPageContent from './CampAnalyticsClient'

export default async function CampAnalyticsPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <CampAnalyticsPageContent campId={id} />
}
