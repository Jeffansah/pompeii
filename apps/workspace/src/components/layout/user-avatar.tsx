import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { avatarInitials } from "@/lib/auth/avatar";

export function UserAvatar() {
  const { user, isUserLoading } = useCurrentUser();

  if (isUserLoading) {
    return <Skeleton className="size-10 rounded-full" />;
  }

  if (user === null) {
    return null;
  }

  const label = user.name.trim() || user.email;
  const image = user.image ?? undefined;

  return (
    <Avatar className="size-10" aria-label={label}>
      {image ? <AvatarImage alt="" src={image} /> : null}
      <AvatarFallback className="bg-primary font-serif text-sm text-white">
        {avatarInitials(user.name, user.email)}
      </AvatarFallback>
    </Avatar>
  );
}
