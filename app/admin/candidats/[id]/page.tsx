import CandidateProfile from "@/components/admin/CandidateProfile";

export default async function CandidatePage(props: PageProps<"/admin/candidats/[id]">) {
  const { id } = await props.params;
  return <CandidateProfile userId={id} />;
}
