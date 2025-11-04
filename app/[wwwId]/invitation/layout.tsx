import { InvitationProvider } from '@/components/invitation-context';

export default function DynamicInvitationLayout({
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
