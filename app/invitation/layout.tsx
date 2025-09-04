import { InvitationProvider } from '@/components/invitation-context';

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InvitationProvider>
      {children}
    </InvitationProvider>
  );
}
