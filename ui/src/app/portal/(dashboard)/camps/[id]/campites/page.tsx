import CampCampitesPageContent from './CampCampitesClient'

export default async function CampCampitesPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <CampCampitesPageContent campId={id} />
}
